import type { PeerId } from '../peer-id/index.js'
import type { PeerData } from '../peer-data/index.js'
import type { AbortOptions } from '../index.js'

export interface PeerRoutingFactory<PeerRoutingInit> {
  new (init?: PeerRoutingInit): PeerRouting
}

export interface PeerRouting {
  findPeer: (peerId: PeerId, options?: AbortOptions) => Promise<PeerData>
  getClosestPeers: (key: Uint8Array, options?: AbortOptions) => AsyncIterable<PeerData>
}

export default PeerRouting
