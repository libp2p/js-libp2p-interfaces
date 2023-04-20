import type { PeerId } from '@libp2p/interface-peer-id'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { EventEmitter } from '@libp2p/interfaces/events'
import type { PeerInfo } from '@libp2p/interface-peer-info'

/**
 * Event detail emitted when peer data changes
 */
export interface PeerUpdate {
  peer: Peer
  previous?: Peer
}

export interface Address {
  /**
   * Peer multiaddr
   */
  multiaddr: Multiaddr

  /**
   * Obtained from a signed peer record
   */
  isCertified: boolean
}

export interface Peer {
  /**
   * Peer's peer-id instance
   */
  id: PeerId

  /**
   * Peer's addresses containing its multiaddrs
   */
  addresses: Address[]

  /**
   * Peer's supported protocols
   */
  protocols: string[]

  /**
   * Peer's metadata map
   */
  metadata: Map<string, Uint8Array>

  /**
   * Tags a peer has
   */
  tags: Tag[]

  /**
   * The last peer record envelope received
   */
  peerRecordEnvelope?: Uint8Array
}

export interface PeerData {
  /**
   * Peer's addresses containing its multiaddrs and metadata - multiaddrs
   * passed here can be treated as certified if the `isCertifed` value is
   * set to true.
   *
   * If both addresses and multiaddrs are specified they will be merged
   * together with entries in addresses taking precedence.
   */
  addresses?: Address[]

  /**
   * Peer's multiaddrs - any multiaddrs passed here will be treated as
   * uncertified.
   *
   * If both addresses and multiaddrs are specified they will be merged
   * together with entries in addresses taking precedence.
   */
  multiaddrs?: Multiaddr[]

  /**
   * Peer's supported protocols
   */
  protocols?: string[]

  /**
   * Peer's metadata map
   */
  metadata?: Map<string, Uint8Array> | Record<string, Uint8Array>

  /**
   * Peer tags
   */
  tags?: TagOptions[]

  /**
   * If this Peer has an RSA key, it's public key can be set with this property
   */
  publicKey?: Uint8Array

  /**
   * The last peer record envelope received
   */
  peerRecordEnvelope?: Uint8Array
}

export interface PeerProtocolsChangeData {
  peerId: PeerId
  protocols: string[]
  oldProtocols: string[]
}

export interface PeerMultiaddrsChangeData {
  peerId: PeerId
  multiaddrs: Multiaddr[]
  oldMultiaddrs: Multiaddr[]
}

export interface PeerPublicKeyChangeData {
  peerId: PeerId
  publicKey?: Uint8Array
  oldPublicKey?: Uint8Array
}

export interface PeerMetadataChangeData {
  peerId: PeerId
  metadata: Map<string, Uint8Array>
  oldMetadata: Map<string, Uint8Array>
}

export type EventName = 'peer' | 'peer:update' | 'self:peer:update'

export interface PeerStoreEvents {
  /**
   * This event is emitted when a new peer is added to the peerStore
   *
   * @example
   *
   * ```js
   * peerStore.addEventListener('peer', (event) => {
   *   const peerInfo = event.detail
   *   // ...
   * })
   * ```
   */
  'peer': CustomEvent<PeerInfo>

  /**
   * This event is emitted when the stored data for a peer changes.
   *
   * If the peer store already contained data about the peer it will be set
   * as the `previous` key on the event detail.
   *
   * @example
   *
   * ```js
   * peerStore.addEventListener('peer:update', (event) => {
   *   const { peer, previous } = event.detail
   *   // ...
   * })
   * ```
   */
  'peer:update': CustomEvent<PeerUpdate>

  /**
   * Similar to the 'peer:update' event, this event is dispatched when the
   * updated peer is the current node.
   *
   * @example
   *
   * ```js
   * peerStore.addEventListener('self:peer:update', (event) => {
   *   const { peer, previous } = event.detail
   *   // ...
   * })
   * ```
   */
  'self:peer:update': CustomEvent<PeerUpdate>
}

export interface TagOptions {
  /**
   * A tag name
   */
  name: string

  /**
   * An optional tag value (1-100)
   */
  value?: number

  /**
   * An optional duration in ms after which the tag will expire
   */
  ttl?: number
}

export interface Tag {
  /**
   * The tag name
   */
  name: string

  /**
   * The tag value
   */
  value: number
}

export interface PeerStore extends EventEmitter<PeerStoreEvents> {
  /**
   * Loop over every peer - the looping is async because we read from a
   * datastore but the peer operation is sync, this is to prevent
   * long-lived peer operations causing deadlocks over the datastore
   * which can happen if they try to access the peer store during the
   * loop
   *
   * @example
   *
   * ```js
   * await peerStore.forEach(peer => {
   *   // ...
   * })
   * ```
   */
  forEach: (fn: (peer: Peer) => void) => Promise<void>

  /**
   * Returns all peers in the peer store.
   *
   * @example
   *
   * ```js
   * for (const peer of await peerStore.all()) {
   *   // ...
   * }
   * ```
   */
  all: () => Promise<Peer[]>

  /**
   * Delete all data stored for the passed peer
   *
   * @example
   *
   * ```js
   * await peerStore.addressBook.set(peerId, multiaddrs)
   * await peerStore.addressBook.get(peerId)
   * // multiaddrs[]
   *
   * await peerStore.delete(peerId)
   *
   * await peerStore.addressBook.get(peerId)
   * // []
   * ```
   */
  delete: (peerId: PeerId) => Promise<void>

  /**
   * Returns true if the passed PeerId is in the peer store
   *
   * @example
   *
   * ```js
   * await peerStore.has(peerId)
   * // false
   * await peerStore.addressBook.add(peerId, multiaddrs)
   * await peerStore.has(peerId)
   * // true
   * ```
   */
  has: (peerId: PeerId) => Promise<boolean>

  /**
   * Returns all data stored for the passed PeerId
   *
   * @example
   *
   * ```js
   * const peer = await peerStore.get(peerId)
   * // { .. }
   * ```
   */
  get: (peerId: PeerId) => Promise<Peer>

  /**
   * Adds a peer to the peer store, replacing any existing data.
   *
   * @example
   *
   * ```js
   * await peerStore.set(peerId, {
   *   multiaddrs
   * })
   * ```
   */
  save: (id: PeerId, data: PeerData) => Promise<void>

  /**
   * Adds a peer to the peer store, merging any existing data.
   *
   * @example
   *
   * ```js
   * await peerStore.merge(peerId, {
   *   multiaddrs
   * })
   * ```
   */
  merge: (id: PeerId, data: PeerData) => Promise<void>
}
