import debug from 'debug'
import { EventEmitter } from 'events'
import errcode from 'err-code'
import { pipe } from 'it-pipe'
import Queue from 'p-queue'
import { MulticodecTopology } from 'libp2p-topology/multicodec-topology'
import { codes } from './errors.js'
import { RPC, IRPC } from './message/rpc.js'
import { PeerStreams } from './peer-streams.js'
import * as utils from './utils.js'
import type { PeerId } from 'libp2p-interfaces/peer-id'
import type { Registrar, IncomingStreamEvent } from 'libp2p-interfaces/registrar'
import type { Connection } from 'libp2p-interfaces/connection'
import type BufferList from 'bl'
import {
  signMessage,
  verifySignature
} from './message/sign.js'
import type { PubSub, Message, StrictNoSign, StrictSign, PubsubOptions } from 'libp2p-interfaces/pubsub'
import type { Startable } from 'libp2p-interfaces'

export interface TopicValidator { (topic: string, message: Message): Promise<void> }

/**
 * PubsubBaseProtocol handles the peers and connections logic for pubsub routers
 * and specifies the API that pubsub routers should have.
 */
export abstract class PubsubBaseProtocol extends EventEmitter implements PubSub, Startable {
  public peerId: PeerId
  public started: boolean
  /**
   * Map of topics to which peers are subscribed to
   */
  public topics: Map<string, Set<string>>
  /**
   * List of our subscriptions
   */
  public subscriptions: Set<string>
  /**
   * Map of peer streams
   */
  public peers: Map<string, PeerStreams>
  /**
   * The signature policy to follow by default
   */
  public globalSignaturePolicy: StrictNoSign | StrictSign
  /**
   * If router can relay received messages, even if not subscribed
   */
  public canRelayMessage: boolean
  /**
   * if publish should emit to self, if subscribed
   */
  public emitSelf: boolean
  /**
   * Topic validator map
   *
   * Keyed by topic
   * Topic validators are functions with the following input:
   */
  public topicValidators: Map<string, TopicValidator>
  public queue: Queue
  public registrar: Registrar

  protected log: debug.Debugger & { err: debug.Debugger }
  protected multicodecs: string[]
  protected _libp2p: any
  private _registrarId: string | undefined

  constructor (props: PubsubOptions) {
    super()

    const {
      debugName = 'libp2p:pubsub',
      multicodecs = [],
      libp2p = null,
      globalSignaturePolicy = 'StrictSign',
      canRelayMessage = false,
      emitSelf = false,
      messageProcessingConcurrency = 10
    } = props

    this.log = Object.assign(debug(debugName), {
      err: debug(`${debugName}:error`)
    })

    this.multicodecs = utils.ensureArray(multicodecs)
    this._libp2p = libp2p
    this.registrar = libp2p.registrar
    this.peerId = libp2p.peerId
    this.started = false
    this.topics = new Map()
    this.subscriptions = new Set()
    this.peers = new Map()
    this.globalSignaturePolicy = globalSignaturePolicy === 'StrictNoSign' ? 'StrictNoSign' : 'StrictSign'
    this.canRelayMessage = canRelayMessage
    this.emitSelf = emitSelf
    this.topicValidators = new Map()
    this.queue = new Queue({ concurrency: messageProcessingConcurrency })

    this._onIncomingStream = this._onIncomingStream.bind(this)
    this._onPeerConnected = this._onPeerConnected.bind(this)
    this._onPeerDisconnected = this._onPeerDisconnected.bind(this)
  }

  // LIFECYCLE METHODS

  /**
   * Register the pubsub protocol onto the libp2p node.
   *
   * @returns {void}
   */
  start () {
    if (this.started) {
      return
    }

    this.log('starting')

    // Incoming streams
    // Called after a peer dials us
    this.registrar.handle(this.multicodecs, this._onIncomingStream)

    // register protocol with topology
    // Topology callbacks called on connection manager changes
    const topology = new MulticodecTopology({
      multicodecs: this.multicodecs,
      handlers: {
        onConnect: this._onPeerConnected,
        onDisconnect: this._onPeerDisconnected
      }
    })
    this._registrarId = this.registrar.register(topology)

    this.log('started')
    this.started = true
  }

