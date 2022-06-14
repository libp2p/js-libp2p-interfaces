import type { CID } from 'multiformats/cid'
import type { AbortOptions } from '@libp2p/interfaces'
import type { PeerInfo } from '@libp2p/interface-peer-info'

export interface ContentRouting {
  provide: (cid: CID, options?: AbortOptions) => Promise<void>
  findProviders: (cid: CID, options?: AbortOptions) => AsyncIterable<PeerInfo>
  put: (key: Uint8Array, value: Uint8Array, options?: AbortOptions) => Promise<void>
  get: (key: Uint8Array, options?: AbortOptions) => Promise<Uint8Array>
}
