import type { PeerId } from '@libp2p/interface-peer-id'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { EventEmitter } from '@libp2p/interfaces/events'
import type { Envelope } from '@libp2p/interface-record'
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
   * Peer's addresses containing its multiaddrs and metadata
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
   * May be set if the key that this Peer has is an RSA key
   */
  pubKey?: Uint8Array

  /**
   * The last peer record envelope received
   */
  peerRecordEnvelope?: Uint8Array
}

export interface CertifiedRecord {
  raw: Uint8Array
  seqNumber: number
}

export interface AddressBookEntry {
  addresses: Address[]
  record: CertifiedRecord
}

export interface Book<Type> {
  /**
   * Get the known data of a peer
   */
  get: (peerId: PeerId) => Promise<Type>

  /**
   * Set the known data of a peer
   */
  set: (peerId: PeerId, data: Type) => Promise<void>

  /**
   * Remove the known data of a peer
   */
  delete: (peerId: PeerId) => Promise<void>
}

/**
 * AddressBook containing a map of peerIdStr to Address.
 */
export interface AddressBook {
  /**
   * ConsumePeerRecord adds addresses from a signed peer record contained in a record envelope.
   * This will return a boolean that indicates if the record was successfully processed and added
   * into the AddressBook
   */
  consumePeerRecord: (envelope: Envelope) => Promise<boolean>

  /**
   * Get the raw Envelope for a peer. Returns
   * undefined if no Envelope is found
   */
  getRawEnvelope: (peerId: PeerId) => Promise<Uint8Array | undefined>

  /**
   * Get an Envelope containing a PeerRecord for the given peer.
   * Returns undefined if no record exists.
   */
  getPeerRecord: (peerId: PeerId) => Promise<Envelope | undefined>

  /**
   * Add known addresses of a provided peer.
   * If the peer is not known, it is set with the given addresses.
   *
   * @example
   *
   * ```js
   * peerStore.addressBook.add(peerId, multiaddr)
   * ```
   */
  add: (peerId: PeerId, multiaddrs: Multiaddr[]) => Promise<void>

  /**
   * Set known `multiaddrs` of a given peer. This will replace previously stored multiaddrs, if available.
   *
   * Replacing stored multiaddrs might result in losing obtained certified addresses, which is not desirable.
   *
   * Consider using `addressBook.add()` if you're not sure this is what you want to do.
   *
   * @example
   *
   * ```js
   * peerStore.addressBook.add(peerId, multiaddr)
   * ```
   */
  set: (peerId: PeerId, data: Multiaddr[]) => Promise<void>

  /**
   * Return the known addresses of a peer
   *
   * ```js
   * peerStore.addressBook.get(peerId)
   * // []
   * peerStore.addressBook.set(peerId, multiaddr)
   * peerStore.addressBook.get(peerId)
   * // [
   * // {
   * //   multiaddr: /ip4/140.10.2.1/tcp/8000,
   * //   ...
   * // },
   * // {
   * //   multiaddr: /ip4/140.10.2.1/ws/8001
   * //   ...
   * // },
   * // ]
   * ```
   */
  get: (peerId: PeerId) => Promise<Address[]>

  /**
   * Remove stored addresses of a peer
   *
   * @example
   *
   * ```js
   * peerStore.addressBook.delete(peerId)
   * // false
   * peerStore.addressBook.set(peerId, multiaddr)
   * peerStore.addressBook.delete(peerId)
   * // true
   * ```
   */
  delete: (peerId: PeerId) => Promise<void>
}

/**
 * KeyBook containing a map of peerIdStr to their PeerId with public keys.
 */
export interface KeyBook {
  /**
   * Get the known `PublicKey` of a peer as a `Uint8Array`
   *
   * @example
   *
   * ```js
   * peerStore.keyBook.get(peerId)
   * // undefined
   * peerStore.keyBook.set(peerId, publicKey)
   * peerStore.keyBook.get(peerId)
   * // Uint8Array
   * ```
   */
  get: (peerId: PeerId) => Promise<Uint8Array | undefined>

  /**
   * Set the known data of a peer
   *
   * @example
   *
   * ```js
   * const publicKey = peerId.pubKey
   * peerStore.keyBook.set(peerId, publicKey)
   * ```
   */
  set: (peerId: PeerId, data: Uint8Array) => Promise<void>

