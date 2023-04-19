import type { PeerId } from '@libp2p/interface-peer-id'
import type { PeerInfo } from '@libp2p/interface-peer-info'
import type { AbortOptions } from '@libp2p/interfaces'
import type { ProgressEvent, ProgressOptions } from 'progress-events'

export interface PeerRouting<
  FindPeerProgressEvents extends ProgressEvent = ProgressEvent,
  GetClosestPeersProgressEvents extends ProgressEvent = ProgressEvent,
> {
  /**
   * Searches the network for peer info corresponding to the passed peer id.
   *
   * @example
   *
   * ```js
   * // ...
   * const peer = await peerRouting.findPeer(peerId, options)
   * ```
   */
  findPeer: (peerId: PeerId, options?: AbortOptions & ProgressOptions<FindPeerProgressEvents>) => Promise<PeerInfo>

  /**
   * Search the network for peers that are closer to the passed key. Peer
   * info should be yielded in ever-increasing closeness to the key.
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
  getClosestPeers: (key: Uint8Array, options?: AbortOptions & ProgressOptions<GetClosestPeersProgressEvents>) => AsyncIterable<PeerInfo>
}
