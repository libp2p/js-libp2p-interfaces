import { peerIdFromBytes } from '@libp2p/peer-id'
import { handshake } from 'it-handshake'
import { duplexPair } from 'it-pair/duplex'
import { pipe } from 'it-pipe'
import { UnexpectedPeerError } from '@libp2p/interfaces/connection-encrypter/errors'
import { Multiaddr } from '@multiformats/multiaddr'
import type { ConnectionEncrypter } from '@libp2p/interfaces/connection-encrypter'
import type { Transform, Source } from 'it-stream-types'

// A basic transform that does nothing to the data
const transform = (): Transform<Uint8Array, Uint8Array> => {
  return (source: Source<Uint8Array>) => (async function * () {
    for await (const chunk of source) {
      yield chunk
    }
  })()
}

export function mockConnectionEncrypter () {
  const encrypter: ConnectionEncrypter = {
    protocol: 'insecure',
    secureInbound: async (localPeer, duplex, expectedPeer) => {
      // 1. Perform a basic handshake.
      const shake = handshake(duplex)
      shake.write(localPeer.toBytes())
      const remoteId = await shake.read()

      if (remoteId == null) {
        throw new Error('Could not read remote ID')
      }

      const remotePeer = peerIdFromBytes(remoteId.slice())
      shake.rest()

      if (expectedPeer != null && !expectedPeer.equals(remotePeer)) {
        throw new UnexpectedPeerError()
      }

      // 2. Create your encryption box/unbox wrapper
      const wrapper = duplexPair<Uint8Array>()
      const encrypt = transform() // Use transform iterables to modify data
      const decrypt = transform()

      void pipe(
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

      void pipe(
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
        remotePeer: peerIdFromBytes(remoteId.slice()),
        remoteEarlyData: new Uint8Array(0)
      }
    }
  }

  return encrypter
}
