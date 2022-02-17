import { Multiaddr } from '@multiformats/multiaddr'
import type { MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Duplex } from 'it-stream-types'
import type { PeerId } from '@libp2p/interfaces/peer-id'

export function mockMultiaddrConnection (source: Duplex<Uint8Array> & Partial<MultiaddrConnection>, peerId: PeerId): MultiaddrConnection {
  const maConn: MultiaddrConnection = {
    async close () {

    },
    timeline: {
      open: Date.now()
    },
    remoteAddr: new Multiaddr(`/ip4/127.0.0.1/tcp/4001/p2p/${peerId.toString()}`),
    ...source
  }

  return maConn
}
