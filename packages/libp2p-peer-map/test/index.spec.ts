import { expect } from 'aegir/utils/chai.js'
import { peerMap } from '../src/index.js'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { peerIdFromBytes } from '@libp2p/peer-id'

describe('peer-map', () => {
  it('should return a map', async () => {
    const map = peerMap<number>()
    const value = 5
    const peer = await createEd25519PeerId()

    map.set(peer, value)

    const peer2 = peerIdFromBytes(peer.toBytes())

    expect(map.get(peer2)).to.equal(value)
  })
})
