import type { Connection, MultiaddrConnection } from '@libp2p/interface-connection'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { AbortOptions } from '@libp2p/interfaces'
import type { PeerMap } from '@libp2p/peer-collections'
import type { Multiaddr } from '@multiformats/multiaddr'

export type PendingDialStatus = 'queued' | 'active' | 'error' | 'success'

export interface PendingDial {
  id: string
  status: PendingDialStatus
  peerId?: PeerId
  multiaddrs: Multiaddr[]
}

export interface ConnectionManager {
  /**
   * Return connections, optionally filtering by a PeerId
   *
   * @example
   *
   * ```js
   * const connections = libp2p.connectionManager.get(peerId)
   * // []
   * ```
   */
  getConnections: (peerId?: PeerId) => Connection[]

  /**
   * Return a map of all connections with their associated PeerIds
   *
   * @example
   *
   * ```js
   * const connectionsMap = libp2p.connectionManager.getConnectionsMap()
   * ```
   */
  getConnectionsMap: () => PeerMap<Connection[]>

  /**
   * Open a connection to a remote peer
   *
   * @example
   *
   * ```js
   * const connection = await libp2p.connectionManager.openConnection(peerId)
   * ```
   */
  openConnection: (peer: PeerId | Multiaddr | Multiaddr[], options?: AbortOptions) => Promise<Connection>

  /**
   * Close our connections to a peer
   */
  closeConnections: (peer: PeerId) => Promise<void>

  /**
   * Invoked after an incoming connection is opened but before PeerIds are
   * exchanged, this lets the ConnectionManager check we have sufficient
   * resources to accept the connection in which case it will return true,
   * otherwise it will return false.
   */
  acceptIncomingConnection: (maConn: MultiaddrConnection) => Promise<boolean>

  /**
   * Invoked after upgrading a multiaddr connection has finished
   */
  afterUpgradeInbound: () => void

  /**
   * Return the list of in-progress or queued dials
   *
   * @example
   *
   * ```js
   * const dials = libp2p.connectionManager.getDialQueue()
   * ```
   */
  getDialQueue: () => PendingDial[]
}