  /**
   * Remove the known data of a peer
   *
   * @example
   *
   * ```js
   * peerStore.keyBook.get(peerId)
   * // undefined
   * peerStore.keyBook.set(peerId, publicKey)
   * peerStore.keyBook.get(peerId)
   * // Uint8Array
   * peerStore.keyBook.delete(peerId)
   * peerStore.keyBook.get(peerId)
   * // undefined
   * ```
   */
  delete: (peerId: PeerId) => Promise<void>
}

/**
 * MetadataBook containing a map of peerIdStr to their metadata Map.
 */
export interface MetadataBook extends Book<Map<string, Uint8Array>> {
  /**
   * Set a specific metadata value
   *
   * @example
   *
   * ```js
   * peerStore.metadataBook.setValue(peerId, 'nickname', uint8ArrayFromString('homePeer'))
   * peerStore.metadataBook.getValue(peerId, 'nickname')
   * // Uint8Array
   * ```
   */
  setValue: (peerId: PeerId, key: string, value: Uint8Array) => Promise<void>

  /**
   * Get specific metadata value, if it exists
   *
   * @example
   *
   * ```js
   * peerStore.metadataBook.getValue(peerId, 'location')
   * // undefined
   * peerStore.metadataBook.setValue(peerId, 'location', uint8ArrayFromString('Berlin'))
   * peerStore.metadataBook.getValue(peerId, 'location')
   * // Uint8Array
   * ```
   */
  getValue: (peerId: PeerId, key: string) => Promise<Uint8Array | undefined>

  /**
   * Deletes the provided peer metadata key from the book
   *
   * @example
   *
   * ```js
   * peerStore.metadataBook.getValue(peerId, 'location')
   * // undefined
   * peerStore.metadataBook.setValue(peerId, 'location', uint8ArrayFromString('Berlin'))
   * peerStore.metadataBook.getValue(peerId, 'location')
   * // Uint8Array
   * ```
   */
  deleteValue: (peerId: PeerId, key: string) => Promise<void>
}

/**
 * ProtoBook containing a map of peerIdStr to supported protocols.
 */
export interface ProtoBook extends Book<string[]> {
  /**
   * Adds known protocols of a provided peer.
   * If the peer was not known before, it will be added.
   *
   * @example
   *
   * ```js
   * peerStore.protoBook.add(peerId, [ '/proto/1.0.0', '/proto/1.1.0' ])
   * ```
   */
  add: (peerId: PeerId, protocols: string[]) => Promise<void>

  /**
   * Removes known protocols of a provided peer.
   * If the protocols did not exist before, nothing will be done.
   *
   * @example
   *
   * ```js
   * peerStore.protoBook.remove(peerId, protocols)
   * ```
   */
  remove: (peerId: PeerId, protocols: string[]) => Promise<void>
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

export interface AddressFilter {
  (peerId: PeerId, multiaddr: Multiaddr): Promise<boolean>
}

export interface AddressSorter {
  (a: Address, b: Address): -1 | 0 | 1
}

export interface PeerStoreInit {
  addressFilter?: AddressFilter
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
  addressBook: AddressBook
  keyBook: KeyBook
  metadataBook: MetadataBook
  protoBook: ProtoBook

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
   * Call this method to add a tag to a peer. Used by the connection manager
   * to reconnect to peers, choose peers to disconnect from, etc.
   *
   * @example
   *
   * Values are between 0-100
   *
   * ```js
   * peerStore.tagPeer(peerId, 'my-tag', {
   *   value: 50
   * })
   * ```
   *
   * @example
   *
   * Tags can be given a TTL, for example this tag will expire after 5s:
   *
   * * ```js
   * await peerStore.tagPeer(peerId, 'my-tag', {
   *   value: 50,
   *   ttl: 5000
   * })
   * ```
   */
  tagPeer: (peerId: PeerId, tag: string, options?: TagOptions) => Promise<void>

  /**
   * This method will remove a tag from a peer
   *
   * @example
   *
   * ```js
   * await peerStore.unTagPeer(peerId, 'my-tag)
   * ```
   */
  unTagPeer: (peerId: PeerId, tag: string) => Promise<void>

  /**
   * Return all tags that have been set on the passed peer
   *
   * @example
   *
   * ```js
   * const tags = await peerStore.getTags(peerId)
   * // []
   */
  getTags: (peerId: PeerId) => Promise<Tag[]>
}
