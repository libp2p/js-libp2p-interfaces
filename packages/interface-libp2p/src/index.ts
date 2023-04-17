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

import type { AbortOptions } from '@libp2p/interfaces'
import type { EventEmitter } from '@libp2p/interfaces/events'
import type { Startable } from '@libp2p/interfaces/startable'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { DualDHT } from '@libp2p/interface-dht'
import type { PeerStore } from '@libp2p/interface-peer-store'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Connection, Stream } from '@libp2p/interface-connection'
import type { PeerRouting } from '@libp2p/interface-peer-routing'
import type { ContentRouting } from '@libp2p/interface-content-routing'
import type { PubSub } from '@libp2p/interface-pubsub'
import type { StreamHandler, StreamHandlerOptions, Topology } from '@libp2p/interface-registrar'
import type { Metrics } from '@libp2p/interface-metrics'
import type { PeerInfo } from '@libp2p/interface-peer-info'
import type { KeyChain } from '@libp2p/interface-keychain'

/**
 * Once you have a libp2p instance, you can listen to several events it emits, so that you can be notified of relevant network events.
 */
export interface Libp2pEvents {
  /**
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

/**
 * Fetch service lookup function
 */
export interface LookupFunction {
  (key: string): Promise<Uint8Array | null>
}

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
export interface Libp2p extends Startable, EventEmitter<Libp2pEvents> {
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
   * const metric = libp2p.registerMetric({
   *   'my-metric'
   * })
   *
   * // later
   * metric.update(5)
   * ```
   */
  metrics?: Metrics

  /**
   * The pubsub component implements a distributed [Publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)
   * network made up of libp2p nodes listening on various topics.
   *
   * @example
   *
   * ```js
   * libp2p.pubsub.addEventListener('message', (event) => {
   *   // ...
   * })
   * libp2p.pubsub.subscribe('my-topic')
   * ```
   */
  pubsub: PubSub

  /**
   * The [DHT](https://en.wikipedia.org/wiki/Distributed_hash_table) is used by
   * libp2p to store and find values such as provider records and also to discover
   * information about peers.
   *
   * @example
   *
   * ```js
   * for await (const event of libp2p.dht.findPeer(peerId)) {
   *   // ...
   * }
   * ```
   */
  dht: DualDHT

  /**
   * The fetch service allows registering and unregistering functions that supply
   * values for fetch queries - see the [fetch spec](https://github.com/libp2p/specs/tree/master/fetch).
   */
  fetchService: {
    /**
     * Registers a new lookup callback that can map keys to values, for a given set of keys that
     * share the same prefix
     *
     * @example
     *
     * ```js
     * libp2p.fetchService.registerLookupFunction('/prefix', (key) => { ... })
     * ```
     */
    registerLookupFunction: (prefix: string, lookup: LookupFunction) => void

    /**
     * Registers a new lookup callback that can map keys to values, for a given set of keys that
     * share the same prefix.
     *
     * @example
     *
     * ```js
     * libp2p.fetchService.unregisterLookupFunction('/prefix')
     * ```
     */
    unregisterLookupFunction: (prefix: string, lookup?: LookupFunction) => void
  }

  /**
   * The identify service supplies information about this node on request by network peers - see
   * this [identify spec](https://github.com/libp2p/specs/blob/master/identify/README.md)
   */
  identifyService: {
    host: {
      /**
       * Specifies the supported protocol version
       *
       * @example
       *
       * ```js
       * libp2p.identifyService.host.protocolVersion
       * // ipfs/0.1.0
       * ```
       */
      protocolVersion: string

      /**
       * Specifies the supported protocol version
       *
       * @example
       *
       * ```js
       * libp2p.identifyService.host.agentVersion
       * // helia/1.0.0
       * ```
       */
      agentVersion: string
    }
  }

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
   * Pings the given peer in order to obtain the operation latency
   *
   * @example
   *
   * ```js
   * const latency = await libp2p.ping(otherPeerId)
   * ```
   */
  ping: (peer: PeerId | Multiaddr, options?: AbortOptions) => Promise<number>

  /**
   * Sends a request to fetch the value associated with the given key from the given peer.
   *
   * @example
   *
   * ```js
   * const value = await libp2p.fetch(otherPeerId, '/some/key')
   * ```
   */
  fetch: (peer: PeerId | Multiaddr, key: string, options?: AbortOptions) => Promise<Uint8Array | null>

  /**
   * Returns the public key for the passed PeerId. If the PeerId is of the 'RSA' type
   * this may mean searching the DHT if the key is not present in the KeyStore.
   */
  getPublicKey: (peer: PeerId, options?: AbortOptions) => Promise<Uint8Array>
}
