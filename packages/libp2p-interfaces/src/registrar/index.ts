import type { EventEmitter } from '../index.js'
import type { Connection, Stream } from '../connection/index.js'
import type { PeerId } from '../peer-id/index.js'

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
  handle: (multicodec: string | string[], handler: StreamHandler) => Promise<void>
  unhandle: (multicodec: string) => Promise<void>

  register: (topology: any) => string
  unregister: (id: string) => void
}
