'use strict'

const withIs = require('class-is')
const noop = () => {}

/**
 * @typedef {import('peer-id')} PeerId
 */

/**
 * @typedef {Object} TopologyHandlers
 * @property {(peerId: PeerId, conn: import('../connection')) => void} [handlers.onConnect] - protocol "onConnect" handler
 * @property {(peerId: PeerId) => void} [handlers.onDisconnect] - protocol "onDisconnect" handler
 *
 * @typedef {Object} TopologyOptions
 * @property {number} [props.min = 0] - minimum needed connections
 * @property {number} [props.max = Infinity] - maximum needed connections
 * @property {TopologyHandlers} [props.handlers]
 */

class Topology {
  /**
   * @class
   * @param {TopologyHandlers} options
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

    /**
     * Set of peers that support the protocol.
     *
     * @type {Set<string>}
     */
    this.peers = new Set()
  }

  set registrar (registrar) { // eslint-disable-line
    this._registrar = registrar
  }

  /**
   * Notify about peer disconnected event.
   *
   * @param {PeerId} peerId
   * @returns {void}
   */
  disconnect (peerId) {
    this._onDisconnect(peerId)
  }
}

/**
 * @module
 * @type {Topology}
 */
module.exports = withIs(Topology, { className: 'Topology', symbolName: '@libp2p/js-interfaces/topology' })
