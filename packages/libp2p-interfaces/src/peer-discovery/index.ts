import type { PeerInfo } from '../peer-info/index.js'
import type { EventEmitter } from '../events.js'

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
