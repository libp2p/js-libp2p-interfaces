import type { IncomingStreamData, Registrar, StreamHandler } from '@libp2p/interfaces/registrar'
import type { Connection } from '@libp2p/interfaces/src/connection'
import type { PeerId } from '@libp2p/interfaces/src/peer-id'
import type { Topology } from '@libp2p/interfaces/topology'
import { connectionPair } from './connection.js'
import { CustomEvent } from '@libp2p/interfaces'

export class MockRegistrar implements Registrar {
  private readonly topologies: Map<string, { topology: Topology, protocols: string[] }> = new Map()
  private readonly handlers: Map<string, { handler: StreamHandler, protocols: string[] }> = new Map()

  getProtocols () {
    const protocols = new Set<string>()

    for (const topology of this.topologies.values()) {
      topology.protocols.forEach(protocol => protocols.add(protocol))
    }

    for (const handler of this.handlers.values()) {
      handler.protocols.forEach(protocol => protocols.add(protocol))
    }

    return Array.from(protocols).sort()
  }

  async handle (protocols: string | string[], handler: StreamHandler) {
    if (!Array.isArray(protocols)) {
      protocols = [protocols]
    }

    for (const protocol of protocols) {
      for (const { protocols } of this.handlers.values()) {
        if (protocols.includes(protocol)) {
          throw new Error(`Handler already registered for protocol ${protocol}`)
        }
      }
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

  getHandler (protocol: string) {
    for (const { handler, protocols } of this.handlers.values()) {
      if (protocols.includes(protocol)) {
        return handler
      }
    }

    throw new Error(`No handler registered for protocol ${protocol}`)
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

    if (output.length > 0) {
      return output
    }

    throw new Error(`No topologies registered for protocol ${protocol}`)
  }
}

export function mockRegistrar () {
  return new MockRegistrar()
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

export interface Peer {
  peerId: PeerId
  registrar: Registrar
}

export async function connectPeers (protocol: string, a: Peer, b: Peer) {
  // Notify peers of connection
  const [aToB, bToA] = connectionPair(a, b)

  for (const topology of a.registrar.getTopologies(protocol)) {
    await topology.onConnect(b.peerId, aToB)
  }

  for (const topology of b.registrar.getTopologies(protocol)) {
    await topology.onConnect(a.peerId, bToA)
  }
}
