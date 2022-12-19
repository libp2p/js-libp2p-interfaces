import type { PeerId } from '@libp2p/interface-peer-id'
import type { PeerInfo } from '@libp2p/interface-peer-info'
import type { AbortOptions } from '@libp2p/interfaces'

export interface PeerRouting {
  /**
   * Iterates over all peer routers in series to find the given peer. If the DHT is enabled, it will be tried first.
   *
   * @example
   *
   * ```js
   * // ...
   * const peer = await peerRouting.findPeer(peerId, options)
   * ```
   */
  findPeer: (peerId: PeerId, options?: AbortOptions) => Promise<PeerInfo>

  /**
   * Iterates over all peer routers in series to get the closest peers of the given key.
   *
   * Once a content router succeeds, the iteration will stop. If the DHT is enabled, it will be queried first.
   *
   * @example
   *
   * ```js
   * // Iterate over the closest peers found for the given key
   * for await (const peer of peerRouting.getClosestPeers(key)) {
   *   console.log(peer.id, peer.multiaddrs)
   * }
   * ```
   */
  getClosestPeers: (key: Uint8Array, options?: AbortOptions) => AsyncIterable<PeerInfo>
}
