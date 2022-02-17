import { logger } from '@libp2p/logger'
import { EventEmitter, CustomEvent } from '@libp2p/interfaces'
import errcode from 'err-code'
import { pipe } from 'it-pipe'
import Queue from 'p-queue'
import { Topology } from '@libp2p/topology'
import { codes } from './errors.js'
import { PeerStreams as PeerStreamsImpl } from './peer-streams.js'
import { toRpcMessage, toMessage, ensureArray, randomSeqno, noSignMsgId, msgId } from './utils.js'
import {
  signMessage,
  verifySignature
} from './message/sign.js'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { Registrar, IncomingStreamData } from '@libp2p/interfaces/registrar'
import type { Connection } from '@libp2p/interfaces/connection'
import type { PubSub, Message, StrictNoSign, StrictSign, PubSubOptions, PubSubEvents, RPCMessage, RPC, PeerStreams, RPCSubscription } from '@libp2p/interfaces/pubsub'
import type { Logger } from '@libp2p/logger'
import { base58btc } from 'multiformats/bases/base58'
import { peerMap } from '@libp2p/peer-map'
import type { PeerMap } from '@libp2p/peer-map'
import { peerIdFromString } from '@libp2p/peer-id'
import type { IRPC } from './message/rpc.js'
import { RPC as RPCProto } from './message/rpc.js'

export interface TopicValidator { (topic: string, message: Message): Promise<void> }

/**
 * PubsubBaseProtocol handles the peers and connections logic for pubsub routers
 * and specifies the API that pubsub routers should have.
 */
export abstract class PubsubBaseProtocol<EventMap> extends EventEmitter<EventMap & PubSubEvents> implements PubSub<EventMap & PubSubEvents> {
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
  public peers: PeerMap<PeerStreams>
  /**
   * The signature policy to follow by default
   */
  public globalSignaturePolicy: typeof StrictNoSign | typeof StrictSign
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
  public multicodecs: string[]

  protected log: Logger
  protected _libp2p: any
  private _registrarHandlerId: string | undefined
  private _registrarTopologyId: string | undefined

