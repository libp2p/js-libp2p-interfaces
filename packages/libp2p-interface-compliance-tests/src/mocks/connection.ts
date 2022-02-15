import { peerIdFromString } from '@libp2p/peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { pipe } from 'it-pipe'
import { duplexPair } from 'it-pair/duplex'
import type { MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Connection, Stream, Metadata, ProtocolStream } from '@libp2p/interfaces/connection'
import type { Muxer } from '@libp2p/interfaces/stream-muxer'
import type { Duplex } from 'it-stream-types'
import { mockMuxer } from './muxer.js'
import type { PeerId } from '@libp2p/interfaces/src/peer-id'
import { mockMultiaddrConnection } from './multiaddr-connection.js'
import { Multiaddr } from '@multiformats/multiaddr'

export async function mockConnection (maConn: MultiaddrConnection, direction: 'inbound' | 'outbound' = 'inbound', muxer?: Muxer): Promise<Connection> {
  const remoteAddr = maConn.remoteAddr
  const remotePeerIdStr = remoteAddr.getPeerId()
  const remotePeer = remotePeerIdStr != null ? peerIdFromString(remotePeerIdStr) : await createEd25519PeerId()
  const registry = new Map()
  const streams: Stream[] = []
  let streamId = 0
  const mux = muxer ?? mockMuxer()

  void pipe(
    maConn, mux, maConn
  )

  return {
    id: 'mock-connection',
    remoteAddr,
    remotePeer,
    stat: {
      status: 'OPEN',
      direction,
      timeline: maConn.timeline,
      multiplexer: 'test-multiplexer',
      encryption: 'yes-yes-very-secure'
    },
    registry,
    tags: [],
    streams,
    newStream: async (protocols) => {
      if (!Array.isArray(protocols)) {
        protocols = [protocols]
      }

      if (protocols.length === 0) {
        throw new Error('protocols must have a length')
      }

      const id = `${streamId++}`
      const stream: Stream = mux.newStream(id)
      const streamData: ProtocolStream = {
        protocol: protocols[0],
        stream
      }

      registry.set(id, streamData)

      return streamData
    },
    addStream: (stream: Stream, metadata: Metadata) => {

    },
    removeStream: (id: string) => {
      registry.delete(id)
    },
    close: async () => {
      await maConn.close()
    }
  }
}

export function mockStream (stream: Duplex<Uint8Array>): Stream {
  return {
    ...stream,
    close: () => {},
    abort: () => {},
    reset: () => {},
    timeline: {
      open: Date.now()
    },
    id: `stream-${Date.now()}`
  }
}

export async function connectionPair (peerA: PeerId, peerB: PeerId): Promise<[ Connection, Connection ]> {
  const [d0, d1] = duplexPair<Uint8Array>()

  return [{
    ...await mockConnection(mockMultiaddrConnection({
      ...d0,
      remoteAddr: new Multiaddr(`/ip4/127.0.0.1/tcp/4001/p2p/${peerA.toString()}`)
    })),
    newStream: async (multicodecs: string[]) => await Promise.resolve({
      stream: mockStream(d0),
      protocol: multicodecs[0]
    })
  }, {
    ...await mockConnection(mockMultiaddrConnection({
      ...d1,
      remoteAddr: new Multiaddr(`/ip4/127.0.0.1/tcp/4001/p2p/${peerB.toString()}`)
    })),
    newStream: async (multicodecs: string[]) => await Promise.resolve({
      stream: mockStream(d1),
      protocol: multicodecs[0]
    })
  }]
}
