import { duplexPair } from 'it-pair/duplex'
import { multiaddr } from '@multiformats/multiaddr'
import type { MultiaddrConnection } from '@libp2p/interface-connection'
import type { Duplex } from 'it-stream-types'

export function createMaConnPair (): [MultiaddrConnection, MultiaddrConnection] {
  const [local, remote] = duplexPair<Uint8Array>()

  function duplexToMaConn (duplex: Duplex<Uint8Array>): MultiaddrConnection {
    const output: MultiaddrConnection = {
      ...duplex,
      close: async () => {},
      remoteAddr: multiaddr('/ip4/127.0.0.1/tcp/4001'),
      timeline: {
        open: Date.now()
      }
    }

    return output
  }

  return [duplexToMaConn(local), duplexToMaConn(remote)]
}
