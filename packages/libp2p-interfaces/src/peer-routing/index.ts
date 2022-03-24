import type { PeerId } from '../peer-id/index.js'
import type { PeerInfo } from '../peer-info/index.js'
import type { AbortOptions } from '../index.js'

export interface PeerRouting {
  findPeer: (peerId: PeerId, options?: AbortOptions) => Promise<PeerInfo>
  getClosestPeers: (key: Uint8Array, options?: AbortOptions) => AsyncIterable<PeerInfo>
}
