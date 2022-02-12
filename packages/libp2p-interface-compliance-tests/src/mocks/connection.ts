import { peerIdFromString } from '@libp2p/peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { pipe } from 'it-pipe'
import { duplexPair } from 'it-pair/duplex'
import type { MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Connection, Stream, Metadata, ProtocolStream } from '@libp2p/interfaces/connection'
import type { Muxer } from '@libp2p/interfaces/stream-muxer'
import type { Duplex } from 'it-stream-types'
import { mockMuxer } from './muxer.js'

export async function mockConnection (maConn: MultiaddrConnection, direction: 'inbound' | 'outbound' = 'inbound', muxer: Muxer = mockMuxer()): Promise<Connection> {
  const remoteAddr = maConn.remoteAddr
  const remotePeerIdStr = remoteAddr.getPeerId()
  const remotePeer = remotePeerIdStr != null ? peerIdFromString(remotePeerIdStr) : await createEd25519PeerId()
  const registry = new Map()
  const streams: Stream[] = []
  let streamId = 0

  void pipe(
    maConn, muxer, maConn
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
      const stream: Stream = muxer.newStream(id)
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

export function connectionPair (): [ Connection, Connection ] {
  const [d0, d1] = duplexPair<Uint8Array>()

  return [
    // @ts-expect-error not a complete implementation
    {
      newStream: async (multicodecs: string[]) => await Promise.resolve({
        stream: mockStream(d0),
        protocol: multicodecs[0]
      })
    },
    // @ts-expect-error not a complete implementation
    {
      newStream: async (multicodecs: string[]) => await Promise.resolve({
        stream: mockStream(d1),
        protocol: multicodecs[0]
      })
    }
  ]
}
