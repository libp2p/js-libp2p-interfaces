import PeerId from 'peer-id'
import { Multiaddr } from 'multiaddr'

export interface PeerRoutingFactory {
  new (options?: any): PeerRouting;
}

export interface PeerRouting {
  findPeer (peerId: PeerId, options?: Object): Promise<{ id: PeerId, multiaddrs: Multiaddr[] }>;
  getClosestPeers(key: Uint8Array, options?: Object): AsyncIterable<{ id: PeerId, multiaddrs: Multiaddr[] }>;
}

export default PeerRouting;
