'use strict'

const { EventEmitter } = require('events')

const PeerId = require('peer-id')

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

  _onPeer (peerId) {
    this.emit('peer', peerId)
  }

  async _discoverPeer () {
    if (!this._isRunning) return

    const peerId = await PeerId.create({ bits: 512 })

    this._timer = setTimeout(() => {
      this._onPeer(peerId)
    }, this.options.discoveryDelay || 1000)
  }
}

module.exports = MockDiscovery
