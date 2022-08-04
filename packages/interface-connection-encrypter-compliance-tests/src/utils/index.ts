import { duplexPair } from 'it-pair/duplex'
import { Multiaddr } from '@multiformats/multiaddr'
import type { MultiaddrConnection } from '@libp2p/interface-connection'
import type { Duplex } from 'it-stream-types'
import type { Uint8ArrayList } from 'uint8arraylist'

export function createMaConnPair (): [MultiaddrConnection<Uint8ArrayList>, MultiaddrConnection<Uint8ArrayList>] {
  const [local, remote] = duplexPair<Uint8ArrayList>()

  function duplexToMaConn (duplex: Duplex<Uint8ArrayList>): MultiaddrConnection<Uint8ArrayList> {
    const output: MultiaddrConnection<Uint8ArrayList> = {
      ...duplex,
      close: async () => {},
      remoteAddr: new Multiaddr('/ip4/127.0.0.1/tcp/4001'),
      timeline: {
        open: Date.now()
      }
    }

    return output
  }

  return [duplexToMaConn(local), duplexToMaConn(remote)]
}
