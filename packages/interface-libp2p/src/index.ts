/**
 * @packageDocumentation
 *
 * Use the `createLibp2p` function to create a libp2p node.
 *
 * @example
 *
 * ```typescript
 * import { createLibp2p } from 'libp2p'
 *
 * const node = await createLibp2p({
 *   // ...other options
 * })
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
import type { Registrar, StreamHandler, StreamHandlerOptions } from '@libp2p/interface-registrar'
import type { ConnectionManager } from '@libp2p/interface-connection-manager'
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
}

/**
 * Fetch service lookup function
 */
export interface LookupFunction {
  (key: string): Promise<Uint8Array | null>
}

export interface Libp2p extends Startable, EventEmitter<Libp2pEvents> {
  peerId: PeerId
  peerStore: PeerStore
  peerRouting: PeerRouting
  contentRouting: ContentRouting
  keychain: KeyChain
  connectionManager: ConnectionManager
  registrar: Registrar
  metrics?: Metrics
  pubsub: PubSub
  dht: DualDHT
  fetchService: {
    registerLookupFunction: (prefix: string, lookup: LookupFunction) => void
    unregisterLookupFunction: (prefix: string, lookup?: LookupFunction) => void
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
   * // ...
   * const listenMa = libp2p.getMultiaddrs()
   * // [ <Multiaddr 047f00000106f9ba - /ip4/127.0.0.1/tcp/63930> ]
   * ```
   */
  getMultiaddrs: () => Multiaddr[]

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
   * // ...
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
  dial: (peer: PeerId | Multiaddr, options?: AbortOptions) => Promise<Connection>

  /**
   * Dials to the provided peer and tries to handshake with the given protocols in order.
   * If successful, the known metadata of the peer will be added to the nodes `peerStore`,
   * and the `MuxedStream` will be returned together with the successful negotiated protocol.
   *
   * @example
   *
   * ```js
   * // ...
   * import { pipe } from 'it-pipe'
   *
   * const { stream, protocol } = await libp2p.dialProtocol(remotePeerId, protocols)
   *
   * // Use this new stream like any other duplex stream
   * pipe([1, 2, 3], stream, consume)
   * ```
   */
  dialProtocol: (peer: PeerId | Multiaddr, protocols: string | string[], options?: AbortOptions) => Promise<Stream>

  /**
   * Attempts to gracefully close an open connection to the given peer. If the connection is not closed in the grace period, it will be forcefully closed.
   *
   * @example
   *
   * ```js
   * // ...
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
   * // ...
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
   * // ...
   * libp2p.unhandle(['/echo/1.0.0'])
   * ```
   */
  unhandle: (protocols: string[] | string) => Promise<void>

  /**
   * Pings the given peer in order to obtain the operation latency
   *
   * @example
   *
   * ```js
   * // ...
   * const latency = await libp2p.ping(otherPeerId)
   * ```
   */
  ping: (peer: PeerId | Multiaddr, options?: AbortOptions) => Promise<number>

  /**
   * Sends a request to fetch the value associated with the given key from the given peer.
   *
   * ```js
   * // ...
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
