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
   * Get observed multiaddrs - these addresses may not have been confirmed as
   * publicly dialable yet
   */
  getObservedAddrs: () => Multiaddr[]

  /**
   * Signal that we have confidence an observed multiaddr is publicly dialable -
   * this will make it appear in the output of getAddresses()
   */
  confirmObservedAddr: (addr: Multiaddr) => void

  /**
   * Signal that we do not have confidence an observed multiaddr is publicly dialable -
   * this will remove it from the output of getObservedAddrs()
   */
  removeObservedAddr: (addr: Multiaddr) => void

  /**
   * Add peer observed addresses along with an optional confidence specifier
   */
  addObservedAddr: (addr: Multiaddr) => void

  /**
   * Get the current node's addresses
   */
  getAddresses: () => Multiaddr[]
}
