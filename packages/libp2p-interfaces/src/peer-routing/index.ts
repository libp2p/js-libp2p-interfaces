import type { PeerId } from '../peer-id'
import type { PeerData } from '../peer-data'

export interface PeerRoutingFactory {
  new (options?: any): PeerRouting
}

export interface PeerRouting {
  findPeer: (peerId: PeerId, options?: Object) => Promise<PeerData>
  getClosestPeers: (key: Uint8Array, options?: Object) => AsyncIterable<PeerData>
}

export default PeerRouting
