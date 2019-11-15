'use strict'

const withIs = require('class-is')

const noop = () => {}

class Topology {
  /**
   * @param {Object} props
   * @param {number} props.min minimum needed connections (default: 0)
   * @param {number} props.max maximum needed connections (default: Infinity)
   * @param {Object} [props.handlers]
   * @param {function} [props.handlers.onConnect] protocol "onConnect" handler
   * @param {function} [props.handlers.onDisconnect] protocol "onDisconnect" handler
   * @constructor
   */
  constructor ({
    min = 0,
    max = Infinity,
    handlers = {}
  }) {
    this.min = min
    this.max = max

    // Handlers
    this._onConnect = handlers.onConnect || noop
    this._onDisconnect = handlers.onDisconnect || noop

    this.peers = new Map()
  }

  set registrar (registrar) {
    this._registrar = registrar
  }

  /**
   * Notify about peer disconnected event.
   * @param {PeerInfo} peerInfo
   * @returns {void}
   */
  disconnect (peerInfo) {
    this._onDisconnect(peerInfo)
  }
}

module.exports = withIs(Topology, { className: 'Topology', symbolName: '@libp2p/js-interfaces/topology' })
