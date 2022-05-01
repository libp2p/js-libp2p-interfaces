import type { IncomingStreamData, Registrar, StreamHandler } from '@libp2p/interfaces/registrar'
import type { Connection } from '@libp2p/interfaces/connection'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { Topology } from '@libp2p/interfaces/topology'

export class MockRegistrar implements Registrar {
  private readonly topologies: Map<string, { topology: Topology, protocols: string[] }> = new Map()
  private readonly handlers: Map<string, StreamHandler> = new Map()

  getProtocols () {
    const protocols = new Set<string>()

    for (const topology of this.topologies.values()) {
      topology.protocols.forEach(protocol => protocols.add(protocol))
    }

    for (const protocol of this.handlers.keys()) {
      protocols.add(protocol)
    }

    return Array.from(protocols).sort()
  }

  async handle (protocols: string | string[], handler: StreamHandler): Promise<void> {
    const protocolList = Array.isArray(protocols) ? protocols : [protocols]

    for (const protocol of protocolList) {
      if (this.handlers.has(protocol)) {
        throw new Error(`Handler already registered for protocol ${protocol}`)
      }

      this.handlers.set(protocol, handler)
    }
  }

  async unhandle (protocols: string | string[]) {
    const protocolList = Array.isArray(protocols) ? protocols : [protocols]

    protocolList.forEach(protocol => {
      this.handlers.delete(protocol)
    })
  }

  getHandler (protocol: string) {
    const handler = this.handlers.get(protocol)

    if (handler == null) {
      throw new Error(`No handler registered for protocol ${protocol}`)
    }

    return handler
  }

  async register (protocols: string | string[], topology: Topology) {
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

    return []
  }
}

export function mockRegistrar () {
  return new MockRegistrar()
}

export async function mockIncomingStreamEvent (protocol: string, conn: Connection, remotePeer: PeerId): Promise<IncomingStreamData> {
  return {
    ...await conn.newStream([protocol]),
    // @ts-expect-error incomplete implementation
    connection: {
      remotePeer
    }
  }
}
