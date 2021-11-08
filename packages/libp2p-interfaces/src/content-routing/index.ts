import type { PeerId } from '../peer-id'
import type { Multiaddr } from 'multiaddr'
import type { CID } from 'multiformats/cid'
import type { AbortOptions } from '../index'

export interface ContentRoutingFactory {
  new (options?: any): ContentRouting
}

export interface ContentRouting {
  provide: (cid: CID, options: AbortOptions) => Promise<void>
  findProviders: (cid: CID, options: AbortOptions) => AsyncIterable<{ id: PeerId, multiaddrs: Multiaddr[] }>
}

export default ContentRouting
