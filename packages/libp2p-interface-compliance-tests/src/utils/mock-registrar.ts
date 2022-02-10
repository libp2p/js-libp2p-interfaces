import type { IncomingStreamEvent, Registrar } from '@libp2p/interfaces/registrar'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { Connection } from '@libp2p/interfaces/connection'

class MockRegistrar implements Registrar {
  private readonly registrarRecord: Map<string, Record<string, any>> = new Map()

  handle (multicodecs: string | string[], handler: (event: IncomingStreamEvent) => void) {
    if (!Array.isArray(multicodecs)) {
      multicodecs = [multicodecs]
    }

    const rec = this.registrarRecord.get(multicodecs[0]) ?? {}

    this.registrarRecord.set(multicodecs[0], {
      ...rec,
      handler
    })
  }

  unhandle (multicodec: string) {
    this.registrarRecord.delete(multicodec)
  }

  register (topology: any) {
    const { multicodecs } = topology
    const rec = this.registrarRecord.get(multicodecs[0]) ?? {}

    this.registrarRecord.set(multicodecs[0], {
      ...rec,
      onConnect: topology._onConnect,
      onDisconnect: topology._onDisconnect
    })

    return multicodecs[0]
  }

  unregister (id: string) {
    this.registrarRecord.delete(id)
  }

  getConnection (peerId: PeerId): Connection | undefined {
    throw new Error('Not implemented')
  }
}

export function mockRegistrar () {
  return new MockRegistrar()
}
