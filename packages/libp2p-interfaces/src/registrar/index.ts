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
}

export interface ConnectionManager extends EventEmitter<ConnectionManagerEvents> {
  getConnection: (peerId: PeerId) => Connection | undefined
}

export interface StreamHandler {
  (event: CustomEvent<IncomingStreamData>): void
}

export interface Registrar {
  getProtocols: () => string[]
  handle: (protocol: string | string[], handler: StreamHandler) => Promise<string>
  unhandle: (id: string) => Promise<void>
  getHandler: (protocol: string) => StreamHandler

  register: (protocols: string | string[], topology: Topology) => string
  unregister: (id: string) => void
  getTopologies: (protocol: string) => Topology[]
}
