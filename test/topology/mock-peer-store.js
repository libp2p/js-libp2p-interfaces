'use strict'

const { EventEmitter } = require('events')

class MockPeerStore extends EventEmitter {
  constructor (peers) {
    super()
    this.peers = peers
    this.protoBook = {
      get: () => {}
    }
  }

  get (peerId) {
    return this.peers.get(peerId.toB58String())
  }
}

module.exports = MockPeerStore