  /**
   * Unregister the pubsub protocol and the streams with other peers will be closed.
   *
   * @returns {void}
   */
  stop () {
    if (!this.started) {
      return
    }

    // unregister protocol and handlers
    if (this._registrarId != null) {
      this.registrar.unregister(this._registrarId)
    }

    this.log('stopping')
    this.peers.forEach((peerStreams) => peerStreams.close())

    this.peers = new Map()
    this.subscriptions = new Set()
    this.started = false
    this.log('stopped')
  }

  isStarted () {
    return this.started
  }

  /**
   * On an inbound stream opened
   */
  protected _onIncomingStream ({ protocol, stream, connection }: IncomingStreamEvent) {
    const peerId = connection.remotePeer
    const idB58Str = peerId.toB58String()
    const peer = this._addPeer(peerId, protocol)
    const inboundStream = peer.attachInboundStream(stream)

    this._processMessages(idB58Str, inboundStream, peer)
      .catch(err => this.log(err))
  }

  /**
   * Registrar notifies an established connection with pubsub protocol
   */
  protected async _onPeerConnected (peerId: PeerId, conn: Connection) {
    const idB58Str = peerId.toB58String()
    this.log('connected', idB58Str)

    try {
      const { stream, protocol } = await conn.newStream(this.multicodecs)
      const peer = this._addPeer(peerId, protocol)
      await peer.attachOutboundStream(stream)
    } catch (err: any) {
      this.log.err(err)
    }

    // Immediately send my own subscriptions to the newly established conn
    this._sendSubscriptions(idB58Str, Array.from(this.subscriptions), true)
  }

  /**
   * Registrar notifies a closing connection with pubsub protocol
   */
  protected _onPeerDisconnected (peerId: PeerId, conn?: Connection) {
    const idB58Str = peerId.toB58String()

    this.log('connection ended', idB58Str)
    this._removePeer(peerId)
  }

  /**
   * Notifies the router that a peer has been connected
   */
  protected _addPeer (peerId: PeerId, protocol: string) {
    const id = peerId.toB58String()
    const existing = this.peers.get(id)

    // If peer streams already exists, do nothing
    if (existing != null) {
      return existing
    }

    // else create a new peer streams
    this.log('new peer', id)

    const peerStreams = new PeerStreams({
      id: peerId,
      protocol
    })

    this.peers.set(id, peerStreams)
    peerStreams.once('close', () => this._removePeer(peerId))

    return peerStreams
  }

  /**
   * Notifies the router that a peer has been disconnected
   */
  protected _removePeer (peerId: PeerId) {
    const id = peerId.toB58String()
    const peerStreams = this.peers.get(id)
    if (peerStreams == null) return

    // close peer streams
    peerStreams.removeAllListeners()
    peerStreams.close()

    // delete peer streams
    this.log('delete peer', id)
    this.peers.delete(id)

    // remove peer from topics map
    for (const peers of this.topics.values()) {
      peers.delete(id)
    }

    return peerStreams
  }

  // MESSAGE METHODS

  /**
   * Responsible for processing each RPC message received by other peers.
   */
  async _processMessages (idB58Str: string, stream: AsyncIterable<Uint8Array|BufferList>, peerStreams: PeerStreams) {
    try {
      await pipe(
        stream,
        async (source) => {
          for await (const data of source) {
            const rpcBytes = data instanceof Uint8Array ? data : data.slice()
            const rpcMsg = this._decodeRpc(rpcBytes)

            // Since _processRpc may be overridden entirely in unsafe ways,
            // the simplest/safest option here is to wrap in a function and capture all errors
            // to prevent a top-level unhandled exception
            // This processing of rpc messages should happen without awaiting full validation/execution of prior messages
            this._processRpc(idB58Str, peerStreams, rpcMsg)
              .catch(err => this.log(err))
          }
        }
      )
    } catch (err: any) {
      this._onPeerDisconnected(peerStreams.id, err)
    }
  }

  /**
   * Handles an rpc request from a peer
   */
  async _processRpc (idB58Str: string, peerStreams: PeerStreams, rpc: RPC) {
    this.log('rpc from', idB58Str)
    const subs = rpc.subscriptions
    const msgs = rpc.msgs

    if (subs.length > 0) {
      // update peer subscriptions
      subs.forEach((subOpt) => {
        this._processRpcSubOpt(idB58Str, subOpt)
      })
      this.emit('pubsub:subscription-change', { peerId: peerStreams.id, subscriptions: subs })
    }

    if (!this._acceptFrom(idB58Str)) {
      this.log('received message from unacceptable peer %s', idB58Str)
      return false
    }

    if (msgs.length > 0) {
      this.queue.addAll(msgs.map(message => async () => {
        const topics = message.topicIDs != null ? message.topicIDs : []
        const hasSubscription = topics.some((topic) => this.subscriptions.has(topic))

        if (!hasSubscription && !this.canRelayMessage) {
          this.log('received message we didn\'t subscribe to. Dropping.')
          return
        }

        try {
          const msg = utils.normalizeInRpcMessage(message, idB58Str)

          await this._processRpcMessage(msg)
        } catch (err: any) {
          this.log.err(err)
        }
      }))
        .catch(err => this.log(err))
    }
    return true
  }

