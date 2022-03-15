import type { CID } from 'multiformats/cid'
import type { AbortOptions } from '../index.js'
import type { PeerData } from '../peer-data/index.js'
import type { PeerId } from '../peer-id/index.js'

export interface GetResult {
  from: PeerId
  val: Uint8Array
}

export interface ContentRouting {
  provide: (cid: CID, options?: AbortOptions) => Promise<void>
  findProviders: (cid: CID, options?: AbortOptions) => AsyncIterable<PeerData>
  put: (key: Uint8Array, value: Uint8Array, options?: AbortOptions) => Promise<void>
  get: (key: Uint8Array, options?: AbortOptions) => Promise<GetResult>
}
