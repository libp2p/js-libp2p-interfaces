import type { Connection, Stream } from '../connection'
import type { PeerId } from '../peer-id'
import type { PeerStore } from '../peer-store'

export interface IncomingStreamEvent {
  protocol: string
  stream: Stream
  connection: Connection
}

export interface Registrar {
  handle: (multicodec: string | string[], handler: (event: IncomingStreamEvent) => void) => void
  unhandle: (multicodec: string) => void

  register: (topology: any) => string
  unregister: (id: string) => void
  getConnection: (peerId: PeerId) => Connection | undefined
  peerStore: PeerStore

  connectionManager: {
    on: (event: 'peer:connect', handler: (connection: Connection) => void) => void
  }
}
