import type { PeerInfo } from '@libp2p/interface-peer-info'
import type { EventEmitter } from '@libp2p/interfaces/events'

/**
 * Any object that implements this Symbol as a property should return a
 * PeerDiscovery instance as the property value, similar to how
 * `Symbol.Iterable` can be used to return an `Iterable` from an `Iterator`.
 *
 * @example
 *
 * ```js
 * import { peerDiscovery, PeerDiscovery } from '@libp2p/peer-discovery'
 *
 * class MyPeerDiscoverer implements PeerDiscovery {
 *   get [peerDiscovery] () {
 *     return this
 *   }
 *
 *   // ...other methods
 * }
 * ```
 */
export const peerDiscovery = Symbol.for('@libp2p/peer-discovery')

export const symbol = Symbol.for('@libp2p/peer-discovery')

export interface PeerDiscoveryEvents {
  'peer': CustomEvent<PeerInfo>
}

export interface PeerDiscovery extends EventEmitter<PeerDiscoveryEvents> {
  /**
   * Used to identify the peer discovery mechanism
   */
  [Symbol.toStringTag]: string

  /**
   * Used by the isPeerDiscovery function
   */
  [symbol]: true
}

export function isPeerDiscovery (other: any): other is PeerDiscovery {
  return other != null && Boolean(other[symbol])
}
