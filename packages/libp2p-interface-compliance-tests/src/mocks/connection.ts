import { peerIdFromString } from '@libp2p/peer-id'
import { pipe } from 'it-pipe'
import { duplexPair } from 'it-pair/duplex'
import type { MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Connection, Stream, Metadata, ProtocolStream } from '@libp2p/interfaces/connection'
import type { Muxer } from '@libp2p/interfaces/stream-muxer'
import type { Duplex } from 'it-stream-types'
import { mockMuxer } from './muxer.js'
import type { PeerId } from '@libp2p/interfaces/src/peer-id'
import { mockMultiaddrConnection } from './multiaddr-connection.js'
import type { Registrar } from '@libp2p/interfaces/registrar'
import { mockRegistrar } from './registrar.js'
import { Listener } from '@libp2p/multistream-select'
import { logger } from '@libp2p/logger'
import { CustomEvent } from '@libp2p/interfaces'

const log = logger('libp2p:mock-connection')

export interface MockConnectionOptions {
  direction?: 'inbound' | 'outbound'
  muxer?: Muxer
  registrar?: Registrar
}

export function mockConnection (maConn: MultiaddrConnection, opts: MockConnectionOptions = {}): Connection {
  const remoteAddr = maConn.remoteAddr
  const remotePeerIdStr = remoteAddr.getPeerId()

  if (remotePeerIdStr == null) {
    throw new Error('Remote multiaddr must contain a peer id')
  }

  const remotePeer = peerIdFromString(remotePeerIdStr)
  const registry = new Map()
  const streams: Stream[] = []
  let streamId = 0
  const direction = opts.direction ?? 'inbound'
  const registrar = opts.registrar ?? mockRegistrar()

  const muxer = opts.muxer ?? mockMuxer({
    onStream: (muxedStream) => {
      const mss = new Listener(muxedStream)
      try {
        mss.handle(registrar.getProtocols())
          .then(({ stream, protocol }) => {
            log('%s: incoming stream opened on %s', direction, protocol)
            muxedStream = { ...muxedStream, ...stream }

            connection.addStream(muxedStream, { protocol, metadata: {} })
            const handler = registrar.getHandler(protocol)

            handler(new CustomEvent('incomingStream', {
              detail: { connection, stream: muxedStream, protocol }
            }))
          }).catch(err => {
            log.error(err)
          })
      } catch (err: any) {
        log.error(err)
      }
    },
    onStreamEnd: (stream) => {
      connection.removeStream(stream.id)
    }
  })

  void pipe(
    maConn, muxer, maConn
  )

  const connection:Connection = {
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

  return connection
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

export function connectionPair (peerA: PeerId, peerB: PeerId): [ Connection, Connection ] {
  const [peerBtoPeerA, peerAtoPeerB] = duplexPair<Uint8Array>()

  return [
    mockConnection(
      mockMultiaddrConnection(peerBtoPeerA, peerA)
    ),
    mockConnection(
      mockMultiaddrConnection(peerAtoPeerB, peerB)
    )
  ]
}
