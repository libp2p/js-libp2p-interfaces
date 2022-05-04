import type { AbortOptions } from '../index.js'
import type { EventEmitter } from '../events.js'
import type { Connection } from '../connection/index.js'
import type { PeerId } from '../peer-id/index.js'

export interface ConnectionManagerEvents {
  'peer:connect': CustomEvent<Connection>
  'peer:disconnect': CustomEvent<Connection>
}

export interface ConnectionManager extends EventEmitter<ConnectionManagerEvents> {
  /**
   * Return connections, optionally filtering by a PeerId
   */
  getConnections: (peerId?: PeerId) => Connection[]

  /**
   * Open a connection to a remote peer
   */
  openConnection: (peer: PeerId, options?: AbortOptions) => Promise<Connection>

  /**
   * Close our connections to a peer
   */
  closeConnections: (peer: PeerId) => Promise<void>
}
