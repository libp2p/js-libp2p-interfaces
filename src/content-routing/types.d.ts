import PeerId from 'peer-id'
import Multiaddr from 'multiaddr'
import CID from 'cids'

declare class ContentRouting {
  constructor (options: Object);
  provide (cid: CID): Promise<void>;
  findProviders (cid: CID, options: Object): AsyncIterable<{ id: PeerId, multiaddrs: Multiaddr[] }>;
}
