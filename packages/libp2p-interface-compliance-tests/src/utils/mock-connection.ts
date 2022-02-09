import { PeerId } from '@libp2p/peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { pipe } from 'it-pipe'
import type { MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Connection, Stream, Metadata, ProtocolStream } from '@libp2p/interfaces/connection'
import type { Muxer } from '@libp2p/interfaces/stream-muxer'

export async function mockConnection (maConn: MultiaddrConnection, direction: 'inbound' | 'outbound', muxer: Muxer): Promise<Connection> {
  const remoteAddr = maConn.remoteAddr
  const remotePeerIdStr = remoteAddr.getPeerId()
  const remotePeer = remotePeerIdStr != null ? PeerId.fromString(remotePeerIdStr) : await createEd25519PeerId()

  const streams: Stream[] = []
  let streamId = 0

  const registry = new Map()

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
