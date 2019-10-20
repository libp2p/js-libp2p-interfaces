'use strict'

const PeerId = require('peer-id')
const handshake = require('it-handshake')
const duplexPair = require('it-pair/duplex')
const pipe = require('it-pipe')

// A basic transform that does nothing to the data
const transform = () => {
  return (source) => (async function * () {
    for await (const chunk of source) {
      yield chunk
    }
  })()
}

module.exports = {
  protocol: 'insecure',
  secureInbound: async (localPeer, duplex) => {
    // 1. Perform a basic handshake.
    const shake = handshake(duplex)
    shake.write(localPeer.id)
    const remoteId = await shake.read()
    shake.rest()

    // 2. Create your encryption box/unbox wrapper
    const wrapper = duplexPair()
    const encrypt = transform() // Use transform iterables to modify data
    const decrypt = transform()

    pipe(
      wrapper[0], // We write to wrapper
      encrypt, // The data is encrypted
      shake.stream, // It goes to the remote peer
      decrypt, // Decrypt the incoming data
      wrapper[0] // Pipe to the wrapper
    )

    return {
      conn: wrapper[1],
      remotePeer: new PeerId(remoteId.slice())
    }
  },
  secureOutbound: async (localPeer, duplex, remotePeer) => {
    // 1. Perform a basic handshake.
    const shake = handshake(duplex)
    shake.write(localPeer.id)
    const remoteId = await shake.read()
    shake.rest()

    // 2. Create your encryption box/unbox wrapper
    const wrapper = duplexPair()
    const encrypt = transform()
    const decrypt = transform()

    pipe(
      wrapper[0], // We write to wrapper
      encrypt, // The data is encrypted
      shake.stream, // It goes to the remote peer
      decrypt, // Decrypt the incoming data
      wrapper[0] // Pipe to the wrapper
    )

    return {
      conn: wrapper[1],
      remotePeer: new PeerId(remoteId.slice())
    }
  }
}
