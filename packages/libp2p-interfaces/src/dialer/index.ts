import type { Multiaddr, Resolver } from '@multiformats/multiaddr'
import type { Connection, ProtocolStream } from '../connection/index.js'
import type { ComponentMetricsTracker } from '../metrics/index.js'
import type { PeerId } from '../peer-id/index.js'
import type { AddressSorter } from '../peer-store/index.js'

export interface DialerInit {
  /**
   * Sort the known addresses of a peer before trying to dial
   */
  addressSorter?: AddressSorter

  /**
   * Number of max concurrent dials
   */
  maxParallelDials?: number

  /**
   * Number of max addresses to dial for a given peer
   */
  maxAddrsToDial?: number

  /**
   * How long a dial attempt is allowed to take
   */
  dialTimeout?: number

  /**
   * Number of max concurrent dials per peer
   */
  maxDialsPerPeer?: number

  /**
   * Multiaddr resolvers to use when dialing
   */
  resolvers?: Record<string, Resolver>
  metrics?: ComponentMetricsTracker
}

export interface Dialer {
  /**
   * Dial a peer, return the connection before any protocols have been negotiate
   */
  dial: (peer: PeerId | Multiaddr, options?: { signal?: AbortSignal }) => Promise<Connection>

  /**
   * Dial a peer, return a specific protocol stream
   */
  dialProtocol: (peer: PeerId | Multiaddr, protocol: string | string[], options?: { signal?: AbortSignal }) => Promise<ProtocolStream>
}
