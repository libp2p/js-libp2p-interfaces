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

  async * getPeers () {
    yield * this.peers.values()
  }

  async get (peerId) {
    return this.peers.get(peerId.toB58String())
  }

  async set (peerId, peer) {
    return this.peers.set(peerId.toB58String(), peer)
  }
}

module.exports = MockPeerStore