  /**
   * Handles a subscription change from a peer
   */
  _processRpcSubOpt (id: string, subOpt: RPC.ISubOpts) {
    const t = subOpt.topicID

    if (t == null) {
      return
    }

    let topicSet = this.topics.get(t)
    if (topicSet == null) {
      topicSet = new Set()
      this.topics.set(t, topicSet)
    }

    if (subOpt.subscribe === true) {
      // subscribe peer to new topic
      topicSet.add(id)
    } else {
      // unsubscribe from existing topic
      topicSet.delete(id)
    }
  }

  /**
   * Handles an message from a peer
   */
  async _processRpcMessage (msg: Message) {
    if ((msg.from != null) && this.peerId.equals(msg.from) && !this.emitSelf) {
      return
    }

    // Ensure the message is valid before processing it
    try {
      await this.validate(msg)
    } catch (err: any) {
      this.log('Message is invalid, dropping it. %O', err)
      return
    }

    // Emit to self
    this._emitMessage(msg)

    return await this._publish(utils.normalizeOutRpcMessage(msg))
  }

  /**
   * Emit a message from a peer
   */
  _emitMessage (message: Message) {
    message.topicIDs.forEach((topic) => {
      if (this.subscriptions.has(topic)) {
        this.emit(topic, message)
      }
    })
  }

  /**
   * The default msgID implementation
   * Child class can override this.
   */
  getMsgId (msg: Message) {
    const signaturePolicy = this.globalSignaturePolicy
    switch (signaturePolicy) {
      case 'StrictSign':
        // @ts-expect-error seqno is optional in protobuf definition but it will exist
        return utils.msgId(msg.from, msg.seqno)
      case 'StrictNoSign':
        return utils.noSignMsgId(msg.data)
      default:
        throw errcode(new Error('Cannot get message id: unhandled signature policy'), codes.ERR_UNHANDLED_SIGNATURE_POLICY)
    }
  }

  /**
   * Whether to accept a message from a peer
   * Override to create a graylist
   */
  _acceptFrom (id: string) {
    return true
  }

  /**
   * Decode Uint8Array into an RPC object.
   * This can be override to use a custom router protobuf.
   */
  _decodeRpc (bytes: Uint8Array) {
    return RPC.decode(bytes)
  }

  /**
   * Encode RPC object into a Uint8Array.
   * This can be override to use a custom router protobuf.
   */
  _encodeRpc (rpc: IRPC) {
    return RPC.encode(rpc).finish()
  }

  /**
   * Send an rpc object to a peer
   */
  _sendRpc (id: string, rpc: IRPC) {
    const peerStreams = this.peers.get(id)
    if ((peerStreams == null) || !peerStreams.isWritable) {
      const msg = `Cannot send RPC to ${id} as there is no open stream to it available`

      this.log.err(msg)
      return
    }
    peerStreams.write(this._encodeRpc(rpc))
  }

  /**
   * Send subscriptions to a peer
   */
  _sendSubscriptions (id: string, topics: string[], subscribe: boolean) {
    return this._sendRpc(id, {
      subscriptions: topics.map(t => ({ topicID: t, subscribe: subscribe }))
    })
  }

