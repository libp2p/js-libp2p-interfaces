'use strict'

const { EventEmitter } = require('events')

class MockPeerStore extends EventEmitter {
  constructor (peers) {
    super()
    this.peers = peers
  }
}

module.exports = MockPeerStore
