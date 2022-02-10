import type { Registrar, StreamHandler } from '@libp2p/interfaces/registrar'
import type { MulticodecTopology } from '../../../libp2p-topology/src/multicodec-topology'

export class MockRegistrar implements Registrar {
  public readonly topologies: Map<string, MulticodecTopology> = new Map()
  public readonly streamHandlers: Map<string, StreamHandler> = new Map()

  async handle (multicodecs: string | string[], handler: StreamHandler) {
    if (!Array.isArray(multicodecs)) {
      multicodecs = [multicodecs]
    }

    this.streamHandlers.set(multicodecs[0], handler)
  }

  async unhandle (multicodec: string) {
    this.streamHandlers.delete(multicodec)
  }

  register (topology: MulticodecTopology) {
    const { multicodecs } = topology

    this.topologies.set(multicodecs[0], topology)

    return multicodecs[0]
  }

  unregister (id: string) {
    this.topologies.delete(id)
  }
}

export function mockRegistrar () {
  return new MockRegistrar()
}
