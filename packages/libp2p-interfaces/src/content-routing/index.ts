import type { CID } from 'multiformats/cid'
import type { AbortOptions } from '../index.js'
import type { PeerInfo } from '../peer-info/index.js'

export interface ContentRouting {
  provide: (cid: CID, options?: AbortOptions) => Promise<void>
  findProviders: (cid: CID, options?: AbortOptions) => AsyncIterable<PeerInfo>
  put: (key: Uint8Array, value: Uint8Array, options?: AbortOptions) => Promise<void>
  get: (key: Uint8Array, options?: AbortOptions) => Promise<Uint8Array>
}
