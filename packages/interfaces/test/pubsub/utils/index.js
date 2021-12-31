'use strict'

const DuplexPair = require('it-pair/duplex')

const PeerId = require('peer-id')

const PubsubBaseProtocol = require('../../../src/pubsub')
const { RPC } = require('../../../src/pubsub/message/rpc')

exports.createPeerId = async () => {
  const peerId = await PeerId.create({ bits: 1024 })

  return peerId
}

class PubsubImplementation extends PubsubBaseProtocol {
  constructor (protocol, libp2p, options = {}) {
    super({
      debugName: 'libp2p:pubsub',
      multicodecs: protocol,
      libp2p,
      ...options
    })
  }

  _publish (message) {
    // ...
  }

  _decodeRpc (bytes) {
    return RPC.decode(bytes)
  }

  _encodeRpc (rpc) {
    return RPC.encode(rpc).finish()
  }
}

exports.PubsubImplementation = PubsubImplementation

exports.mockRegistrar = {
  handle: () => {},
  register: () => {},
  unregister: () => {}
}

exports.createMockRegistrar = (registrarRecord) => ({
  handle: (multicodecs, handler) => {
    const rec = registrarRecord[multicodecs[0]] || {}

    registrarRecord[multicodecs[0]] = {
      ...rec,
      handler
    }
  },
  register: async ({ multicodecs, _onConnect, _onDisconnect }) => {
    const rec = registrarRecord[multicodecs[0]] || {}

    registrarRecord[multicodecs[0]] = {
      ...rec,
      onConnect: _onConnect,
      onDisconnect: _onDisconnect
    }

    return multicodecs[0]
  },
  unregister: (id) => {
    delete registrarRecord[id]
  }
})

exports.ConnectionPair = () => {
  const [d0, d1] = DuplexPair()

  return [
    {
      stream: d0,
      newStream: () => Promise.resolve({ stream: d0 })
    },
    {
      stream: d1,
      newStream: () => Promise.resolve({ stream: d1 })
    }
  ]
}
