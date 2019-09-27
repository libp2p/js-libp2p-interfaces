'use strict'

const { EventEmitter } = require('events')

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')

/**
 * Emits 'peer' events on discovery.
 */
class MockDiscovery extends EventEmitter {
  /**
   * Constructs a new Bootstrap.
   *
   * @param {Object} options
   * @param {number} options.discoveryDelay - the delay to find a peer (in milli-seconds)
   */
  constructor (options = {}) {
    super()

    this.options = options
    this._isRunning = false
    this._timer = null
  }

  start () {
    this._isRunning = true
    this._discoverPeer()
  }

  stop () {
    clearTimeout(this._timer)
    this._isRunning = false
  }

  async _discoverPeer () {
    if (!this._isRunning) return

    const peerId = await PeerId.create({ bits: 512 })
    const peerInfo = new PeerInfo(peerId)

    this._timer = setTimeout(() => {
      this.emit('peer', peerInfo)
    }, this.options.discoveryDelay || 1000)
  }
}

module.exports = MockDiscovery
