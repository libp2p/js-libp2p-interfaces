'use strict'

const Topology = require('./index')
const multicodecTopologySymbol = Symbol.for('@libp2p/js-interfaces/topology/multicodec-topology')
const debug = require('debug')

const log = Object.assign(debug('libp2p:topology:multicodec-topology'), {
  error: debug('libp2p:topology:multicodec-topology:error')
})

class MulticodecTopology extends Topology {
  /**
   * @param {TopologyOptions & MulticodecOptions} props
   */
  constructor ({
    min,
    max,
    multicodecs,
    handlers
  }) {
    super({ min, max, handlers })

    if (!multicodecs) {
      throw new Error('one or more multicodec should be provided')
    }

    if (!handlers) {
      throw new Error('the handlers should be provided')
    }

    if (typeof handlers.onConnect !== 'function') {
      throw new Error('the \'onConnect\' handler must be provided')
    }

    if (typeof handlers.onDisconnect !== 'function') {
      throw new Error('the \'onDisconnect\' handler must be provided')
    }

    this.multicodecs = Array.isArray(multicodecs) ? multicodecs : [multicodecs]
    this._registrar = undefined

    this._onProtocolChange = this._onProtocolChange.bind(this)
    this._onPeerConnect = this._onPeerConnect.bind(this)
  }

  get [Symbol.toStringTag] () {
    return 'Topology'
  }

  get [multicodecTopologySymbol] () {
    return true
  }

  /**
   * Checks if the given value is a `MulticodecTopology` instance.
   *
   * @param {any} other
   * @returns {other is MulticodecTopology}
   */
  static isMulticodecTopology (other) {
    return Boolean(other && other[multicodecTopologySymbol])
  }

  /**
   * @param {any} registrar
   */
  async setRegistrar (registrar) { // eslint-disable-line
    this._registrar = registrar
    this._registrar.peerStore.on('change:protocols', this._onProtocolChange)
    this._registrar.connectionManager.on('peer:connect', this._onPeerConnect)

    // Update topology peers
    await this._updatePeers(this._registrar.peerStore.getPeers())
  }

  /**
   * Update topology.
   *
   * @param {AsyncIterable<any> | Iterable<any>} peerDataIterable
   */
  async _updatePeers (peerDataIterable) {
    for await (const { id, protocols } of peerDataIterable) {
      if (this.multicodecs.filter(multicodec => protocols.includes(multicodec)).length) {
        // Add the peer regardless of whether or not there is currently a connection
        this.peers.add(id.toB58String())
        // If there is a connection, call _onConnect
        const connection = this._registrar.getConnection(id)
        connection && this._onConnect(id, connection)
      } else {
        // Remove any peers we might be tracking that are no longer of value to us
        this.peers.delete(id.toB58String())
      }
    }
  }

  /**
   * Check if a new peer support the multicodecs for this topology.
   *
   * @param {Object} props
   * @param {PeerId} props.peerId
   * @param {Array<string>} props.protocols
   */
  async _onProtocolChange ({ peerId, protocols }) {
    try {
      const hadPeer = this.peers.has(peerId.toB58String())
      const hasProtocol = protocols.filter(protocol => this.multicodecs.includes(protocol))

      // Not supporting the protocol anymore?
      if (hadPeer && hasProtocol.length === 0) {
        this._onDisconnect(peerId)
      }

      // New to protocol support
      for (const protocol of protocols) {
        if (this.multicodecs.includes(protocol)) {
          const peerData = await this._registrar.peerStore.get(peerId)
          await this._updatePeers([peerData])
          return
        }
      }
    } catch (err) {
      log.error(err)
    }
  }

  /**
   * Verify if a new connected peer has a topology multicodec and call _onConnect.
   *
   * @param {Connection} connection
   */
  async _onPeerConnect (connection) {
    try {
      // @ts-ignore - remotePeer does not existist on Connection
      const peerId = connection.remotePeer
      const protocols = await this._registrar.peerStore.protoBook.get(peerId)

      if (!protocols) {
        return
      }

      if (this.multicodecs.find(multicodec => protocols.includes(multicodec))) {
        this.peers.add(peerId.toB58String())
        this._onConnect(peerId, connection)
      }
    } catch (err) {
      log.error(err)
    }
  }
}

/**
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('multiaddr')} Multiaddr
 * @typedef {import('../connection/connection')} Connection
 * @typedef {import('.').Options} TopologyOptions
 * @typedef {Object} MulticodecOptions
 * @property {string[]} multicodecs - protocol multicodecs
 * @property {Required<Handlers>} handlers
 * @typedef {import('.').Handlers} Handlers
 */
module.exports = MulticodecTopology
