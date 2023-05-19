/**
 * @packageDocumentation
 *
 * Exports a `Libp2p` type for modules to use as a type argument.
 *
 * @example
 *
 * ```typescript
 * import type { Libp2p } from '@libp2p/interface-libp2p'
 *
 * function doSomethingWithLibp2p (node: Libp2p) {
 *   // ...
 * }
 * ```
 */

import type { Connection, Stream } from '@libp2p/interface-connection'
import type { ContentRouting } from '@libp2p/interface-content-routing'
import type { KeyChain } from '@libp2p/interface-keychain'
import type { Metrics } from '@libp2p/interface-metrics'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { PeerInfo } from '@libp2p/interface-peer-info'
import type { PeerRouting } from '@libp2p/interface-peer-routing'
import type { Address, Peer, PeerStore } from '@libp2p/interface-peer-store'
import type { StreamHandler, StreamHandlerOptions, Topology } from '@libp2p/interface-registrar'
import type { Listener } from '@libp2p/interface-transport'
import type { AbortOptions } from '@libp2p/interfaces'
import type { EventEmitter } from '@libp2p/interfaces/events'
import type { Startable } from '@libp2p/interfaces/startable'
import type { Multiaddr } from '@multiformats/multiaddr'

/**
 * Used by the connection manager to sort addresses into order before dialling
 */
export interface AddressSorter {
  (a: Address, b: Address): -1 | 0 | 1
}

/**
 * Event detail emitted when peer data changes
 */
export interface PeerUpdate {
  peer: Peer
  previous?: Peer
}

/**
 * Peer data signed by the remote Peer's public key
 */
export interface SignedPeerRecord {
  addresses: Multiaddr[]
  seq: bigint
}

/**
 * Data returned from a successful identify response
 */
export interface IdentifyResult {
  /**
   * The remote Peer's PeerId
   */
  peerId: PeerId

  /**
   * The unsigned addresses they are listening on. Note - any multiaddrs present
   * in the signed peer record should be preferred to the value here.
   */
  listenAddrs: Multiaddr[]

  /**
   * The protocols the remote peer supports
   */
  protocols: string[]

  /**
   * The remote protocol version
   */
  protocolVersion?: string

  /**
   * The remote agent version
   */
  agentVersion?: string

  /**
   * The public key part of the remote PeerId - this is only useful for older
   * RSA-based PeerIds, the more modern Ed25519 and secp256k1 types have the
   * public key embedded in them
   */
  publicKey?: Uint8Array

  /**
   * If set this is the address that the remote peer saw the identify request
   * originate from
   */
  observedAddr?: Multiaddr

  /**
   * If sent by the remote peer this is the deserialized signed peer record
   */
  signedPeerRecord?: SignedPeerRecord
}

/**
 * Once you have a libp2p instance, you can listen to several events it emits,
 * so that you can be notified of relevant network events.
 *
 * Event names are `noun:verb` so the first part is the name of the object
 * being acted on and the second is the action.
 */
export interface Libp2pEvents<T extends ServiceMap = ServiceMap> {
  /**
   * This event is dispatched when a new network peer is discovered.
   *
   * @example
   *
   * ```js
   * libp2p.addEventListener('peer:discovery', (event) => {
   *    const peerInfo = event.detail
   *    // ...
   * })
   * ```
   */
  'peer:discovery': CustomEvent<PeerInfo>

  /**
   * This event will be triggered any time a new peer connects.
   *
   * @example
   *
   * ```js
   * libp2p.addEventListener('peer:connect', (event) => {
   *   const peerId = event.detail
   *   // ...
   * })
   * ```
   */
  'peer:connect': CustomEvent<PeerId>

  /**
   * This event will be triggered any time we are disconnected from another peer, regardless of
   * the circumstances of that disconnection. If we happen to have multiple connections to a
   * peer, this event will **only** be triggered when the last connection is closed.
   *
   * @example
   *
   * ```js
   * libp2p.addEventListener('peer:disconnect', (event) => {
   *   const peerId = event.detail
   *   // ...
   * })
   * ```
   */
  'peer:disconnect': CustomEvent<PeerId>

