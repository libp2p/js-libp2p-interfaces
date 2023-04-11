import type { PeerId } from '@libp2p/interface-peer-id'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { EventEmitter } from '@libp2p/interfaces/events'
import type { PeerInfo } from '@libp2p/interface-peer-info'

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
   * Peer's addresses containing its multiaddrs and metadata
   */
  addresses?: Multiaddr[]

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
  tags?: Record<string, TagOptions>

  /**
   * If this Peer has an RSA key, it's public key can be set with this property
   */
  pubKey?: Uint8Array

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

export type EventName = 'peer' | 'change:protocols' | 'change:multiaddrs' | 'change:pubkey' | 'change:metadata'

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
   * This event is emitted when known protocols for a peer change
   *
   * @example
   *
   * ```js
   * peerStore.addEventListener('change:protocols', (event) => {
   *   const { peerId, protocols, oldProtocols } = event.detail
   *   // ...
   * })
   * ```
   */
  'change:protocols': CustomEvent<PeerProtocolsChangeData>

  /**
   * This event is emitted when known multiaddrs for a peer change
   *
   * @example
   *
   * ```js
   * peerStore.addEventListener('change:multiaddrs', (event) => {
   *   const { peerId, multiaddrs, oldMultiaddrs } = event.detail
   *   // ...
   * })
   * ```
   */
  'change:multiaddrs': CustomEvent<PeerMultiaddrsChangeData>

  /**
   * This event is emitted when the public key for a peer changes
   *
   * @example
   *
   * ```js
   * peerStore.addEventListener('change:pubkey', (event) => {
   *   const { peerId, publicKey, oldPublicKey } = event.detail
   *   // ...
   * })
   * ```
   */
  'change:pubkey': CustomEvent<PeerPublicKeyChangeData>

  /**
   * This event is emitted when known metadata for a peer changes
   *
   * @example
   *
   * ```js
   * peerStore.addEventListener('change:metadata', (event) => {
   *   const { peerId, metadata, oldMetadata } = event.detail
   *   // ...
   * })
   * ```
   */
  'change:metadata': CustomEvent<PeerMetadataChangeData>
}

export interface TagOptions {
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
  set: (id: PeerId, data: PeerData) => Promise<void>

  /**
   * Adds a peer to the peer store, merging any existing data.
   *
   * @example
   *
   * ```js
   * await peerStore.update(peerId, {
   *   multiaddrs
   * })
   * ```
   */
  update: (id: PeerId, data: PeerData) => Promise<void>
}
