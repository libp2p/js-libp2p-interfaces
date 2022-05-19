import { peerIdFromString } from '@libp2p/peer-id'
import { pipe } from 'it-pipe'
import { duplexPair } from 'it-pair/duplex'
import type { MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Connection, Stream, Metadata, ProtocolStream, ConnectionStat } from '@libp2p/interfaces/connection'
import type { Duplex } from 'it-stream-types'
import { mockMuxer } from './muxer.js'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import { mockMultiaddrConnection } from './multiaddr-connection.js'
import type { Registrar } from '@libp2p/interfaces/registrar'
import { mockRegistrar } from './registrar.js'
import { Dialer, Listener } from '@libp2p/multistream-select'
import { logger } from '@libp2p/logger'
import * as STATUS from '@libp2p/interfaces/connection/status'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { StreamMuxer } from '@libp2p/interfaces/stream-muxer'
import { Components } from '@libp2p/interfaces/components'

const log = logger('libp2p:mock-connection')

export interface MockConnectionOptions {
  direction?: 'inbound' | 'outbound'
  registrar?: Registrar
}

interface MockConnectionInit {
  remoteAddr: Multiaddr
  remotePeer: PeerId
  direction: 'inbound' | 'outbound'
  maConn: MultiaddrConnection
  muxer: StreamMuxer
}

class MockConnection implements Connection {
  public id: string
  public remoteAddr: Multiaddr
  public remotePeer: PeerId
  public direction: 'inbound' | 'outbound'
  public stat: ConnectionStat
  public registry: Map<string, Metadata>
  public streams: Stream[]
  public tags: string[]

  private readonly muxer: StreamMuxer
  private readonly maConn: MultiaddrConnection

  constructor (init: MockConnectionInit) {
    const { remoteAddr, remotePeer, direction, maConn, muxer } = init

    this.id = `mock-connection-${Math.random()}`
    this.remoteAddr = remoteAddr
    this.remotePeer = remotePeer
    this.direction = direction
    this.stat = {
      status: STATUS.OPEN,
      direction,
      timeline: maConn.timeline,
      multiplexer: 'test-multiplexer',
      encryption: 'yes-yes-very-secure'
    }
    this.registry = new Map()
    this.streams = []
    this.tags = []
    this.muxer = muxer
    this.maConn = maConn
  }

  async newStream (protocols: string | string[]) {
    if (!Array.isArray(protocols)) {
      protocols = [protocols]
    }

    if (protocols.length === 0) {
      throw new Error('protocols must have a length')
    }

    const id = `${Math.random()}`
    const stream: Stream = this.muxer.newStream(id)
    const mss = new Dialer(stream)
    const result = await mss.select(protocols)

    const streamData: ProtocolStream = {
      protocol: result.protocol,
      stream: {
        ...stream,
        ...result.stream
      }
    }

    this.addStream(stream, { protocol: result.protocol, metadata: {} })

    return streamData
  }

  addStream (stream: Stream, metadata: Partial<Metadata>) {
    this.registry.set(stream.id, {
      protocol: metadata.protocol ?? '',
      metadata: metadata.metadata ?? {}
    })

    this.streams.push(stream)
  }

  removeStream (id: string) {
    this.registry.delete(id)
    this.streams = this.streams.filter(stream => stream.id !== id)
  }

  async close () {
    this.stat.status = STATUS.CLOSING
    await this.maConn.close()
    this.stat.status = STATUS.CLOSED
  }
}

export function mockConnection (maConn: MultiaddrConnection, opts: MockConnectionOptions = {}): Connection {
  const remoteAddr = maConn.remoteAddr
  const remotePeerIdStr = remoteAddr.getPeerId() ?? '12D3KooWCrhmFM1BCPGBkNzbPfDk4cjYmtAYSpZwUBC69Qg2kZyq'

  if (remotePeerIdStr == null) {
    throw new Error('Remote multiaddr must contain a peer id')
  }

  const remotePeer = peerIdFromString(remotePeerIdStr)
  const direction = opts.direction ?? 'inbound'
  const registrar = opts.registrar ?? mockRegistrar()
  const muxerFactory = mockMuxer()

  const muxer = muxerFactory.createStreamMuxer(new Components(), {
    onIncomingStream: (muxedStream) => {
      const mss = new Listener(muxedStream)
      try {
        mss.handle(registrar.getProtocols())
          .then(({ stream, protocol }) => {
            log('%s: incoming stream opened on %s', direction, protocol)
            muxedStream = { ...muxedStream, ...stream }

            connection.addStream(muxedStream, { protocol, metadata: {} })
            const handler = registrar.getHandler(protocol)

            handler({ connection, stream: muxedStream, protocol })
          }).catch(err => {
            log.error(err)
          })
      } catch (err: any) {
        log.error(err)
      }
    },
    onStreamEnd: (muxedStream) => {
      connection.removeStream(muxedStream.id)
    }
  })

  void pipe(
    maConn, muxer, maConn
  )

  const connection = new MockConnection({
    remoteAddr,
    remotePeer,
    direction,
    maConn,
    muxer
  })

  return connection
}

export function mockStream (stream: Duplex<Uint8Array>): Stream {
  return {
    ...stream,
    close: async () => {},
    closeRead: async () => {},
    closeWrite: async () => {},
    abort: () => {},
    reset: () => {},
    timeline: {
      open: Date.now()
    },
    id: `stream-${Date.now()}`
  }
}

export interface Peer {
  peerId: PeerId
  registrar: Registrar
}

export function connectionPair (a: Components, b: Components): [ Connection, Connection ] {
  const [peerBtoPeerA, peerAtoPeerB] = duplexPair<Uint8Array>()

  return [
    mockConnection(
      mockMultiaddrConnection(peerAtoPeerB, b.getPeerId()), {
        registrar: a.getRegistrar()
      }
    ),
    mockConnection(
      mockMultiaddrConnection(peerBtoPeerA, a.getPeerId()), {
        registrar: b.getRegistrar()
      }
    )
  ]
}
