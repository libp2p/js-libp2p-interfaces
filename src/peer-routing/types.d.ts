export = PeerRouting;

import PeerId from 'peer-id'
import { Multiaddr } from 'multiaddr'

declare class PeerRouting {
  constructor (options?: Object);
  findPeer (peerId: PeerId, options?: Object): Promise<{ id: PeerId, multiaddrs: Multiaddr[] }>;
  getClosestPeers(key: Uint8Array, options?: Object): AsyncIterable<{ id: PeerId, multiaddrs: Multiaddr[] }>;
}