  /**
   * This event is dispatched after a remote peer has successfully responded to the identify
   * protocol. Note that for this to be emitted, both peers must have an identify service
   * configured.
   *
   * @example
   *
   * ```js
   * libp2p.addEventListener('peer:identify', (event) => {
   *   const identifyResult = event.detail
   *   // ...
   * })
   * ```
   */
  'peer:identify': CustomEvent<IdentifyResult>

  /**
   * This event is dispatched when the peer store data for a peer has been
   * updated - e.g. their multiaddrs, protocols etc have changed.
   *
   * If they were previously known to this node, the old peer data will be
   * set in the `previous` field.
   *
   * This may be in response to the identify protocol running, a manual
   * update or some other event.
   */
  'peer:update': CustomEvent<PeerUpdate>

  /**
   * This event is dispatched when the current node's peer record changes -
   * for example a transport started listening on a new address or a new
   * protocol handler was registered.
   *
   * @example
   *
   * ```js
   * libp2p.addEventListener('self:peer:update', (event) => {
   *   const { peer } = event.detail
   *   // ...
   * })
   * ```
   */
  'self:peer:update': CustomEvent<PeerUpdate>

  /**
   * This event is dispatched when a transport begins listening on a new address
   */
  'transport:listening': CustomEvent<Listener>

  /**
   * This event is dispatched when a transport stops listening on an address
   */
  'transport:close': CustomEvent<Listener>

  /**
   * This event is dispatched when the connection manager has more than the
   * configured allowable max connections and has closed some connections to
   * bring the node back under the limit.
   */
  'connection:prune': CustomEvent<Connection[]>

  /**
   * This event notifies listeners when new incoming or outgoing connections
   * are opened.
   */
  'connection:open': CustomEvent<Connection>

  /**
   * This event notifies listeners when incoming or outgoing connections are
   * closed.
   */
  'connection:close': CustomEvent<Connection>

  /**
   * This event notifies listeners that the node has started
   *
   * ```js
   * libp2p.addEventListener('start', (event) => {
   *   console.info(libp2p.isStarted()) // true
   * })
   * ```
   */
  'start': CustomEvent<Libp2p<T>>

  /**
   * This event notifies listeners that the node has stopped
   *
   * ```js
   * libp2p.addEventListener('stop', (event) => {
   *   console.info(libp2p.isStarted()) // false
   * })
   * ```
   */
  'stop': CustomEvent<Libp2p<T>>
}

/**
 * A map of user defined services available on the libp2p node via the
 * `services` key
 *
 * @example
 *
 * ```js
 * const node = await createLibp2p({
 *   // ...other options
 *   services: {
 *     myService: myService({
 *       // ...service options
 *     })
 *   }
 * })
 *
 * // invoke methods on the service
 * node.services.myService.anOperation()
 * ```
 */
export type ServiceMap = Record<string, unknown>

export type PendingDialStatus = 'queued' | 'active' | 'error' | 'success'

/**
 * An item in the dial queue
 */
export interface PendingDial {
  /**
   * A unique identifier for this dial
   */
  id: string

  /**
   * The current status of the dial
   */
  status: PendingDialStatus

  /**
   * If known, this is the peer id that libp2p expects to be dialling
   */
  peerId?: PeerId

  /**
   * The list of multiaddrs that will be dialled. The returned connection will
   * use the first address that succeeds, all other dials part of this pending
   * dial will be cancelled.
   */
  multiaddrs: Multiaddr[]
}

/**
 * Libp2p nodes implement this interface.
 */
export interface Libp2p<T extends ServiceMap = ServiceMap> extends Startable, EventEmitter<Libp2pEvents<T>> {
  /**
   * The PeerId is a unique identifier for a node on the network.
   *
   * It is the hash of an RSA public key or, for Ed25519 or secp256k1 keys,
   * the key itself.
   *
   * @example
   *
   * ```js
   * console.info(libp2p.peerId)
   * // PeerId(12D3Foo...)
   * ````
   */
  peerId: PeerId

