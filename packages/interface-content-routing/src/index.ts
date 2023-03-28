import type { CID } from 'multiformats/cid'
import type { AbortOptions } from '@libp2p/interfaces'
import type { PeerInfo } from '@libp2p/interface-peer-info'
import type { ProgressEvent, ProgressOptions } from 'progress-events'

export interface ContentRouting<
  ProvideProgressEvents extends ProgressEvent = ProgressEvent,
  FindProvidersProgressEvents extends ProgressEvent = ProgressEvent,
  PutProgressEvents extends ProgressEvent = ProgressEvent,
  GetProgressEvents extends ProgressEvent = ProgressEvent
> {
  /**
   * The implementation of this method should ensure that network peers know the
   * caller can provide content that corresponds to the passed CID.
   *
   * @example
   *
   * ```js
   * // ...
   * await contentRouting.provide(cid)
   * ```
   */
  provide: (cid: CID, options?: AbortOptions & ProgressOptions<ProvideProgressEvents>) => Promise<void>

  /**
   * Find the providers of the passed CID.
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
  findProviders: (cid: CID, options?: AbortOptions & ProgressOptions<FindProvidersProgressEvents>) => AsyncIterable<PeerInfo>

  /**
   * Puts a value corresponding to the passed key in a way that can later be
   * retrieved by another network peer using the get method.
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
  put: (key: Uint8Array, value: Uint8Array, options?: AbortOptions & ProgressOptions<PutProgressEvents>) => Promise<void>

  /**
   * Retrieves a value from the network corresponding to the passed key.
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
  get: (key: Uint8Array, options?: AbortOptions & ProgressOptions<GetProgressEvents>) => Promise<Uint8Array>
}
