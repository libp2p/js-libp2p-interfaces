import { duplexPair } from 'it-pair/duplex'
import * as PeerIdFactory from '@libp2p/peer-id-factory'
import { PubsubBaseProtocol } from '../../src/index.js'
import { RPC, IRPC } from '../../src/message/rpc.js'
import { CustomEvent } from '@libp2p/interfaces'
import type { IncomingStreamData, Registrar, StreamHandler } from '@libp2p/interfaces/registrar'
import type { Ed25519PeerId } from '@libp2p/peer-id'
import type { Topology } from '@libp2p/interfaces/topology'
import type { Connection } from '@libp2p/interfaces/src/connection'
import type { PeerId } from '@libp2p/interfaces/src/peer-id'

export const createPeerId = async (): Promise<Ed25519PeerId> => {
  const peerId = await PeerIdFactory.createEd25519PeerId()

  return peerId
}

interface EventMap {
  'foo': CustomEvent
}

export class PubsubImplementation extends PubsubBaseProtocol<EventMap> {
  async _publish () {
    // ...
  }

  _decodeRpc (bytes: Uint8Array) {
    return RPC.decode(bytes)
  }

  _encodeRpc (rpc: IRPC) {
    return RPC.encode(rpc).finish()
  }
}

export class MockRegistrar implements Registrar {
  private readonly topologies: Map<string, { topology: Topology, protocols: string[] }> = new Map()
  private readonly handlers: Map<string, { handler: StreamHandler, protocols: string[] }> = new Map()

  async handle (protocols: string | string[], handler: StreamHandler) {
    if (!Array.isArray(protocols)) {
      protocols = [protocols]
    }

    const id = `handler-id-${Math.random()}`

    this.handlers.set(id, {
      handler,
      protocols
    })

    return id
  }

  async unhandle (id: string) {
    this.handlers.delete(id)
  }

  getHandlers (protocol: string) {
    const output: StreamHandler[] = []

    for (const { handler, protocols } of this.handlers.values()) {
      if (protocols.includes(protocol)) {
        output.push(handler)
      }
    }

    return output
  }

  register (protocols: string | string[], topology: Topology) {
    if (!Array.isArray(protocols)) {
      protocols = [protocols]
    }

    const id = `topology-id-${Math.random()}`

    this.topologies.set(id, {
      topology,
      protocols
    })

    return id
  }

  unregister (id: string | string[]) {
    if (!Array.isArray(id)) {
      id = [id]
    }

    id.forEach(id => this.topologies.delete(id))
  }

  getTopologies (protocol: string) {
    const output: Topology[] = []

    for (const { topology, protocols } of this.topologies.values()) {
      if (protocols.includes(protocol)) {
        output.push(topology)
      }
    }

    return output
  }
}

export const ConnectionPair = (): [Connection, Connection] => {
  const [d0, d1] = duplexPair<Uint8Array>()

  return [
    {
      // @ts-expect-error incomplete implementation
      newStream: async (protocol: string[]) => await Promise.resolve({
        protocol: protocol[0],
        stream: d0
      })
    },
    {
      // @ts-expect-error incomplete implementation
      newStream: async (protocol: string[]) => await Promise.resolve({
        protocol: protocol[0],
        stream: d1
      })
    }
  ]
}

export async function mockIncomingStreamEvent (protocol: string, conn: Connection, remotePeer: PeerId): Promise<CustomEvent<IncomingStreamData>> {
  // @ts-expect-error incomplete implementation
  return new CustomEvent('incomingStream', {
    detail: {
      ...await conn.newStream([protocol]),
      connection: {
        remotePeer
      }
    }
  })
}
