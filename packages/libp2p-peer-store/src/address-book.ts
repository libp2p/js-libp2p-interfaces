import { logger } from '@libp2p/logger'
import errcode from 'err-code'
import { Multiaddr } from '@multiformats/multiaddr'
import { codes } from './errors.js'
import { PeerRecord, RecordEnvelope } from '@libp2p/peer-record'
import { pipe } from 'it-pipe'
import all from 'it-all'
import filter from 'it-filter'
import map from 'it-map'
import each from 'it-foreach'
import { base58btc } from 'multiformats/bases/base58'
import { PeerId } from '@libp2p/peer-id'
import type { PeerStore } from '@libp2p/interfaces/peer-store'
import type { Store } from './store.js'
import type { AddressFilter, AddressSorter } from './index.js'
import type { Envelope } from '@libp2p/interfaces/record'

const log = logger('libp2p:peer-store:address-book')
const EVENT_NAME = 'change:multiaddrs'

async function allowAll () {
  return true
}

export class PeerStoreAddressBook {
  private readonly emit: PeerStore['emit']
  private readonly store: Store
  private readonly addressFilter: AddressFilter

  constructor (emit: PeerStore['emit'], store: Store, addressFilter?: AddressFilter) {
    this.emit = emit
    this.store = store
    this.addressFilter = addressFilter ?? allowAll
  }

  /**
   * ConsumePeerRecord adds addresses from a signed peer record contained in a record envelope.
   * This will return a boolean that indicates if the record was successfully processed and added
   * into the AddressBook.
   */
  async consumePeerRecord (envelope: Envelope) {
    log('consumePeerRecord await write lock')
    const release = await this.store.lock.writeLock()
    log('consumePeerRecord got write lock')

    let peerId
    let updatedPeer

    try {
      let peerRecord
      try {
        peerRecord = PeerRecord.createFromProtobuf(envelope.payload)
      } catch (err: any) {
        log.error('invalid peer record received')
        return false
      }

      peerId = peerRecord.peerId
      const multiaddrs = peerRecord.multiaddrs

      // Verify peerId
      if (!peerId.equals(envelope.peerId)) {
        log('signing key does not match PeerId in the PeerRecord')
        return false
      }

      // ensure the record has multiaddrs
      if (multiaddrs == null || multiaddrs.length === 0) {
        return false
      }

      if (await this.store.has(peerId)) {
        const peer = await this.store.load(peerId)

        if (peer.peerRecordEnvelope != null) {
          const storedEnvelope = await RecordEnvelope.createFromProtobuf(peer.peerRecordEnvelope)
          const storedRecord = PeerRecord.createFromProtobuf(storedEnvelope.payload)

          // ensure seq is greater than, or equal to, the last received
          if (storedRecord.seqNumber >= peerRecord.seqNumber) {
            return false
          }
        }
      }

      // Replace unsigned addresses by the new ones from the record
      // TODO: Once we have ttls for the addresses, we should merge these in
      updatedPeer = await this.store.patchOrCreate(peerId, {
        addresses: await filterMultiaddrs(peerId, multiaddrs, this.addressFilter, true),
        peerRecordEnvelope: envelope.marshal()
      })

      log(`stored provided peer record for ${peerRecord.peerId.toString(base58btc)}`)
    } finally {
      log('consumePeerRecord release write lock')
      release()
    }

    this.emit(EVENT_NAME, { peerId, multiaddrs: updatedPeer.addresses.map(({ multiaddr }) => multiaddr) })

    return true
  }

  async getRawEnvelope (peerId: PeerId) {
    log('getRawEnvelope await read lock')
    const release = await this.store.lock.readLock()
    log('getRawEnvelope got read lock')

    try {
      const peer = await this.store.load(peerId)

      return peer.peerRecordEnvelope
    } catch (err: any) {
      if (err.code !== codes.ERR_NOT_FOUND) {
        throw err
      }
    } finally {
      log('getRawEnvelope release read lock')
      release()
    }
  }

  /**
   * Get an Envelope containing a PeerRecord for the given peer.
   * Returns undefined if no record exists.
   */
  async getPeerRecord (peerId: PeerId) {
    const raw = await this.getRawEnvelope(peerId)

    if (raw == null) {
      return undefined
    }

    return await RecordEnvelope.createFromProtobuf(raw)
  }

  async get (peerId: PeerId) {
    peerId = PeerId.fromPeerId(peerId)

    log('get wait for read lock')
    const release = await this.store.lock.readLock()
    log('get got read lock')

    try {
      const peer = await this.store.load(peerId)

      return peer.addresses
    } catch (err: any) {
      if (err.code !== codes.ERR_NOT_FOUND) {
        throw err
      }
    } finally {
      log('get release read lock')
      release()
    }

    return []
  }

