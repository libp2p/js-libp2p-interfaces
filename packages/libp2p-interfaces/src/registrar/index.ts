import type { Connection } from '../connection'
import type { MuxedStream } from '../stream-muxer'
import type { PeerId } from '../peer-id'
import type { PeerData } from '../peer-data'

export interface IncomingStreamEvent {
  protocol: string
  stream: MuxedStream
  connection: Connection
}

export interface ChangeProtocolsEvent {
  peerId: PeerId
  protocols: string[]
}

export interface ProtoBook {
  get: (peerId: PeerId) => string[]
}

export interface PeerStore {
  on: (event: 'change:protocols', handler: (event: ChangeProtocolsEvent) => void) => void
  protoBook: ProtoBook
  peers: Map<string, PeerData>
  get: (peerId: PeerId) => PeerData
}

export interface Registrar {
  handle: (multicodecs: string[], handler: (event: IncomingStreamEvent) => void) => void
  register: (topology: any) => string
  unregister: (id: string) => void
  getConnection: (peerId: PeerId) => Connection | undefined
  peerStore: PeerStore

  connectionManager: {
    on: (event: 'peer:connect', handler: (connection: Connection) => void) => void
  }
}
