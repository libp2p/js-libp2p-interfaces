import type { AbortOptions } from '@libp2p/interfaces'
import type { EventEmitter } from '@libp2p/interfaces/events'
import type { Connection, ConnectionGater, MultiaddrConnection } from '@libp2p/interface-connection'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Multiaddr, Resolver } from '@multiformats/multiaddr'
import type { Metrics } from '@libp2p/interface-metrics'
import type { AddressSorter, PeerStore } from '@libp2p/interface-peer-store'
import type { TransportManager, Upgrader } from '@libp2p/interface-transport'
export interface ConnectionManagerComponents {
  peerId: PeerId
  metrics?: Metrics
  upgrader: Upgrader
  peerStore: PeerStore
  dialer: Dialer
}

export interface ConnectionManagerConfig {
  /**
   * The maximum number of connections libp2p is willing to have before it starts disconnecting. Defaults to `Infinity`
   */
  maxConnections: number

  /**
   * The minimum number of connections below which libp2p not activate preemptive disconnections. Defaults to `0`.
   */
  minConnections: number

  /**
   * Sets the maximum event loop delay (measured in milliseconds) this node is willing to endure before it starts disconnecting peers. Defaults to `Infinity`.
   */
  maxEventLoopDelay?: number

  /**
   * Sets the poll interval (in milliseconds) for assessing the current state and determining if this peer needs to force a disconnect. Defaults to `2000` (2 seconds).
   */
  pollInterval?: number

  /**
   * Multiaddr resolvers to use when dialing
   */
  resolvers?: Record<string, Resolver>

  /**
   * On startup we try to dial any peer that has previously been
   * tagged with KEEP_ALIVE up to this timeout in ms. (default: 60000)
   */
  startupReconnectTimeout?: number

  /**
   * A list of multiaddrs that will always be allowed (except if they are in the
   * deny list) to open connections to this node even if we've reached maxConnections
   */
  allow?: string[]

  /**
   * A list of multiaddrs that will never be allowed to open connections to
   * this node under any circumstances
   */
  deny?: string[]

  /**
   * If more than this many connections are opened per second by a single
   * host, reject subsequent connections
   */
  inboundConnectionThreshold?: number

  /**
   * The maximum number of parallel incoming connections allowed that have yet to
   * complete the connection upgrade - e.g. choosing connection encryption, muxer, etc
   */
  maxIncomingPendingConnections?: number
}

export interface ConnectionManagerEvents {
  /**
   * This event will be triggered anytime a new Connection is established to another peer.
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
   * This event will be triggered anytime we are disconnected from another peer, regardless of
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
   * Return a map of all connections with their associated PeerIds
   *
   * @example
   *
   * ```js
   * const connectionsMap = libp2p.connectionManager.getConnectionsMap()
   * ```
   */
  getConnectionsMap: () => Map<string, Connection[]>

  /**
   * Open a connection to a remote peer
   *
   * @example
   *
   * ```js
   * const connection = await libp2p.connectionManager.openConnection(peerId)
   * ```
   */
  openConnection: (peer: PeerId | Multiaddr, options?: AbortOptions) => Promise<Connection>

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
   * Return the components of the connection manager
   */
  getComponents: () => ConnectionManagerComponents

  /**
   * Return the configuration of the connection manager
   */
  getConfig: () => ConnectionManagerConfig
}

export interface DialerConfig {
  /**
   * Sort the known addresses of a peer before trying to dial
   */
  addressSorter?: AddressSorter

  /**
   * If true, try to connect to all discovered peers up to the connection manager limit
   */
  autoDial?: boolean

  /**
   * How long to wait between attempting to keep our number of concurrent connections
   * above minConnections
   */
  autoDialInterval: number

  /**
   * How long a dial attempt is allowed to take
   */
  dialTimeout?: number

  /**
   * When a new inbound connection is opened, the upgrade process (e.g. protect,
   * encrypt, multiplex etc) must complete within this number of ms.
   */
  inboundUpgradeTimeout: number

  /**
   * Number of max concurrent dials
   */
  maxParallelDials?: number

  /**
   * Number of max addresses to dial for a given peer
   */
  maxAddrsToDial?: number

  /**
   * Number of max concurrent dials per peer
   */
  maxDialsPerPeer?: number

  /**
   * Multiaddr resolvers to use when dialing
   */
  resolvers?: Record<string, Resolver>
}

export interface DialerComponents {
  peerId: PeerId
  metrics?: Metrics
  peerStore: PeerStore
  transportManager: TransportManager
  connectionGater: ConnectionGater
}

export interface Dialer {
  /**
   * Dial a peer or multiaddr and return the promise of a connection
   */
  dial: (peer: PeerId | Multiaddr, options?: AbortOptions) => Promise<Connection>

  /**
   * Request `num` dial tokens. Only the returned number of dials may be attempted.
   */
  getTokens: (num: number) => number[]

  /**
   * After a dial attempt succeeds or fails, return the passed token to the pool
   */
  releaseToken: (token: number) => void

  /**
   * Get the current dial targets which are pending
   */
  getPendingDialTargets: () => Map<string, AbortController>

  /**
   * Returns true if the peer id is in the pending dials
   */
  hasPendingDial: (peer: PeerId | Multiaddr) => boolean

  /**
   * Return the components of the dialer
   */
  getComponents: () => DialerComponents

  /**
   * Return the configuration of the dialer
   */
  getConfig: () => DialerConfig
}
