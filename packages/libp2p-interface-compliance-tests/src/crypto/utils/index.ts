import { duplexPair } from 'it-pair/duplex'
import { Multiaddr } from '@multiformats/multiaddr'
import type { MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Duplex } from 'it-stream-types'

export function createMaConnPair (): [MultiaddrConnection, MultiaddrConnection] {
  const [local, remote] = duplexPair<Uint8Array>()

  function duplexToMaConn (duplex: Duplex<Uint8Array>): MultiaddrConnection {
    const output: MultiaddrConnection = {
      ...duplex,
      close: async () => {},
      conn: {},
      remoteAddr: new Multiaddr('/ip4/127.0.0.1/tcp/4001'),
      timeline: {
        open: Date.now()
      }
    }

    return output
  }

  return [duplexToMaConn(local), duplexToMaConn(remote)]
}
