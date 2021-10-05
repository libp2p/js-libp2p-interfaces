import PeerId from 'peer-id'
import { Multiaddr } from 'multiaddr'
import { CID } from 'multiformats/cid'

export interface ContentRoutingFactory {
  new (options?: any): ContentRouting;
}

export interface ContentRouting {
  provide (cid: CID): Promise<void>;
  findProviders (cid: CID, options: Object): AsyncIterable<{ id: PeerId, multiaddrs: Multiaddr[] }>;
}

export interface ValueStoreInterface {
  put (key: Uint8Array, value: Uint8Array, options?: Object): Promise<void>
  get (key: Uint8Array, options?: Object): Promise<Uint8Array>
}

export default ContentRouting;
