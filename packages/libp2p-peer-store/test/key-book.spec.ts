/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { MemoryDatastore } from 'datastore-core/memory'
import { DefaultPeerStore } from '../src/index.js'
import pDefer from 'p-defer'
import { codes } from '../src/errors.js'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { PeerStore, KeyBook } from '@libp2p/interfaces/peer-store'
import { base58btc } from 'multiformats/bases/base58'

/**
 * @typedef {import('../../src/peer-store/types').PeerStore} PeerStore
 * @typedef {import('../../src/peer-store/types').KeyBook} KeyBook
 * @typedef {import('peer-id')} PeerId
 */

describe('keyBook', () => {
  let peerId: PeerId
  let peerStore: PeerStore
  let kb: KeyBook
  let datastore: MemoryDatastore

  beforeEach(async () => {
    peerId = await createEd25519PeerId()
    datastore = new MemoryDatastore()
    peerStore = new DefaultPeerStore({
      peerId,
      datastore
    })
    kb = peerStore.keyBook
  })

  it('throws invalid parameters error if invalid PeerId is provided in set', async () => {
    try {
      // @ts-expect-error invalid input
      await kb.set('invalid peerId')
    } catch (err: any) {
      expect(err.code).to.equal(codes.ERR_INVALID_PARAMETERS)
      return
    }
    throw new Error('invalid peerId should throw error')
  })

  it('throws invalid parameters error if invalid PeerId is provided in get', async () => {
    try {
      // @ts-expect-error invalid input
      await kb.get('invalid peerId')
    } catch (err: any) {
      expect(err.code).to.equal(codes.ERR_INVALID_PARAMETERS)
      return
    }
    throw new Error('invalid peerId should throw error')
  })

  it('stores the peerId in the book and returns the public key', async () => {
    if (peerId.publicKey == null) {
      throw new Error('Public key was missing')
    }

    // Set PeerId
    await kb.set(peerId, peerId.publicKey)

    // Get public key
    const pubKey = await kb.get(peerId)
    expect(peerId.publicKey).to.equalBytes(pubKey)
  })

  it('should not store if already stored', async () => {
    const spy = sinon.spy(datastore, 'put')

    if (peerId.publicKey == null) {
      throw new Error('Public key was missing')
    }

    // Set PeerId
    await kb.set(peerId, peerId.publicKey)
    await kb.set(peerId, peerId.publicKey)

    expect(spy).to.have.property('callCount', 1)
  })

  it('should emit an event when setting a key', async () => {
    const defer = pDefer()

    peerStore.addEventListener('change:pubkey', (evt) => {
      const { peerId: id, pubKey } = evt.detail
      if (peerId.publicKey == null) {
        throw new Error('Public key was missing')
      }

      expect(id.toString(base58btc)).to.equal(peerId.toString(base58btc))
      expect(pubKey).to.equalBytes(peerId.publicKey)
      defer.resolve()
    })

    if (peerId.publicKey == null) {
      throw new Error('Public key was missing')
    }

    // Set PeerId
    await kb.set(peerId, peerId.publicKey)
    await defer.promise
  })

  it('should not set when key does not match', async () => {
    const edKey = await createEd25519PeerId()

    if (peerId.publicKey == null) {
      throw new Error('Public key was missing')
    }

    // Set PeerId
    await expect(kb.set(edKey, peerId.publicKey)).to.eventually.be.rejectedWith(/bytes do not match/)
  })

  it('should emit an event when deleting a key', async () => {
    const defer = pDefer()

    if (peerId.publicKey == null) {
      throw new Error('Public key was missing')
    }

    await kb.set(peerId, peerId.publicKey)

    peerStore.addEventListener('change:pubkey', (evt) => {
      const { peerId: id, pubKey } = evt.detail
      expect(id.toString(base58btc)).to.equal(peerId.toString(base58btc))
      expect(pubKey).to.be.undefined()
      defer.resolve()
    })

    await kb.delete(peerId)
    await defer.promise
  })
})
