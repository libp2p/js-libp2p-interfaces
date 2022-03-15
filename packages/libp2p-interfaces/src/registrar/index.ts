import type { EventEmitter } from '../index.js'
import type { Connection, Stream } from '../connection/index.js'
import type { PeerId } from '../peer-id/index.js'
import type { Topology } from '../topology/index.js'

export interface IncomingStreamData {
  protocol: string
  stream: Stream
  connection: Connection
}

export interface ConnectionManagerEvents {
  'peer:connect': CustomEvent<Connection>
  'peer:disconnect': CustomEvent<Connection>
}

export interface ConnectionManager extends EventEmitter<ConnectionManagerEvents> {
  /**
   * Return all connections to the remote peer or an empty array
   */
  getConnections: (peerId: PeerId) => Connection[]

  /**
   * Return the first connection to a remote peer, if any
   */
  getConnection: (peerId: PeerId) => Connection | undefined

  /**
   * Returns all connections keyed by the stringified peer ID of the remote peer
   */
  getConnectionMap: () => Map<string, Connection[]>

  /**
   * Returns all connections
   */
  getConnectionList: () => Connection[]
}

export interface StreamHandler {
  (data: IncomingStreamData): void
}

export interface Registrar {
  getProtocols: () => string[]
  handle: (protocol: string | string[], handler: StreamHandler) => Promise<void>
  unhandle: (protocol: string | string[]) => Promise<void>
  getHandler: (protocol: string) => StreamHandler

  register: (protocols: string | string[], topology: Topology) => Promise<string>
  unregister: (id: string) => void
  getTopologies: (protocol: string) => Topology[]
}
