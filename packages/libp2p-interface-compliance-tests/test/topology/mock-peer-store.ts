import { EventEmitter } from 'events'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { PeerData } from '@libp2p/interfaces/peer-data'
import type { ProtoBook, PeerStore } from '@libp2p/interfaces/registrar'

export class MockPeerStore extends EventEmitter implements PeerStore {
  public readonly peers: Map<string, PeerData>
  public protoBook: ProtoBook

  constructor (peers: Map<string, PeerData>) {
    super()
    this.protoBook = {
      get: () => ([])
    }
    this.peers = peers
  }

  get (peerId: PeerId) {
    const peerData = this.peers.get(peerId.toString())

    if (peerData == null) {
      throw new Error('PeerData not found')
    }

    return peerData
  }
}
