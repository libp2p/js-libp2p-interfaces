import type { CID } from 'multiformats/cid'
import type { AbortOptions } from '@libp2p/interfaces'
import type { PeerInfo } from '@libp2p/interface-peer-info'

export interface ContentRouting {
  /**
   * Iterates over all content routers in parallel, in order to notify it is a provider of the given key.
   *
   * @example
   *
   * ```js
   * // ...
   * await contentRouting.provide(cid)
   * ```
   */
  provide: (cid: CID, options?: AbortOptions) => Promise<void>

  /**
   * Iterates over all content routers in series to find providers of the given key.
   *
   * Once a content router succeeds, the iteration will stop. If the DHT is enabled, it will be queried first.
   *
   * @example
   *
   * ```js
   * // Iterate over the providers found for the given cid
   * for await (const provider of contentRouting.findProviders(cid)) {
   *  console.log(provider.id, provider.multiaddrs)
   * }
   * ```
   */
  findProviders: (cid: CID, options?: AbortOptions) => AsyncIterable<PeerInfo>

  /**
   * Writes a value to a key in the DHT.
   *
   * @example
   *
   * ```js
   * // ...
   * const key = '/key'
   * const value = uint8ArrayFromString('oh hello there')
   *
   * await contentRouting.put(key, value)
   * ```
   */
  put: (key: Uint8Array, value: Uint8Array, options?: AbortOptions) => Promise<void>

  /**
   * Queries the DHT for a value stored for a given key.
   *
   * @example
   *
   * ```js
   * // ...
   *
   * const key = '/key'
   * const value = await contentRouting.get(key)
   * ```
   */
  get: (key: Uint8Array, options?: AbortOptions) => Promise<Uint8Array>
}
