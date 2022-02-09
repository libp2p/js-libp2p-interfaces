import { Multiaddr } from '@multiformats/multiaddr'
import type { MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Duplex } from 'it-stream-types'

export function mockMultiaddrConnection (source: Duplex<Uint8Array>): MultiaddrConnection {
  const maConn: MultiaddrConnection = {
    ...source,
    async close () {

    },
    timeline: {
      open: Date.now()
    },
    remoteAddr: new Multiaddr('/ip4/127.0.0.1/tcp/4001')
  }

  return maConn
}