  /**
   * Validates the given message. The signature will be checked for authenticity.
   * Throws an error on invalid messages
   */
  async validate (message: Message) { // eslint-disable-line require-await
    const signaturePolicy = this.globalSignaturePolicy
    switch (signaturePolicy) {
      case 'StrictNoSign':
        if (message.from != null) {
          throw errcode(new Error('StrictNoSigning: from should not be present'), codes.ERR_UNEXPECTED_FROM)
        }
        if (message.signature != null) {
          throw errcode(new Error('StrictNoSigning: signature should not be present'), codes.ERR_UNEXPECTED_SIGNATURE)
        }
        if (message.key != null) {
          throw errcode(new Error('StrictNoSigning: key should not be present'), codes.ERR_UNEXPECTED_KEY)
        }
        if (message.seqno != null) {
          throw errcode(new Error('StrictNoSigning: seqno should not be present'), codes.ERR_UNEXPECTED_SEQNO)
        }
        break
      case 'StrictSign':
        if (message.signature == null) {
          throw errcode(new Error('StrictSigning: Signing required and no signature was present'), codes.ERR_MISSING_SIGNATURE)
        }
        if (message.seqno == null) {
          throw errcode(new Error('StrictSigning: Signing required and no seqno was present'), codes.ERR_MISSING_SEQNO)
        }
        if (!(await verifySignature(message))) {
          throw errcode(new Error('StrictSigning: Invalid message signature'), codes.ERR_INVALID_SIGNATURE)
        }
        break
      default:
        throw errcode(new Error('Cannot validate message: unhandled signature policy'), codes.ERR_UNHANDLED_SIGNATURE_POLICY)
    }

    for (const topic of message.topicIDs) {
      const validatorFn = this.topicValidators.get(topic)
      if (validatorFn != null) {
        await validatorFn(topic, message)
      }
    }
  }

  /**
   * Normalizes the message and signs it, if signing is enabled.
   * Should be used by the routers to create the message to send.
   */
  protected async _buildMessage (message: Message) {
    const signaturePolicy = this.globalSignaturePolicy
    switch (signaturePolicy) {
      case 'StrictSign':
        message.from = this.peerId.toBytes()
        message.seqno = utils.randomSeqno()
        return await signMessage(this.peerId, message)
      case 'StrictNoSign':
        return await Promise.resolve(message)
      default:
        throw errcode(new Error('Cannot build message: unhandled signature policy'), codes.ERR_UNHANDLED_SIGNATURE_POLICY)
    }
  }

  // API METHODS

  /**
   * Get a list of the peer-ids that are subscribed to one topic.
   */
  getSubscribers (topic: string) {
    if (!this.started) {
      throw errcode(new Error('not started yet'), 'ERR_NOT_STARTED_YET')
    }

    if (topic == null) {
      throw errcode(new Error('topic is required'), 'ERR_NOT_VALID_TOPIC')
    }

    const peersInTopic = this.topics.get(topic)

    if (peersInTopic == null) {
      return []
    }

    return Array.from(peersInTopic)
  }

  /**
   * Publishes messages to all subscribed peers
   * Return a set of peers that this message sent to
   */
  async publish (topic: string, message: Uint8Array): Promise<Set<string>> {
    if (!this.started) {
      throw new Error('Pubsub has not started')
    }

    this.log('publish', topic, message)

    const from = this.peerId.toB58String()
    const msgObject = {
      receivedFrom: from,
      data: message,
      topicIDs: [topic]
    }

    // ensure that the message follows the signature policy
    const outMsg = await this._buildMessage(msgObject)
    const msg = utils.normalizeInRpcMessage(outMsg)

    // Emit to self if I'm interested and emitSelf enabled
    this.emitSelf && this._emitMessage(msg)

    // send to all the other peers
    return await this._publish(msg)
  }

  /**
   * Overriding the implementation of publish should handle the appropriate algorithms for the publish/subscriber implementation.
   * For example, a Floodsub implementation might simply publish each message to each topic for every peer
   * Return a set of peers that this message sent to
   */
  abstract _publish (message: Message): Promise<Set<string> | undefined>

  /**
   * Subscribes to a given topic.
   */
  subscribe (topic: string) {
    if (!this.started) {
      throw new Error('Pubsub has not started')
    }

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.add(topic)
      this.peers.forEach((_, id) => this._sendSubscriptions(id, [topic], true))
    }
  }

  /**
   * Unsubscribe from the given topic.
   */
  unsubscribe (topic: string) {
    if (!this.started) {
      throw new Error('Pubsub is not started')
    }

    if (this.subscriptions.has(topic) && this.listenerCount(topic) === 0) {
      this.subscriptions.delete(topic)
      this.peers.forEach((_, id) => this._sendSubscriptions(id, [topic], false))
    }
  }

  /**
   * Get the list of topics which the peer is subscribed to.
   */
  getTopics () {
    if (!this.started) {
      throw new Error('Pubsub is not started')
    }

    return Array.from(this.subscriptions)
  }
}
