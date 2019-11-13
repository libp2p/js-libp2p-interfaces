'use strict'

const assert = require('assert')

class Topology {
  /**
   * @param {Object} props
   * @param {number} props.min minimum needed connections (default: 0)
   * @param {number} props.max maximum needed connections (default: Infinity)
   * @param {Object} props.handlers
   * @param {function} props.handlers.onConnect protocol "onConnect" handler
   * @param {function} props.handlers.onDisconnect protocol "onDisconnect" handler
   * @constructor
   */
  constructor ({
    min = 0,
    max = Infinity,
    handlers
  }) {
    assert(handlers, 'the handlers should be provided')
    assert(handlers.onConnect && typeof handlers.onConnect === 'function',
      'the \'onConnect\' handler must be provided')
    assert(handlers.onDisconnect && typeof handlers.onDisconnect === 'function',
      'the \'onDisconnect\' handler must be provided')

    this.min = min
    this.max = max

    // Handlers
    this._onConnect = handlers.onConnect
    this._onDisconnect = handlers.onDisconnect

    this.peers = new Map()
  }

  /**
   * Notify about peer disconnected event.
   * @param {PeerInfo} peerInfo
   * @param {Error} [error]
   * @returns {void}
   */
  disconnect (peerInfo, error) {
    this._onDisconnect(peerInfo, error)
  }
}

module.exports = Topology
