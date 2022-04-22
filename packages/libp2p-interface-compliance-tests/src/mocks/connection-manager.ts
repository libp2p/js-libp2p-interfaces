import { EventEmitter } from '@libp2p/interfaces'
import type { Connection } from '@libp2p/interfaces/connection'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { ConnectionManager, ConnectionManagerEvents } from '@libp2p/interfaces/registrar'

class MockConnectionManager extends EventEmitter<ConnectionManagerEvents> implements ConnectionManager {
  getConnectionMap (): Map<string, Connection[]> {
    return new Map<string, Connection[]>()
  }

  getConnectionList (): Connection[] {
    return []
  }

  getConnections (): Connection[] {
    return []
  }

  getConnection (peerId: PeerId): Connection | undefined {
    return undefined
  }
}

export function mockConnectionManager () {
  return new MockConnectionManager()
}
