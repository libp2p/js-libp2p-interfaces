import { expect } from 'aegir/utils/chai.js'
import { pair } from 'it-pair'
import { peerIdFromString } from '@libp2p/peer-id'
import * as PeerIdFactory from '@libp2p/peer-id-factory'
import { pushable } from 'it-pushable'
import drain from 'it-drain'
import { Multiaddr } from '@multiformats/multiaddr'
import { pipe } from 'it-pipe'
import type { Upgrader, MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Connection, Stream, Metadata, ProtocolStream } from '@libp2p/interfaces/connection'
import type { Muxer } from '@libp2p/interfaces/stream-muxer'
import type { Duplex } from 'it-stream-types'

/**
 * A tick is considered valid if it happened between now
 * and `ms` milliseconds ago
 */
export function isValidTick (date?: number, ms: number = 5000) {
  if (date == null) {
    throw new Error('date must be a number')
  }

  const now = Date.now()

  if (date > now - ms && date <= now) {
    return true
  }

  return false
}

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

export function mockMuxer (): Muxer {
  let streamId = 0
  let streams: Stream[] = []
  const p = pushable<Uint8Array>()

  const muxer: Muxer = {
    source: p,
    sink: async (source) => {
      await drain(source)
    },
    get streams () {
      return streams
    },
    newStream: (name?: string) => {
      const echo = pair<Uint8Array>()

      const id = `${streamId++}`
      const stream: Stream = {
        id,
        sink: echo.sink,
        source: echo.source,
        close: () => {
          streams = streams.filter(s => s !== stream)
        },
        abort: () => {},
        reset: () => {},
        timeline: {
          open: 0
        }
      }

      return stream
    }
  }

  return muxer
}

export interface MockUpgraderOptions {
  muxer?: Muxer
}

export function mockUpgrader (options: MockUpgraderOptions = {}) {
  const ensureProps = (multiaddrConnection: MultiaddrConnection) => {
    ['sink', 'source', 'remoteAddr', 'timeline', 'close'].forEach(prop => {
      expect(multiaddrConnection).to.have.property(prop)
    })
    expect(isValidTick(multiaddrConnection.timeline.open)).to.equal(true)
    return multiaddrConnection
  }

  const muxer = options.muxer ?? mockMuxer()

  const upgrader: Upgrader = {
    async upgradeOutbound (multiaddrConnection) {
      ensureProps(multiaddrConnection)
      return await createConnection(multiaddrConnection, 'outbound', muxer)
    },
    async upgradeInbound (multiaddrConnection) {
      ensureProps(multiaddrConnection)
      return await createConnection(multiaddrConnection, 'inbound', muxer)
    }
  }

  return upgrader
}

async function createConnection (maConn: MultiaddrConnection, direction: 'inbound' | 'outbound', muxer: Muxer): Promise<Connection> {
  const remoteAddr = maConn.remoteAddr
  const remotePeerIdStr = remoteAddr.getPeerId()
  const remotePeer = remotePeerIdStr != null ? peerIdFromString(remotePeerIdStr) : await PeerIdFactory.createEd25519PeerId()

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
