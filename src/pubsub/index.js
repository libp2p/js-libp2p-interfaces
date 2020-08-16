'use strict'

const debug = require('debug')
const EventEmitter = require('events')
const errcode = require('err-code')

const MulticodecTopology = require('../topology/multicodec-topology')
const { codes } = require('./errors')
const message = require('./message')
const PeerStreams = require('./peer-streams')
const utils = require('./utils')
const {
  signMessage,
  verifySignature
} = require('./message/sign')

/**
 * @typedef {Object} InMessage
 * @property {string} from
 * @property {string} receivedFrom
 * @property {string[]} topicIDs
 * @property {Uint8Array} data
 * @property {Uint8Array} [signature]
 * @property {Uint8Array} [key]
 */

/**
* PubsubBaseProtocol handles the peers and connections logic for pubsub routers
* and specifies the API that pubsub routers should have.
*/
class PubsubBaseProtocol extends EventEmitter {
  /**
   * @param {Object} props
   * @param {String} props.debugName log namespace
   * @param {Array<string>|string} props.multicodecs protocol identificers to connect
   * @param {Libp2p} props.libp2p
   * @param {boolean} [props.signMessages] if messages should be signed, defaults to true
   * @param {boolean} [props.strictSigning] if message signing should be required, defaults to true
   * @abstract
   */
  constructor ({
    debugName,
    multicodecs,
    libp2p,
    signMessages = true,
    strictSigning = true
  }) {
    if (typeof debugName !== 'string') {
      throw new Error('a debugname `string` is required')
    }

    if (!multicodecs) {
      throw new Error('multicodecs are required')
    }

    if (!libp2p) {
      throw new Error('libp2p is required')
    }

    super()

    this.log = debug(debugName)
    this.log.err = debug(`${debugName}:error`)

    this.multicodecs = utils.ensureArray(multicodecs)
    this._libp2p = libp2p
    this.registrar = libp2p.registrar
    this.peerId = libp2p.peerId

    this.started = false

    /**
     * Map of topics to which peers are subscribed to
     *
     * @type {Map<string, Set<string>>}
     */
    this.topics = new Map()

    /**
     * Map of peer streams
     *
     * @type {Map<string, PeerStreams>}
     */
    this.peers = new Map()

    // Message signing
    this.signMessages = signMessages

    /**
     * If message signing should be required for incoming messages
     * @type {boolean}
     */
    this.strictSigning = strictSigning

    this._registrarId = undefined
    this._onIncomingStream = this._onIncomingStream.bind(this)
    this._onPeerConnected = this._onPeerConnected.bind(this)
    this._onPeerDisconnected = this._onPeerDisconnected.bind(this)
  }

  /**
   * Register the pubsub protocol onto the libp2p node.
   * @returns {Promise<void>}
   */
  async start () {
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
    this._registrarId = await this.registrar.register(topology)

    this.log('started')
    this.started = true
  }

  /**
   * Unregister the pubsub protocol and the streams with other peers will be closed.
   * @returns {Promise<void>}
   */
  async stop () {
    if (!this.started) {
      return
    }

    // unregister protocol and handlers
    await this.registrar.unregister(this._registrarId)

    this.log('stopping')
    this.peers.forEach((peerStreams) => peerStreams.close())

    this.peers = new Map()
    this.started = false
    this.log('stopped')
  }

  /**
   * On an inbound stream opened.
   * @private
   * @param {Object} props
   * @param {string} props.protocol
   * @param {DuplexIterableStream} props.stream
   * @param {Connection} props.connection connection
   */
  _onIncomingStream ({ protocol, stream, connection }) {
    const peerId = connection.remotePeer
    const idB58Str = peerId.toB58String()
    const peer = this._addPeer(peerId, protocol)
    peer.attachInboundStream(stream)

    this._processMessages(idB58Str, peer.inboundStream, peer)
  }

  /**
   * Registrar notifies an established connection with pubsub protocol.
   * @private
   * @param {PeerId} peerId remote peer-id
   * @param {Connection} conn connection to the peer
   */
  async _onPeerConnected (peerId, conn) {
    const idB58Str = peerId.toB58String()
    this.log('connected', idB58Str)

    try {
      const { stream, protocol } = await conn.newStream(this.multicodecs)
      const peer = this._addPeer(peerId, protocol)
      await peer.attachOutboundStream(stream)
    } catch (err) {
      this.log.err(err)
    }
  }