  /**
   * The peer store holds information we know about other peers on the network.
   * - multiaddrs, supported protocols, etc.
   *
   * @example
   *
   * ```js
   * const peer = await libp2p.peerStore.get(peerId)
   * console.info(peer)
   * // { id: PeerId(12D3Foo...), addresses: [] ... }
   * ```
   */
  peerStore: PeerStore

  /**
   * The peer routing subsystem allows the user to find peers on the network
   * or to find peers close to binary keys.
   *
   * @example
   *
   * ```js
   * const peerInfo = await libp2p.peerRouting.findPeer(peerId)
   * console.info(peerInfo)
   * // { id: PeerId(12D3Foo...), multiaddrs: [] ... }
   * ```
   *
   * @example
   *
   * ```js
   * for await (const peerInfo of libp2p.peerRouting.getClosestPeers(key)) {
   *   console.info(peerInfo)
   *   // { id: PeerId(12D3Foo...), multiaddrs: [] ... }
   * }
   * ```
   */
  peerRouting: PeerRouting

  /**
   * The content routing subsystem allows the user to find providers for content,
   * let the network know they are providers for content, and get/put values to
   * the DHT.
   *
   * @example
   *
   * ```js
   * for await (const peerInfo of libp2p.contentRouting.findProviders(cid)) {
   *   console.info(peerInfo)
   *   // { id: PeerId(12D3Foo...), multiaddrs: [] ... }
   * }
   * ```
   */
  contentRouting: ContentRouting

  /**
   * The keychain contains the keys used by the current node, and can create new
   * keys, export them, import them, etc.
   *
   * @example
   *
   * ```js
   * const keyInfo = await libp2p.keychain.createKey('new key')
   * console.info(keyInfo)
   * // { id: '...', name: 'new key' }
   * ```
   */
  keychain: KeyChain

  /**
   * The metrics subsystem allows recording values to assess the health/performance
   * of the running node.
   *
   * @example
   *
   * ```js
   * const metric = libp2p.metrics.registerMetric({
   *   'my-metric'
   * })
   *
   * // later
   * metric.update(5)
   * ```
   */
  metrics?: Metrics

  /**
   * Get a deduplicated list of peer advertising multiaddrs by concatenating
   * the listen addresses used by transports with any configured
   * announce addresses as well as observed addresses reported by peers.
   *
   * If Announce addrs are specified, configured listen addresses will be
   * ignored though observed addresses will still be included.
   *
   * @example
   *
   * ```js
   * const listenMa = libp2p.getMultiaddrs()
   * // [ <Multiaddr 047f00000106f9ba - /ip4/127.0.0.1/tcp/63930> ]
   * ```
   */
  getMultiaddrs: () => Multiaddr[]

  /**
   * Returns a list of supported protocols
   *
   * @example
   *
   * ```js
   * const protocols = libp2p.getProtocols()
   * // [ '/ipfs/ping/1.0.0', '/ipfs/id/1.0.0' ]
   * ```
   */
  getProtocols: () => string[]

  /**
   * Return a list of all connections this node has open, optionally filtering
   * by a PeerId
   *
   * @example
   *
   * ```js
   * for (const connection of libp2p.getConnections()) {
   *   console.log(peerId, connection.remoteAddr.toString())
   *   // Logs the PeerId string and the observed remote multiaddr of each Connection
   * }
   * ```
   */
  getConnections: (peerId?: PeerId) => Connection[]

  /**
   * Return the list of dials currently in progress or queued to start
   *
   * @example
   *
   * ```js
   * for (const pendingDial of libp2p.getDialQueue()) {
   *   console.log(pendingDial)
   * }
   * ```
   */
  getDialQueue: () => PendingDial[]

  /**
   * Return a list of all peers we currently have a connection open to
   */
  getPeers: () => PeerId[]

