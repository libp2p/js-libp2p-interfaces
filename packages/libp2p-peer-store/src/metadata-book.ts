import { logger } from '@libp2p/logger'
import errcode from 'err-code'
import { codes } from './errors.js'
import { PeerId } from '@libp2p/peer-id'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { CustomEvent } from '@libp2p/interfaces'
import type { Store } from './store.js'
import type { PeerStore, MetadataBook } from '@libp2p/interfaces/src/peer-store'

const log = logger('libp2p:peer-store:metadata-book')

const EVENT_NAME = 'change:metadata'

export class PeerStoreMetadataBook implements MetadataBook {
  private readonly dispatchEvent: PeerStore['dispatchEvent']
  private readonly store: Store

  /**
   * The MetadataBook is responsible for keeping metadata
   * about known peers
   */
  constructor (dispatchEvent: PeerStore['dispatchEvent'], store: Store) {
    this.dispatchEvent = dispatchEvent
    this.store = store
  }

  /**
   * Get the known data of a provided peer
   */
  async get (peerId: PeerId) {
    peerId = PeerId.fromPeerId(peerId)

    log('get await read lock')
    const release = await this.store.lock.readLock()
    log('get got read lock')

    try {
      const peer = await this.store.load(peerId)

      return peer.metadata
    } catch (err: any) {
      if (err.code !== codes.ERR_NOT_FOUND) {
        throw err
      }
    } finally {
      log('get release read lock')
      release()
    }

    return new Map()
  }

  /**
   * Get specific metadata value, if it exists
   */
  async getValue (peerId: PeerId, key: string) {
    peerId = PeerId.fromPeerId(peerId)

    log('getValue await read lock')
    const release = await this.store.lock.readLock()
    log('getValue got read lock')

    try {
      const peer = await this.store.load(peerId)

      return peer.metadata.get(key)
    } catch (err: any) {
      if (err.code !== codes.ERR_NOT_FOUND) {
        throw err
      }
    } finally {
      log('getValue release write lock')
      release()
    }
  }

  async set (peerId: PeerId, metadata: Map<string, Uint8Array>) {
    peerId = PeerId.fromPeerId(peerId)

    if (!(metadata instanceof Map)) {
      log.error('valid metadata must be provided to store data')
      throw errcode(new Error('valid metadata must be provided'), codes.ERR_INVALID_PARAMETERS)
    }

    log('set await write lock')
    const release = await this.store.lock.writeLock()
    log('set got write lock')

    try {
      await this.store.mergeOrCreate(peerId, {
        metadata
      })
    } finally {
      log('set release write lock')
      release()
    }

    this.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: { peerId, metadata }
    }))
  }

  /**
   * Set metadata key and value of a provided peer
   */
  async setValue (peerId: PeerId, key: string, value: Uint8Array) {
    peerId = PeerId.fromPeerId(peerId)

    if (typeof key !== 'string' || !(value instanceof Uint8Array)) {
      log.error('valid key and value must be provided to store data')
      throw errcode(new Error('valid key and value must be provided'), codes.ERR_INVALID_PARAMETERS)
    }

    log('setValue await write lock')
    const release = await this.store.lock.writeLock()
    log('setValue got write lock')

    let updatedPeer

    try {
      try {
        const existingPeer = await this.store.load(peerId)
        const existingValue = existingPeer.metadata.get(key)

        if (existingValue != null && uint8ArrayEquals(value, existingValue)) {
          return
        }
      } catch (err: any) {
        if (err.code !== codes.ERR_NOT_FOUND) {
          throw err
        }
      }

      updatedPeer = await this.store.mergeOrCreate(peerId, {
        metadata: new Map([[key, value]])
      })
    } finally {
      log('setValue release write lock')
      release()
    }

    this.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: { peerId, metadata: updatedPeer.metadata }
    }))
  }

  async delete (peerId: PeerId) {
    peerId = PeerId.fromPeerId(peerId)

    log('delete await write lock')
    const release = await this.store.lock.writeLock()
    log('delete got write lock')

    let has

    try {
      has = await this.store.has(peerId)

      if (has) {
        await this.store.patch(peerId, {
          metadata: new Map()
        })
      }
    } finally {
      log('delete release write lock')
      release()
    }

    if (has) {
      this.dispatchEvent(new CustomEvent(EVENT_NAME, {
        detail: { peerId, metadata: new Map() }
      }))
    }
  }

  async deleteValue (peerId: PeerId, key: string) {
    peerId = PeerId.fromPeerId(peerId)

    log('deleteValue await write lock')
    const release = await this.store.lock.writeLock()
    log('deleteValue got write lock')

    let metadata

    try {
      const peer = await this.store.load(peerId)
      metadata = peer.metadata

      metadata.delete(key)

      await this.store.patch(peerId, {
        metadata
      })
    } catch (err: any) {
      if (err.code !== codes.ERR_NOT_FOUND) {
        throw err
      }
    } finally {
      log('deleteValue release write lock')
      release()
    }

    if (metadata != null) {
      this.dispatchEvent(new CustomEvent(EVENT_NAME, {
        detail: { peerId, metadata }
      }))
    }
  }
}
