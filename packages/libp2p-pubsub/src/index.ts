import { logger } from '@libp2p/logger'
import { EventEmitter, CustomEvent, EventHandler } from '@libp2p/interfaces'
import errcode from 'err-code'
import { pipe } from 'it-pipe'
import Queue from 'p-queue'
import { createTopology } from '@libp2p/topology'
import { codes } from './errors.js'
import { PeerStreams as PeerStreamsImpl } from './peer-streams.js'
import { toMessage, ensureArray, randomSeqno, noSignMsgId, msgId, toRpcMessage } from './utils.js'
import {
  signMessage,
  verifySignature
} from './message/sign.js'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { Registrar, IncomingStreamData } from '@libp2p/interfaces/registrar'
import type { Connection } from '@libp2p/interfaces/connection'
import type { PubSub, Message, StrictNoSign, StrictSign, PubSubOptions, PubSubEvents, RPC, PeerStreams, RPCSubscription, RPCMessage } from '@libp2p/interfaces/pubsub'
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
export abstract class PubsubBaseProtocol<EventMap extends PubSubEvents = PubSubEvents> extends EventEmitter<EventMap & PubSubEvents> implements PubSub<EventMap & PubSubEvents> {
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
    const topology = createTopology({
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
    const peer = this.addPeer(peerId, protocol)
    const inboundStream = peer.attachInboundStream(stream)

    this.processMessages(peerId, inboundStream, peer)
      .catch(err => this.log(err))
  }

  /**
   * Registrar notifies an established connection with pubsub protocol
   */
  protected async _onPeerConnected (peerId: PeerId, conn: Connection) {
    this.log('connected %p', peerId)

    try {
      const { stream, protocol } = await conn.newStream(this.multicodecs)
      const peer = this.addPeer(peerId, protocol)
      await peer.attachOutboundStream(stream)
    } catch (err: any) {
      this.log.error(err)
    }

    // Immediately send my own subscriptions to the newly established conn
    this.send(peerId, { subscriptions: Array.from(this.subscriptions).map(sub => sub.toString()), subscribe: true })
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
  addPeer (peerId: PeerId, protocol: string): PeerStreams {
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
  async processMessages (peerId: PeerId, stream: AsyncIterable<Uint8Array>, peerStreams: PeerStreams) {
    try {
      await pipe(
        stream,
        async (source) => {
          for await (const data of source) {
            const rpcMsg = this.decodeRpc(data)
            const messages: RPCMessage[] = []

            for (const msg of (rpcMsg.messages ?? [])) {
              if (msg.from == null || msg.data == null || msg.topic == null) {
                this.log('message from %p was missing from, data or topic fields, dropping', peerId)
                continue
              }

              messages.push({
                from: msg.from,
                data: msg.data,
                topic: msg.topic,
                seqno: msg.seqno ?? undefined,
                signature: msg.signature ?? undefined,
                key: msg.key ?? undefined
              })
            }

            // Since processRpc may be overridden entirely in unsafe ways,
            // the simplest/safest option here is to wrap in a function and capture all errors
            // to prevent a top-level unhandled exception
            // This processing of rpc messages should happen without awaiting full validation/execution of prior messages
            this.processRpc(peerId, peerStreams, {
              subscriptions: (rpcMsg.subscriptions).map(sub => ({
                subscribe: Boolean(sub.subscribe),
                topic: sub.topic ?? ''
              })),
              messages
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
    if (!this.acceptFrom(from)) {
      this.log('received message from unacceptable peer %p', from)
      return
    }

    this.log('rpc from %p', from)

    const { subscriptions, messages } = rpc

    if (subscriptions.length > 0) {
      this.log('subscription update from %p', from)

      // update peer subscriptions
      subscriptions.forEach((subOpt) => {
        this.processRpcSubOpt(from, subOpt)
      })

      super.dispatchEvent(new CustomEvent('pubsub:subscription-change', {
        detail: { peerId: peerStreams.id, subscriptions }
      }))
    }

    if (messages.length > 0) {
      this.log('messages from %p', from)

      this.queue.addAll(messages.map(message => async () => {
        if (!this.subscriptions.has(message.topic) && !this.canRelayMessage) {
          this.log('received message we didn\'t subscribe to. Dropping.')
          return
        }

        try {
          const msg = await toMessage(message)

          await this.processMessage(from, msg)
        } catch (err: any) {
          this.log.error(err)
        }
      }))
        .catch(err => this.log(err))
    }
  }

  /**
   * Handles a subscription change from a peer
   */
  processRpcSubOpt (id: PeerId, subOpt: RPCSubscription) {
    const t = subOpt.topic

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
  async processMessage (from: PeerId, msg: Message) {
    if (this.peerId.equals(from) && !this.emitSelf) {
      return
    }

    // Ensure the message is valid before processing it
    try {
      await this.validate(msg)
    } catch (err: any) {
      this.log('Message is invalid, dropping it. %O', err)
      return
    }

    if (this.subscriptions.has(msg.topic)) {
      const isFromSelf = this.peerId.equals(from)

      if (!isFromSelf || this.emitSelf) {
        super.dispatchEvent(new CustomEvent(msg.topic, {
          detail: msg
        }))
      }
    }

    await this.publishMessage(from, msg)
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

        if (msg.key == null) {
          throw errcode(new Error('Need key when signature policy is StrictSign but it was missing'), codes.ERR_MISSING_KEY)
        }

        return msgId(msg.key, msg.seqno)
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
  acceptFrom (id: PeerId) {
    return true
  }

  /**
   * Decode Uint8Array into an RPC object.
   * This can be override to use a custom router protobuf.
   */
  decodeRpc (bytes: Uint8Array) {
    return RPCProto.decode(bytes)
  }

  /**
   * Encode RPC object into a Uint8Array.
   * This can be override to use a custom router protobuf.
   */
  encodeRpc (rpc: IRPC) {
    return RPCProto.encode(rpc).finish()
  }

  /**
   * Send an rpc object to a peer
   */
  send (peer: PeerId, data: { messages?: Message[], subscriptions?: string[], subscribe?: boolean }) {
    const { messages, subscriptions, subscribe } = data

    return this.sendRpc(peer, {
      subscriptions: (subscriptions ?? []).map(str => ({ topic: str, subscribe: Boolean(subscribe) })),
      messages: (messages ?? []).map(toRpcMessage)
    })
  }

  /**
   * Send an rpc object to a peer
   */
  sendRpc (peer: PeerId, rpc: IRPC) {
    const peerStreams = this.peers.get(peer)

    if (peerStreams == null || !peerStreams.isWritable) {
      const msg = `Cannot send RPC to ${peer.toString(base58btc)} as there is no open stream to it available`

      this.log.error(msg)
      return
    }

    peerStreams.write(this.encodeRpc(rpc))
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

    const validatorFn = this.topicValidators.get(message.topic)

    if (validatorFn != null) {
      await validatorFn(message.topic, message)
    }
  }

  /**
   * Normalizes the message and signs it, if signing is enabled.
   * Should be used by the routers to create the message to send.
   */
  async buildMessage (message: Message) {
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

    const peersInTopic = this.topics.get(topic.toString())

    if (peersInTopic == null) {
      return []
    }

    return Array.from(peersInTopic).map(str => peerIdFromString(str))
  }

  /**
   * Publishes messages to all subscribed peers
   */
  dispatchEvent (event: CustomEvent): boolean {
    if (!this.started) {
      throw new Error('Pubsub has not started')
    }

    const topic = event.type
    let message: Message = event.detail

    if (message instanceof Uint8Array) {
      message = {
        from: this.peerId,
        topic,
        data: message
      }
    }

    this.log('publish', topic, message)

    Promise.resolve().then(async () => {
      message = await this.buildMessage(message)

      // dispatch the event if we are interested
      if (this.emitSelf) {
        if (this.subscriptions.has(topic)) {
          super.dispatchEvent(new CustomEvent(topic, {
            detail: message
          }))

          if (this.listenerCount(topic) === 0) {
            this.unsubscribe(topic)
          }
        }
      }

      // send to all the other peers
      await this.publishMessage(this.peerId, message)
    })
      .catch(err => {
        this.log.error(err)
      })

    return true
  }

  /**
   * Overriding the implementation of publish should handle the appropriate algorithms for the publish/subscriber implementation.
   * For example, a Floodsub implementation might simply publish each message to each topic for every peer
   */
  abstract publishMessage (peerId: PeerId, message: Message): Promise<void>

  /**
   * Subscribes to a given topic.
   */
  subscribe (topic: string) {
    if (!this.started) {
      throw new Error('Pubsub has not started')
    }

    const topicStr = topic.toString()

    if (topicStr === 'pubsub:subscription-change') {
      return
    }

    if (!this.subscriptions.has(topicStr)) {
      this.subscriptions.add(topicStr)

      for (const peerId of this.peers.keys()) {
        this.send(peerId, { subscriptions: [topicStr], subscribe: true })
      }
    }
  }

  /**
   * Unsubscribe from the given topic
   */
  unsubscribe (topic: string) {
    if (!this.started) {
      throw new Error('Pubsub is not started')
    }

    // @ts-expect-error topic should be a key of the event map
    super.removeEventListener(topic)

    const topicStr = topic.toString()

    if (topicStr === 'pubsub:subscription-change') {
      return
    }

    const wasSubscribed = this.subscriptions.has(topicStr)
    const listeners = this.listenerCount(topicStr)

    this.log('unsubscribe from %s - am subscribed %s, listeners %d', topic, wasSubscribed, listeners)

    if (wasSubscribed && listeners === 0) {
      this.subscriptions.delete(topicStr)

      for (const peerId of this.peers.keys()) {
        this.send(peerId, { subscriptions: [topicStr], subscribe: false })
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

  addEventListener<U extends keyof EventMap> (type: U, callback: EventHandler<EventMap[U]>, options?: AddEventListenerOptions | boolean) {
    this.subscribe(type.toString())

    super.addEventListener(type, callback, options)
  }

  removeEventListener<U extends keyof EventMap> (type: U, callback: EventHandler<EventMap[U]> | undefined, options?: EventListenerOptions | boolean) {
    super.removeEventListener(type, callback, options)

    const topicStr = type.toString()

    if (this.listenerCount(topicStr) === 0) {
      this.unsubscribe(topicStr)
    }
  }
}
