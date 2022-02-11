import { logger } from '@libp2p/logger'
import errcode from 'err-code'
import { codes } from './errors.js'
import { PeerId as PeerIdImpl } from '@libp2p/peer-id'
import { base58btc } from 'multiformats/bases/base58'
import { CustomEvent } from '@libp2p/interfaces'
import type { Store } from './store.js'
import type { PeerStore, ProtoBook } from '@libp2p/interfaces/src/peer-store'
import type { PeerId } from '@libp2p/interfaces/peer-id'

const log = logger('libp2p:peer-store:proto-book')

const EVENT_NAME = 'change:protocols'

export class PeerStoreProtoBook implements ProtoBook {
  private readonly dispatchEvent: PeerStore['dispatchEvent']
  private readonly store: Store

  /**
   * The ProtoBook is responsible for keeping the known supported
   * protocols of a peer
   */
  constructor (dispatchEvent: PeerStore['dispatchEvent'], store: Store) {
    this.dispatchEvent = dispatchEvent
    this.store = store
  }

  async get (peerId: PeerId) {
    log('get wait for read lock')
    const release = await this.store.lock.readLock()
    log('get got read lock')

    try {
      const peer = await this.store.load(peerId)

      return peer.protocols
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

  async set (peerId: PeerId, protocols: string[]) {
    peerId = PeerIdImpl.fromPeerId(peerId)

    if (!Array.isArray(protocols)) {
      log.error('protocols must be provided to store data')
      throw errcode(new Error('protocols must be provided'), codes.ERR_INVALID_PARAMETERS)
    }

    log('set await write lock')
    const release = await this.store.lock.writeLock()
    log('set got write lock')

    let updatedPeer

    try {
      try {
        const peer = await this.store.load(peerId)

        if (new Set([
          ...protocols
        ]).size === peer.protocols.length) {
          return
        }
      } catch (err: any) {
        if (err.code !== codes.ERR_NOT_FOUND) {
          throw err
        }
      }

      updatedPeer = await this.store.patchOrCreate(peerId, {
        protocols
      })

      log(`stored provided protocols for ${peerId.toString(base58btc)}`)
    } finally {
      log('set release write lock')
      release()
    }

    this.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: { peerId, protocols: updatedPeer.protocols }
    }))
  }

  async add (peerId: PeerId, protocols: string[]) {
    peerId = PeerIdImpl.fromPeerId(peerId)

    if (!Array.isArray(protocols)) {
      log.error('protocols must be provided to store data')
      throw errcode(new Error('protocols must be provided'), codes.ERR_INVALID_PARAMETERS)
    }

    log('add await write lock')
    const release = await this.store.lock.writeLock()
    log('add got write lock')

    let updatedPeer

    try {
      try {
        const peer = await this.store.load(peerId)

        if (new Set([
          ...peer.protocols,
          ...protocols
        ]).size === peer.protocols.length) {
          return
        }
      } catch (err: any) {
        if (err.code !== codes.ERR_NOT_FOUND) {
          throw err
        }
      }

      updatedPeer = await this.store.mergeOrCreate(peerId, {
        protocols
      })

      log(`added provided protocols for ${peerId.toString(base58btc)}`)
    } finally {
      log('add release write lock')
      release()
    }

    this.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: { peerId, protocols: updatedPeer.protocols }
    }))
  }

  async remove (peerId: PeerId, protocols: string[]) {
    peerId = PeerIdImpl.fromPeerId(peerId)

    if (!Array.isArray(protocols)) {
      log.error('protocols must be provided to store data')
      throw errcode(new Error('protocols must be provided'), codes.ERR_INVALID_PARAMETERS)
    }

    log('remove await write lock')
    const release = await this.store.lock.writeLock()
    log('remove got write lock')

    let updatedPeer

    try {
      try {
        const peer = await this.store.load(peerId)
        const protocolSet = new Set(peer.protocols)

        for (const protocol of protocols) {
          protocolSet.delete(protocol)
        }

        if (peer.protocols.length === protocolSet.size) {
          return
        }

        protocols = Array.from(protocolSet)
      } catch (err: any) {
        if (err.code !== codes.ERR_NOT_FOUND) {
          throw err
        }
      }

      updatedPeer = await this.store.patchOrCreate(peerId, {
        protocols
      })
    } finally {
      log('remove release write lock')
      release()
    }

    this.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: { peerId, protocols: updatedPeer.protocols }
    }))
  }

  async delete (peerId: PeerId) {
    peerId = PeerIdImpl.fromPeerId(peerId)

    log('delete await write lock')
    const release = await this.store.lock.writeLock()
    log('delete got write lock')
    let has

    try {
      has = await this.store.has(peerId)

      await this.store.patchOrCreate(peerId, {
        protocols: []
      })
    } catch (err: any) {
      if (err.code !== codes.ERR_NOT_FOUND) {
        throw err
      }
    } finally {
      log('delete release write lock')
      release()
    }

    if (has === true) {
      this.dispatchEvent(new CustomEvent(EVENT_NAME, {
        detail: { peerId, protocols: [] }
      }))
    }
  }
}
