import type { AbortOptions } from '@libp2p/interfaces'
import type { EventEmitter } from '@libp2p/interfaces/events'
import type { Connection, MultiaddrConnection } from '@libp2p/interface-connection'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Multiaddr } from '@multiformats/multiaddr'

export interface ConnectionManagerEvents {
  /**
   * This event will be triggered any time a new Connection is established to another peer.
   *
   * @example
   *
   * ```js
   * libp2p.connectionManager.addEventListener('peer:connect', (event) => {
   *   const connection = event.detail
   *   // ...
   * })
   * ```
   */
  'peer:connect': CustomEvent<Connection>

  /**
   * This event will be triggered any time we are disconnected from another peer, regardless of
   * the circumstances of that disconnection. If we happen to have multiple connections to a
   * peer, this event will **only** be triggered when the last connection is closed.
   *
   * @example
   *
   * ```js
   * libp2p.connectionManager.addEventListener('peer:disconnect', (event) => {
   *   const connection = event.detail
   *   // ...
   * })
   * ```
   */
  'peer:disconnect': CustomEvent<Connection>

  /**
   * This event will be triggered when the connection manager has more connections than the
   * configured limit. The event detail contains the list of PeerIds from the connections
   * that were closed to bring the node back under the max connections limit.
   *
   * @example
   *
   * ```js
   * libp2p.connectionManager.addEventListener('peer:prune', (event) => {
   *   const connection = event.detail
   *   // ...
   * })
   * ```
   */
  'peer:prune': CustomEvent<PeerId[]>
}

export interface ConnectionManager extends EventEmitter<ConnectionManagerEvents> {
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
}

export interface Dialer {
  /**
   * Dial a peer or multiaddr, or multiple multiaddrs and return the promise of a connection
   */
  dial: (peer: PeerId | Multiaddr | Multiaddr[], options?: AbortOptions) => Promise<Connection>

  /**
   * Request `num` dial tokens. Only the returned number of dials may be attempted.
   */
  getTokens: (num: number) => number[]

  /**
   * After a dial attempt succeeds or fails, return the passed token to the pool
   */
  releaseToken: (token: number) => void
}
