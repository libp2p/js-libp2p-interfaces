import type { Registrar, StreamHandler } from '@libp2p/interfaces/registrar'
import type { Topology } from '@libp2p/interfaces/topology'

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

    return output
  }
}

export function mockRegistrar () {
  return new MockRegistrar()
}
