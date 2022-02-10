import type { EventEmitter } from '../index.js'
import type { Connection, Stream } from '../connection/index.js'
import type { PeerId } from '../peer-id/index.js'

export interface IncomingStreamEvent {
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

export interface Registrar {
  handle: (multicodec: string | string[], handler: (event: IncomingStreamEvent) => void) => void
  unhandle: (multicodec: string) => void
  register: (topology: any) => string
  unregister: (id: string) => void
}
