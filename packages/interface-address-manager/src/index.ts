import type { Multiaddr } from '@multiformats/multiaddr'
import type { EventEmitter } from '@libp2p/interfaces/events'

export interface AddressManagerEvents {
  /**
   * Emitted when the current node's addresses change
   */
  'change:addresses': CustomEvent
}

export interface AddressManager extends EventEmitter<AddressManagerEvents> {
  /**
   * Get peer listen multiaddrs
   */
  getListenAddrs: () => Multiaddr[]

  /**
   * Get peer announcing multiaddrs
   */
  getAnnounceAddrs: () => Multiaddr[]

  /**
   * Get observed multiaddrs
   */
  getObservedAddrs: () => Multiaddr[]

  /**
   * Add peer observed addresses
   */
  addObservedAddr: (addr: Multiaddr) => void

  /**
   * Get the current node's addresses
   */
  getAddresses: () => Multiaddr[]
}