  /**
   * Registrar notifies a closing connection with pubsub protocol.
   * @private
   * @param {PeerId} peerId peerId
   * @param {Error} err error for connection end
   */
  _onPeerDisconnected (peerId, err) {
    const idB58Str = peerId.toB58String()

    this.log('connection ended', idB58Str, err ? err.message : '')
    this._removePeer(peerId)
  }

  /**
   * Notifies the router that a peer has been connected
   * @private
   * @param {PeerId} peerId
   * @param {string} protocol
   * @returns {PeerStreams}
   */
  _addPeer (peerId, protocol) {
    const id = peerId.toB58String()
    const existing = this.peers.get(id)
    // If peer streams already exists, do nothing
    if (existing) {
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
   * Notifies the router that a peer has been disconnected.
   * @private
   * @param {PeerId} peerId
   * @returns {PeerStreams | undefined}
   */
  _removePeer (peerId) {
    if (!peerId) return
    const id = peerId.toB58String()
    const peerStreams = this.peers.get(id)
    if (!peerStreams) return

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

  /**
   * Validates the given message. The signature will be checked for authenticity.
   * Throws an error on invalid messages
   * @param {InMessage} message
   * @returns {Promise<void>}
   */
  async validate (message) { // eslint-disable-line require-await
    // If strict signing is on and we have no signature, abort
    if (this.strictSigning && !message.signature) {
      throw errcode(new Error('Signing required and no signature was present'), codes.ERR_MISSING_SIGNATURE)
    }

    // Check the message signature if present
    if (message.signature && !(await verifySignature(message))) {
      throw errcode(new Error('Invalid message signature'), codes.ERR_INVALID_SIGNATURE)
    }
  }

  /**
   * Normalizes the message and signs it, if signing is enabled
   * @private
   * @param {Message} message
   * @returns {Promise<Message>}
   */
  _buildMessage (message) {
    const msg = utils.normalizeOutRpcMessage(message)
    if (this.signMessages) {
      return signMessage(this.peerId, msg)
    } else {
      return message
    }
  }

  /**
   * Get a list of the peer-ids that are subscribed to one topic.
   * @param {string} topic
   * @returns {Array<string>}
   */
  getSubscribers (topic) {
    if (!this.started) {
      throw errcode(new Error('not started yet'), 'ERR_NOT_STARTED_YET')
    }

    if (!topic || typeof topic !== 'string') {
      throw errcode(new Error('a string topic must be provided'), 'ERR_NOT_VALID_TOPIC')
    }

    const peersInTopic = this.topics.get(topic)
    if (!peersInTopic) {
      return []
    }
    return Array.from(peersInTopic)
  }

  /**
   * Overriding the implementation of publish should handle the appropriate algorithms for the publish/subscriber implementation.
   * For example, a Floodsub implementation might simply publish each message to each topic for every peer
   * @abstract
   * @param {Array<string>|string} topics
   * @param {Uint8Array} message
   * @returns {Promise<void>}
   *
   */
  publish (topics, message) {
    throw errcode(new Error('publish must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }

  /**
   * Overriding the implementation of subscribe should handle the appropriate algorithms for the publish/subscriber implementation.
   * For example, a Floodsub implementation might simply send a message for every peer showing interest in the topics
   * @abstract
   * @param {Array<string>|string} topics
   * @returns {void}
   */
  subscribe (topics) {
    throw errcode(new Error('subscribe must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }

  /**
   * Overriding the implementation of unsubscribe should handle the appropriate algorithms for the publish/subscriber implementation.
   * For example, a Floodsub implementation might simply send a message for every peer revoking interest in the topics
   * @abstract
   * @param {Array<string>|string} topics
   * @returns {void}
   */
  unsubscribe (topics) {
    throw errcode(new Error('unsubscribe must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }

  /**
   * Overriding the implementation of getTopics should handle the appropriate algorithms for the publish/subscriber implementation.
   * Get the list of subscriptions the peer is subscribed to.
   * @abstract
   * @returns {Array<string>}
   */
  getTopics () {
    throw errcode(new Error('getTopics must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }

  /**
   * Overriding the implementation of _processMessages should keep the connection and is
   * responsible for processing each RPC message received by other peers.
   * @abstract
   * @param {string} idB58Str peer id string in base58
   * @param {Connection} conn connection
   * @param {PeerStreams} peer A Pubsub Peer
   * @returns {void}
   *
   */
  _processMessages (idB58Str, conn, peer) {
    throw errcode(new Error('_processMessages must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }
}

module.exports = PubsubBaseProtocol
module.exports.message = message
module.exports.utils = utils
