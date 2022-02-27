import { EventEmitter } from '@libp2p/interfaces'
import type { Connection } from '@libp2p/interfaces/src/connection'
import type { PeerId } from '@libp2p/interfaces/src/peer-id'
import type { ConnectionManager, ConnectionManagerEvents } from '@libp2p/interfaces/src/registrar'

class MockConnectionManager extends EventEmitter<ConnectionManagerEvents> implements ConnectionManager {
  getConnection (peerId: PeerId): Connection | undefined {
    throw new Error('Method not implemented.')
  }

  listenerCount (type: string): number {
    throw new Error('Method not implemented.')
  }

  addEventListener<U extends keyof ConnectionManagerEvents>(type: U, callback: ((evt: ConnectionManagerEvents[U]) => void) | { handleEvent: (evt: ConnectionManagerEvents[U]) => void } | null, options?: boolean | AddEventListenerOptions): void {
    throw new Error('Method not implemented.')
  }

  removeEventListener<U extends keyof ConnectionManagerEvents>(type: U, callback: (((evt: ConnectionManagerEvents[U]) => void) | { handleEvent: (evt: ConnectionManagerEvents[U]) => void } | null) | undefined, options?: boolean | EventListenerOptions): void {
    throw new Error('Method not implemented.')
  }

  dispatchEvent (event: Event): boolean {
    throw new Error('Method not implemented.')
  }
}

export function mockConnectionManager () {
  return new MockConnectionManager()
}
