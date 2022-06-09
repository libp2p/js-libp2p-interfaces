import type { PeerId } from '@libp2p/interface-peer-id'
import type { PeerInfo } from '@libp2p/interface-peer-info'
import type { AbortOptions } from '@libp2p/interfaces'

export interface PeerRouting {
  findPeer: (peerId: PeerId, options?: AbortOptions) => Promise<PeerInfo>
  getClosestPeers: (key: Uint8Array, options?: AbortOptions) => AsyncIterable<PeerInfo>
}