  constructor (props: PubSubOptions) {
    super()

    const {
      debugName = 'libp2p:pubsub',
      multicodecs = [],
      peerId,
      registrar,
      globalSignaturePolicy = 'StrictSign',
      canRelayMessage = false,
      emitSelf = false,
      messageProcessingConcurrency = 10
    } = props

    this.log = logger(debugName)
    this.multicodecs = ensureArray(multicodecs)
    this.registrar = registrar
    this.peerId = peerId
    this.started = false
    this.topics = new Map()
    this.subscriptions = new Set()
    this.peers = peerMap<PeerStreams>()
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
  async start () {
    if (this.started) {
      return
    }

    this.log('starting')

    // Incoming streams
    // Called after a peer dials us
    this._registrarHandlerId = await this.registrar.handle(this.multicodecs, this._onIncomingStream)

    // register protocol with topology
    // Topology callbacks called on connection manager changes
    const topology = new Topology({
      onConnect: this._onPeerConnected,
      onDisconnect: this._onPeerDisconnected
    })
    this._registrarTopologyId = this.registrar.register(this.multicodecs, topology)

    this.log('started')
    this.started = true
  }

  /**
   * Unregister the pubsub protocol and the streams with other peers will be closed.
   */
  async stop () {
    if (!this.started) {
      return
    }

    // unregister protocol and handlers
    if (this._registrarTopologyId != null) {
      this.registrar.unregister(this._registrarTopologyId)
    }
    if (this._registrarHandlerId != null) {
      await this.registrar.unhandle(this._registrarHandlerId)
    }

    this.log('stopping')
    for (const peerStreams of this.peers.values()) {
      peerStreams.close()
    }

    this.peers.clear()
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
  protected _onIncomingStream (evt: CustomEvent<IncomingStreamData>) {
    const { protocol, stream, connection } = evt.detail
    const peerId = connection.remotePeer
    const peer = this._addPeer(peerId, protocol)
    const inboundStream = peer.attachInboundStream(stream)

    this._processMessages(peerId, inboundStream, peer)
      .catch(err => this.log(err))
  }

  /**
   * Registrar notifies an established connection with pubsub protocol
   */
  protected async _onPeerConnected (peerId: PeerId, conn: Connection) {
    this.log('connected %p', peerId)

    try {
      const { stream, protocol } = await conn.newStream(this.multicodecs)
      const peer = this._addPeer(peerId, protocol)
      await peer.attachOutboundStream(stream)
    } catch (err: any) {
      this.log.error(err)
    }

    // Immediately send my own subscriptions to the newly established conn
    this._sendSubscriptions(peerId, Array.from(this.subscriptions), true)
  }

  /**
   * Registrar notifies a closing connection with pubsub protocol
   */
  protected _onPeerDisconnected (peerId: PeerId, conn?: Connection) {
    const idB58Str = peerId.toString()

    this.log('connection ended', idB58Str)
    this._removePeer(peerId)
  }

  /**
   * Notifies the router that a peer has been connected
   */
  protected _addPeer (peerId: PeerId, protocol: string): PeerStreams {
    const existing = this.peers.get(peerId)

    // If peer streams already exists, do nothing
    if (existing != null) {
      return existing
    }

    // else create a new peer streams
    this.log('new peer %p', peerId)

    const peerStreams: PeerStreams = new PeerStreamsImpl({
      id: peerId,
      protocol
    })

    this.peers.set(peerId, peerStreams)
    peerStreams.addEventListener('close', () => this._removePeer(peerId), {
      once: true
    })

    return peerStreams
  }

  /**
   * Notifies the router that a peer has been disconnected
   */
  protected _removePeer (peerId: PeerId) {
    const id = peerId.toString()
    const peerStreams = this.peers.get(peerId)
    if (peerStreams == null) {
      return
    }

    // close peer streams
    peerStreams.close()

    // delete peer streams
    this.log('delete peer %p', peerId)
    this.peers.delete(peerId)

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
  async _processMessages (peerId: PeerId, stream: AsyncIterable<Uint8Array>, peerStreams: PeerStreams) {
    try {
      await pipe(
        stream,
        async (source) => {
          for await (const data of source) {
            const rpcMsg = this._decodeRpc(data)

            // Since _processRpc may be overridden entirely in unsafe ways,
            // the simplest/safest option here is to wrap in a function and capture all errors
            // to prevent a top-level unhandled exception
            // This processing of rpc messages should happen without awaiting full validation/execution of prior messages
            this.processRpc(peerId, peerStreams, {
              subscriptions: (rpcMsg.subscriptions).map(sub => ({
                subscribe: Boolean(sub.subscribe),
                topicID: sub.topicID ?? ''
              })),
              msgs: (rpcMsg.msgs ?? []).map(msg => ({
                from: msg.from ?? peerId.multihash.bytes,
                data: msg.data ?? new Uint8Array(0),
                topicIDs: msg.topicIDs ?? [],
                seqno: msg.seqno ?? undefined,
                signature: msg.signature ?? undefined,
                key: msg.key ?? undefined
              }))
            })
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
  async processRpc (from: PeerId, peerStreams: PeerStreams, rpc: RPC) {
    this.log('rpc from %p', from)
    const subs = rpc.subscriptions
    const msgs = rpc.msgs

    if (subs.length > 0) {
      // update peer subscriptions
      subs.forEach((subOpt) => {
        this._processRpcSubOpt(from, subOpt)
      })
      this.dispatchEvent(new CustomEvent('pubsub:subscription-change', {
        detail: { peerId: peerStreams.id, subscriptions: subs }
      }))
    }

    if (!this._acceptFrom(from)) {
      this.log('received message from unacceptable peer %p', from)
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
          const msg = toMessage({
            ...message,
            from: from.multihash.bytes
          })

          await this._processMessage(msg)
        } catch (err: any) {
          this.log.error(err)
        }
      }))
        .catch(err => this.log(err))
    }
    return true
  }

  /**
   * Handles a subscription change from a peer
   */
  _processRpcSubOpt (id: PeerId, subOpt: RPCSubscription) {
    const t = subOpt.topicID

    if (t == null) {
      return
    }

    let topicSet = this.topics.get(t)
    if (topicSet == null) {
      topicSet = new Set()
      this.topics.set(t, topicSet)
    }

    if (subOpt.subscribe) {
      // subscribe peer to new topic
      topicSet.add(id.toString())
    } else {
      // unsubscribe from existing topic
      topicSet.delete(id.toString())
    }
  }

  /**
   * Handles an message from a peer
   */
  async _processMessage (msg: Message) {
    if (this.peerId.equals(msg.from) && !this.emitSelf) {
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
    this.emitMessage(msg)

    return await this._publish(toRpcMessage(msg))
  }

  /**
   * Emit a message from a peer
   */
  emitMessage (message: Message) {
    message.topicIDs.forEach((topic) => {
      if (this.subscriptions.has(topic)) {
        this.dispatchEvent(new CustomEvent(topic, {
          detail: message
        }))
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
        if (msg.seqno == null) {
          throw errcode(new Error('Need seqno when signature policy is StrictSign but it was missing'), codes.ERR_MISSING_SEQNO)
        }

        return msgId(msg.from, msg.seqno)
      case 'StrictNoSign':
        return noSignMsgId(msg.data)
      default:
        throw errcode(new Error('Cannot get message id: unhandled signature policy'), codes.ERR_UNHANDLED_SIGNATURE_POLICY)
    }
  }

  /**
   * Whether to accept a message from a peer
   * Override to create a graylist
   */
  _acceptFrom (id: PeerId) {
    return true
  }

  /**
   * Decode Uint8Array into an RPC object.
   * This can be override to use a custom router protobuf.
   */
  _decodeRpc (bytes: Uint8Array) {
    return RPCProto.decode(bytes)
  }

  /**
   * Encode RPC object into a Uint8Array.
   * This can be override to use a custom router protobuf.
   */
  _encodeRpc (rpc: IRPC) {
    return RPCProto.encode(rpc).finish()
  }

  /**
   * Send an rpc object to a peer
   */
  _sendRpc (peer: PeerId, rpc: IRPC) {
    const peerStreams = this.peers.get(peer)

    if (peerStreams == null || !peerStreams.isWritable) {
      const msg = `Cannot send RPC to ${peer.toString(base58btc)} as there is no open stream to it available`

      this.log.error(msg)
      return
    }

    peerStreams.write(this._encodeRpc(rpc))
  }

  /**
   * Send subscriptions to a peer
   */
  _sendSubscriptions (id: PeerId, topics: string[], subscribe: boolean) {
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
  protected async _maybeSignMessage (message: Message) {
    const signaturePolicy = this.globalSignaturePolicy
    switch (signaturePolicy) {
      case 'StrictSign':
        message.seqno = randomSeqno()
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

    return Array.from(peersInTopic).map(str => peerIdFromString(str))
  }

  /**
   * Publishes messages to all subscribed peers
   */
  async publish (topic: string, message: Uint8Array) {
    if (!this.started) {
      throw new Error('Pubsub has not started')
    }

    this.log('publish', topic, message)

    const msgObject = {
      from: this.peerId,
      data: message,
      topicIDs: [topic]
    }

    // ensure that the message follows the signature policy
    const msg = await this._maybeSignMessage(msgObject)

    // Emit to self if I'm interested and emitSelf enabled
    this.emitSelf && this.emitMessage(msg)

    // send to all the other peers
    await this._publish(toRpcMessage(msg))
  }

  /**
   * Overriding the implementation of publish should handle the appropriate algorithms for the publish/subscriber implementation.
   * For example, a Floodsub implementation might simply publish each message to each topic for every peer
   */
  abstract _publish (message: RPCMessage): Promise<void>

  /**
   * Subscribes to a given topic.
   */
  subscribe (topic: string) {
    if (!this.started) {
      throw new Error('Pubsub has not started')
    }

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.add(topic)

      for (const peerId of this.peers.keys()) {
        this._sendSubscriptions(peerId, [topic], true)
      }
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

      for (const peerId of this.peers.keys()) {
        this._sendSubscriptions(peerId, [topic], false)
      }
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

  getPeers () {
    if (!this.started) {
      throw new Error('Pubsub is not started')
    }

    return Array.from(this.peers.keys())
  }
}
