import type { PeerId } from '../peer-id/index.js'
import type { Connection } from '../connection/index.js'
import type { ConnectionManager } from '../registrar/index.js'
import type { PeerStore } from '../peer-store/index.js'

export interface onConnectHandler { (peerId: PeerId, conn: Connection): void }
export interface onDisconnectHandler { (peerId: PeerId, conn?: Connection): void }

export interface Handlers {
  onConnect?: onConnectHandler
  onDisconnect?: onDisconnectHandler
}

export interface TopologyOptions {
  /**
   * minimum needed connections
   */
  min?: number

  /**
   * maximum needed connections
   */
  max?: number
  handlers: Handlers
}

export interface Topology {
  min: number
  max: number
  peers: Set<string>

  disconnect: (id: PeerId) => void
}

export interface MulticodecTopologyOptions extends TopologyOptions {
  multicodecs: string[]
  peerStore: PeerStore
  connectionManager: ConnectionManager
}

export interface MulticodecTopology extends Topology {
  multicodecs: string[]
}