  /**
   * Dials to the provided peer. If successful, the known metadata of the
   * peer will be added to the nodes `peerStore`.
   *
   * If a PeerId is passed as the first argument, the peer will need to have known multiaddrs for it in the PeerStore.
   *
   * @example
   *
   * ```js
   * const conn = await libp2p.dial(remotePeerId)
   *
   * // create a new stream within the connection
   * const { stream, protocol } = await conn.newStream(['/echo/1.1.0', '/echo/1.0.0'])
   *
   * // protocol negotiated: 'echo/1.0.0' means that the other party only supports the older version
   *
   * // ...
   * await conn.close()
   * ```
   */
  dial: (peer: PeerId | Multiaddr | Multiaddr[], options?: AbortOptions) => Promise<Connection>

  /**
   * Dials to the provided peer and tries to handshake with the given protocols in order.
   * If successful, the known metadata of the peer will be added to the nodes `peerStore`,
   * and the `MuxedStream` will be returned together with the successful negotiated protocol.
   *
   * @example
   *
   * ```js
   * import { pipe } from 'it-pipe'
   *
   * const { stream, protocol } = await libp2p.dialProtocol(remotePeerId, protocols)
   *
   * // Use this new stream like any other duplex stream
   * pipe([1, 2, 3], stream, consume)
   * ```
   */
  dialProtocol: (peer: PeerId | Multiaddr | Multiaddr[], protocols: string | string[], options?: AbortOptions) => Promise<Stream>

  /**
   * Attempts to gracefully close an open connection to the given peer. If the connection is not closed in the grace period, it will be forcefully closed.
   *
   * @example
   *
   * ```js
   * await libp2p.hangUp(remotePeerId)
   * ```
   */
  hangUp: (peer: PeerId | Multiaddr) => Promise<void>

  /**
   * Sets up [multistream-select routing](https://github.com/multiformats/multistream-select) of protocols to their application handlers. Whenever a stream is opened on one of the provided protocols, the handler will be called. `handle` must be called in order to register a handler and support for a given protocol. This also informs other peers of the protocols you support.
   *
   * `libp2p.handle(protocols, handler, options)`
   *
   * In the event of a new handler for the same protocol being added, the first one is discarded.
   *
   * @example
   *
   * ```js
   * const handler = ({ connection, stream, protocol }) => {
   *   // use stream or connection according to the needs
   * }
   *
   * libp2p.handle('/echo/1.0.0', handler, {
   *   maxInboundStreams: 5,
   *   maxOutboundStreams: 5
   * })
   * ```
   */
  handle: (protocol: string | string[], handler: StreamHandler, options?: StreamHandlerOptions) => Promise<void>

  /**
   * Removes the handler for each protocol. The protocol
   * will no longer be supported on streams.
   *
   * @example
   *
   * ```js
   * libp2p.unhandle(['/echo/1.0.0'])
   * ```
   */
  unhandle: (protocols: string[] | string) => Promise<void>

  /**
   * Register a topology to be informed when peers are encountered that
   * support the specified protocol
   *
   * @example
   *
   * ```js
   * import { createTopology } from '@libp2p/topology'
   *
   * const id = await libp2p.register('/echo/1.0.0', createTopology({
   *   onConnect: (peer, connection) => {
   *     // handle connect
   *   },
   *   onDisconnect: (peer, connection) => {
   *     // handle disconnect
   *   }
   * }))
   * ```
   */
  register: (protocol: string, topology: Topology) => Promise<string>

  /**
   * Unregister topology to no longer be informed when peers connect or
   * disconnect.
   *
   * @example
   *
   * ```js
   * const id = await libp2p.register(...)
   *
   * libp2p.unregister(id)
   * ```
   */
  unregister: (id: string) => void

  /**
   * Returns the public key for the passed PeerId. If the PeerId is of the 'RSA' type
   * this may mean searching the DHT if the key is not present in the KeyStore.
   * A set of user defined services
   */
  getPublicKey: (peer: PeerId, options?: AbortOptions) => Promise<Uint8Array>

  /**
   * A set of user defined services
   */
  services: T
}
