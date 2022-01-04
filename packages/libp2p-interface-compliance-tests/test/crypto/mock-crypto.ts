import { PeerId } from '@libp2p/peer-id'
// @ts-expect-error no types
import handshake from 'it-handshake'
// @ts-expect-error no types
import duplexPair from 'it-pair/duplex.js'
import pipe from 'it-pipe'
import { UnexpectedPeerError } from '@libp2p/interfaces/crypto/errors'
import type { Crypto } from '@libp2p/interfaces/crypto'
import { Multiaddr } from '@multiformats/multiaddr'

// A basic transform that does nothing to the data
const transform = () => {
  return (source: AsyncIterable<Uint8Array>) => (async function * () {
    for await (const chunk of source) {
      yield chunk
    }
  })()
}

const crypto: Crypto = {
  protocol: 'insecure',
  secureInbound: async (localPeer, duplex, expectedPeer) => {
    // 1. Perform a basic handshake.
    const shake = handshake(duplex)
    shake.write(localPeer.toBytes())
    const remoteId = await shake.read()

    if (remoteId == null) {
      throw new Error('Could not read remote ID')
    }

    const remotePeer = PeerId.fromBytes(remoteId.slice())
    shake.rest()

    if (expectedPeer != null && !expectedPeer.equals(remotePeer)) {
      throw new UnexpectedPeerError()
    }

    // 2. Create your encryption box/unbox wrapper
    const wrapper = duplexPair<Uint8Array>()
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
      conn: {
        ...wrapper[1],
        close: async () => {},
        localAddr: new Multiaddr('/ip4/127.0.0.1/tcp/4001'),
        remoteAddr: new Multiaddr('/ip4/127.0.0.1/tcp/4002'),
        timeline: {
          open: Date.now()
        },
        conn: true
      },
      remotePeer,
      remoteEarlyData: new Uint8Array(0)
    }
  },
  secureOutbound: async (localPeer, duplex, remotePeer) => {
    // 1. Perform a basic handshake.
    const shake = handshake(duplex)
    shake.write(localPeer.toBytes())
    const remoteId = await shake.read()

    if (remoteId == null) {
      throw new Error('Could not read remote ID')
    }

    shake.rest()

    // 2. Create your encryption box/unbox wrapper
    const wrapper = duplexPair<Uint8Array>()
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
      conn: {
        ...wrapper[1],
        close: async () => {},
        localAddr: new Multiaddr('/ip4/127.0.0.1/tcp/4001'),
        remoteAddr: new Multiaddr('/ip4/127.0.0.1/tcp/4002'),
        timeline: {
          open: Date.now()
        },
        conn: true
      },
      remotePeer: PeerId.fromBytes(remoteId.slice()),
      remoteEarlyData: new Uint8Array(0)
    }
  }
}

export default crypto
