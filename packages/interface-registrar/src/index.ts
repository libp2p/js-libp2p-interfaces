import type { Connection, Stream } from '@libp2p/interface-connection'
import type { PeerId } from '@libp2p/interface-peer-id'

export interface IncomingStreamData {
  protocol: string
  stream: Stream
  connection: Connection
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

export interface onConnectHandler {
  (peerId: PeerId, conn: Connection): void
}

export interface onDisconnectHandler {
  (peerId: PeerId, conn?: Connection): void
}

export interface TopologyInit {
  /**
   * minimum needed connections
   */
  min?: number

  /**
   * maximum needed connections
   */
  max?: number
  onConnect?: onConnectHandler
  onDisconnect?: onDisconnectHandler
}

export interface Topology {
  min: number
  max: number
  peers: Set<string>

  onConnect: (peerId: PeerId, conn: Connection) => void
  onDisconnect: (peerId: PeerId) => void
  setRegistrar: (registrar: Registrar) => Promise<void>
}

export const topologySymbol = Symbol.for('@libp2p/topology')

export function isTopology (other: any): other is Topology {
  return other != null && Boolean(other[topologySymbol])
}
