import { logger } from '@libp2p/logger'
import errcode from 'err-code'
import { codes } from './errors.js'
import { PeerId } from '@libp2p/peer-id'
import { equals as uint8arrayEquals } from 'uint8arrays/equals'
import type { Store } from './store.js'
import type { PeerStore, KeyBook } from '@libp2p/interfaces/src/peer-store'

/**
 * @typedef {import('./types').PeerStore} PeerStore
 * @typedef {import('./types').KeyBook} KeyBook
 * @typedef {import('libp2p-interfaces/src/keys/types').PublicKey} PublicKey
 */

const log = logger('libp2p:peer-store:key-book')

const EVENT_NAME = 'change:pubkey'

export class PeerStoreKeyBook implements KeyBook {
  private readonly emit: PeerStore['emit']
  private readonly store: Store

  /**
   * The KeyBook is responsible for keeping the known public keys of a peer
   */
  constructor (emit: PeerStore['emit'], store: Store) {
    this.emit = emit
    this.store = store
  }

  /**
   * Set the Peer public key
   */
  async set (peerId: PeerId, publicKey: Uint8Array) {
    peerId = PeerId.fromPeerId(peerId)

    if (!(publicKey instanceof Uint8Array)) {
      log.error('publicKey must be an instance of Uint8Array to store data')
      throw errcode(new Error('publicKey must be an instance of PublicKey'), codes.ERR_INVALID_PARAMETERS)
    }

    log('set await write lock')
    const release = await this.store.lock.writeLock()
    log('set got write lock')

    let updatedKey = false

    try {
      try {
        const existing = await this.store.load(peerId)

        if ((existing.pubKey != null) && uint8arrayEquals(existing.pubKey, publicKey)) {
          return
        }
      } catch (err: any) {
        if (err.code !== codes.ERR_NOT_FOUND) {
          throw err
        }
      }

      await this.store.patchOrCreate(peerId, {
        pubKey: publicKey
      })
      updatedKey = true
    } finally {
      log('set release write lock')
      release()
    }

    if (updatedKey) {
      this.emit(EVENT_NAME, { peerId, pubKey: publicKey })
    }
  }

  /**
   * Get Public key of the given PeerId, if stored
   */
  async get (peerId: PeerId) {
    peerId = PeerId.fromPeerId(peerId)

    log('get await write lock')
    const release = await this.store.lock.readLock()
    log('get got write lock')

    try {
      const peer = await this.store.load(peerId)

      return peer.pubKey
    } catch (err: any) {
      if (err.code !== codes.ERR_NOT_FOUND) {
        throw err
      }
    } finally {
      log('get release write lock')
      release()
    }
  }

  async delete (peerId: PeerId) {
    peerId = PeerId.fromPeerId(peerId)

    log('delete await write lock')
    const release = await this.store.lock.writeLock()
    log('delete got write lock')

    try {
      await this.store.patchOrCreate(peerId, {
        pubKey: undefined
      })
    } finally {
      log('delete release write lock')
      release()
    }

    this.emit(EVENT_NAME, { peerId, pubKey: undefined })
  }
}