  async set (peerId: PeerId, multiaddrs: Multiaddr[]) {
    peerId = PeerId.fromPeerId(peerId)

    if (!Array.isArray(multiaddrs)) {
      log.error('multiaddrs must be an array of Multiaddrs')
      throw errcode(new Error('multiaddrs must be an array of Multiaddrs'), codes.ERR_INVALID_PARAMETERS)
    }

    log('set await write lock')
    const release = await this.store.lock.writeLock()
    log('set got write lock')

    let hasPeer = false
    let updatedPeer

    try {
      const addresses = await filterMultiaddrs(peerId, multiaddrs, this.addressFilter)

      // No valid addresses found
      if (addresses.length === 0) {
        return
      }

      try {
        const peer = await this.store.load(peerId)
        hasPeer = true

        if (new Set([
          ...addresses.map(({ multiaddr }) => multiaddr.toString()),
          ...peer.addresses.map(({ multiaddr }) => multiaddr.toString())
        ]).size === peer.addresses.length && addresses.length === peer.addresses.length) {
          // not changing anything, no need to update
          return
        }
      } catch (err: any) {
        if (err.code !== codes.ERR_NOT_FOUND) {
          throw err
        }
      }

      updatedPeer = await this.store.patchOrCreate(peerId, { addresses })

      log(`set multiaddrs for ${peerId.toString(base58btc)}`)
    } finally {
      log('set release write lock')
      release()
    }

    this.emit(EVENT_NAME, { peerId, multiaddrs: updatedPeer.addresses.map(addr => addr.multiaddr) })

    // Notify the existence of a new peer
    if (!hasPeer) {
      this.emit('peer', peerId)
    }
  }

  async add (peerId: PeerId, multiaddrs: Multiaddr[]) {
    peerId = PeerId.fromPeerId(peerId)

    if (!Array.isArray(multiaddrs)) {
      log.error('multiaddrs must be an array of Multiaddrs')
      throw errcode(new Error('multiaddrs must be an array of Multiaddrs'), codes.ERR_INVALID_PARAMETERS)
    }

    log('add await write lock')
    const release = await this.store.lock.writeLock()
    log('add got write lock')

    let hasPeer
    let updatedPeer

    try {
      const addresses = await filterMultiaddrs(peerId, multiaddrs, this.addressFilter)

      // No valid addresses found
      if (addresses.length === 0) {
        return
      }

      try {
        const peer = await this.store.load(peerId)
        hasPeer = true

        if (new Set([
          ...addresses.map(({ multiaddr }) => multiaddr.toString()),
          ...peer.addresses.map(({ multiaddr }) => multiaddr.toString())
        ]).size === peer.addresses.length) {
          return
        }
      } catch (err: any) {
        if (err.code !== codes.ERR_NOT_FOUND) {
          throw err
        }
      }

      updatedPeer = await this.store.mergeOrCreate(peerId, { addresses })

      log(`added multiaddrs for ${peerId.toString(base58btc)}`)
    } finally {
      log('set release write lock')
      release()
    }

    this.emit(EVENT_NAME, { peerId, multiaddrs: updatedPeer.addresses.map(addr => addr.multiaddr) })

    // Notify the existence of a new peer
    if (hasPeer === true) {
      this.emit('peer', peerId)
    }
  }

  async delete (peerId: PeerId) {
    peerId = PeerId.fromPeerId(peerId)

    log('delete await write lock')
    const release = await this.store.lock.writeLock()
    log('delete got write lock')

    let has

    try {
      has = await this.store.has(peerId)

      await this.store.patchOrCreate(peerId, {
        addresses: []
      })
    } finally {
      log('delete release write lock')
      release()
    }

    if (has) {
      this.emit(EVENT_NAME, { peerId, multiaddrs: [] })
    }
  }

  async getMultiaddrsForPeer (peerId: PeerId, addressSorter: AddressSorter = (mas) => mas) {
    const addresses = await this.get(peerId)

    return addressSorter(
      addresses
    ).map((address) => {
      const multiaddr = address.multiaddr
      const idString = multiaddr.getPeerId()

      if (idString === peerId.toString()) {
        return multiaddr
      }

      return multiaddr.encapsulate(`/p2p/${peerId.toString(base58btc)}`)
    })
  }
}

async function filterMultiaddrs (peerId: PeerId, multiaddrs: Multiaddr[], addressFilter: AddressFilter, isCertified: boolean = false) {
  return await pipe(
    multiaddrs,
    (source) => each(source, (multiaddr) => {
      if (!Multiaddr.isMultiaddr(multiaddr)) {
        log.error('multiaddr must be an instance of Multiaddr')
        throw errcode(new Error('multiaddr must be an instance of Multiaddr'), codes.ERR_INVALID_PARAMETERS)
      }
    }),
    (source) => filter(source, async (multiaddr) => await addressFilter(peerId, multiaddr)),
    (source) => map(source, (multiaddr) => {
      return {
        multiaddr: new Multiaddr(multiaddr.toString()),
        isCertified
      }
    }),
    async (source) => await all(source)
  )
}
