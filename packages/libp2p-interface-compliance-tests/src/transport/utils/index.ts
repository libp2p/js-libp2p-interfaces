import { expect } from 'aegir/utils/chai.js'
import type { Upgrader, MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Connection, StreamData } from '@libp2p/interfaces/connection'
import type { MuxedStream } from '@libp2p/interfaces/stream-muxer'
import { pair } from 'it-pair'
import { PeerId } from '@libp2p/peer-id'
import * as PeerIdFactory from '@libp2p/peer-id-factory'
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

export function mockUpgrader () {
  const ensureProps = (multiaddrConnection: MultiaddrConnection) => {
    ['sink', 'source', 'remoteAddr', 'conn', 'timeline', 'close'].forEach(prop => {
      expect(multiaddrConnection).to.have.property(prop)
    })
    expect(isValidTick(multiaddrConnection.timeline.open)).to.equal(true)
    return multiaddrConnection
  }
  const upgrader: Upgrader = {
    async upgradeOutbound (multiaddrConnection) {
      ensureProps(multiaddrConnection)
      return await createConnection(multiaddrConnection, 'outbound')
    },
    async upgradeInbound (multiaddrConnection) {
      ensureProps(multiaddrConnection)
      return await createConnection(multiaddrConnection, 'inbound')
    }
  }

  return upgrader
}

async function createConnection (maConn: MultiaddrConnection, direction: 'inbound' | 'outbound'): Promise<Connection> {
  const localAddr = maConn.localAddr
  const remoteAddr = maConn.remoteAddr

  if (localAddr == null) {
    throw new Error('No localAddr found on MultiaddrConnection')
  }

  const localPeerIdStr = localAddr.getPeerId()
  const remotePeerIdStr = remoteAddr.getPeerId()
  const localPeer = localPeerIdStr != null ? PeerId.fromString(localPeerIdStr) : await PeerIdFactory.createEd25519PeerId()
  const remotePeer = remotePeerIdStr != null ? PeerId.fromString(remotePeerIdStr) : await PeerIdFactory.createEd25519PeerId()

  const streams: MuxedStream[] = []
  let streamId = 0

  const registry = new Map()

  return {
    id: 'mock-connection',
    localAddr,
    remoteAddr,
    localPeer,
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
      if (protocols.length === 0) {
        throw new Error('protocols must have a length')
      }

      const echo = pair<Uint8Array>()

      const id = `${streamId++}`
      const stream: MuxedStream = {
        id,
        sink: echo.sink,
        source: echo.source,
        close: () => {},
        abort: () => {},
        reset: () => {},
        timeline: {
          open: 0
        }
      }

      const streamData = {
        protocol: protocols[0],
        stream
      }

      registry.set(id, streamData)

      return streamData
    },
    addStream: (muxedStream: MuxedStream, streamData: StreamData) => {

    },
    removeStream: (id: string) => {
      registry.delete(id)
    },
    close: async () => {
      await maConn.close()
    }
  }
}
