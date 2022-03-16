import type { CID } from 'multiformats/cid'
import type { AbortOptions } from '../index.js'
import type { PeerData } from '../peer-data/index.js'

export interface ContentRouting {
  provide: (cid: CID, options?: AbortOptions) => Promise<void>
  findProviders: (cid: CID, options?: AbortOptions) => AsyncIterable<PeerData>
  put: (key: Uint8Array, value: Uint8Array, options?: AbortOptions) => Promise<void>
  get: (key: Uint8Array, options?: AbortOptions) => Promise<Uint8Array>
}
