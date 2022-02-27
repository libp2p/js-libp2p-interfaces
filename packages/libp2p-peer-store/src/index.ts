import { logger } from '@libp2p/logger'
import { EventEmitter } from '@libp2p/interfaces'
import { PeerStoreAddressBook } from './address-book.js'
import { PeerStoreKeyBook } from './key-book.js'
import { PeerStoreMetadataBook } from './metadata-book.js'
import { PeerStoreProtoBook } from './proto-book.js'
import { PersistentStore, Store } from './store.js'
import type { PeerStore, Address, AddressBook, KeyBook, MetadataBook, ProtoBook, PeerStoreEvents } from '@libp2p/interfaces/peer-store'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { Datastore } from 'interface-datastore'
import { base58btc } from 'multiformats/bases/base58'

const log = logger('libp2p:peer-store')

export interface AddressFilter {
  (peerId: PeerId, multiaddr: Multiaddr): Promise<boolean>
}

export interface AddressSorter {
  (addresses: Address[]): Address[]
}

export interface PeerStoreInit {
  peerId: PeerId
  datastore: Datastore
  addressFilter?: AddressFilter
}

/**
 * An implementation of PeerStore that stores data in a Datastore
 */
export class PeerStoreImpl extends EventEmitter<PeerStoreEvents> implements PeerStore {
  public addressBook: AddressBook
  public keyBook: KeyBook
  public metadataBook: MetadataBook
  public protoBook: ProtoBook

  private readonly peerId: PeerId
  private readonly store: Store

  constructor (init: PeerStoreInit) {
    super()

    const { peerId, datastore, addressFilter } = init

    this.peerId = peerId
    this.store = new PersistentStore(datastore)

    this.addressBook = new PeerStoreAddressBook(this.dispatchEvent.bind(this), this.store, addressFilter)
    this.keyBook = new PeerStoreKeyBook(this.dispatchEvent.bind(this), this.store)
    this.metadataBook = new PeerStoreMetadataBook(this.dispatchEvent.bind(this), this.store)
    this.protoBook = new PeerStoreProtoBook(this.dispatchEvent.bind(this), this.store)
  }

  async * getPeers () {
    log('getPeers await read lock')
    const release = await this.store.lock.readLock()
    log('getPeers got read lock')

    try {
      for await (const peer of this.store.all()) {
        if (peer.id.toString(base58btc) === this.peerId.toString(base58btc)) {
          // Remove self peer if present
          continue
        }

        yield peer
      }
    } finally {
      log('getPeers release read lock')
      release()
    }
  }

  /**
   * Delete the information of the given peer in every book
   */
  async delete (peerId: PeerId) {
    log('delete await write lock')
    const release = await this.store.lock.writeLock()
    log('delete got write lock')

    try {
      await this.store.delete(peerId)
    } finally {
      log('delete release write lock')
      release()
    }
  }

  /**
   * Get the stored information of a given peer
   */
  async get (peerId: PeerId) {
    log('get await read lock')
    const release = await this.store.lock.readLock()
    log('get got read lock')

    try {
      return await this.store.load(peerId)
    } finally {
      log('get release read lock')
      release()
    }
  }

  /**
   * Returns true if we have a record of the peer
   */
  async has (peerId: PeerId) {
    log('has await read lock')
    const release = await this.store.lock.readLock()
    log('has got read lock')

    try {
      return await this.store.has(peerId)
    } finally {
      log('has release read lock')
      release()
    }
  }
}

export function createPeerStore (init: PeerStoreInit): PeerStore {
  return new PeerStoreImpl(init)
}
