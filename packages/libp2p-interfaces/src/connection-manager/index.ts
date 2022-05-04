import type { AbortOptions, EventEmitter } from '../index.js'
import type { Connection } from '../connection/index.js'
import type { PeerId } from '../peer-id/index.js'
import type { AddressSorter } from '../peer-store/index.js'
import type { Resolver } from '@multiformats/multiaddr'

export interface ConnectionManagerInit {
  /**
   * The maximum number of connections to keep open
   */
  maxConnections: number

  /**
   * The minimum number of connections to keep open
   */
  minConnections: number

  /**
   * The max data (in and out), per average interval to allow
   */
   maxData?: number

   /**
    * The max outgoing data, per average interval to allow
    */
   maxSentData?: number

   /**
    * The max incoming data, per average interval to allow
    */
   maxReceivedData?: number

   /**
    * The upper limit the event loop can take to run
    */
   maxEventLoopDelay?: number

   /**
    * How often, in milliseconds, metrics and latency should be checked
    */
   pollInterval?: number

   /**
    * How often, in milliseconds, to compute averages
    */
   movingAverageInterval?: number

   /**
    * The value of the peer
    */
   defaultPeerValue?: number

   /**
    * If true, try to connect to all discovered peers up to the connection manager limit
    */
   autoDial?: boolean

  /**
   * How long to wait between attempting to keep our number of concurrent connections
   * above minConnections
   */
  autoDialInterval: number

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
}

export interface ConnectionManagerEvents {
  'peer:connect': CustomEvent<Connection>
  'peer:disconnect': CustomEvent<Connection>
}

export interface ConnectionManager extends EventEmitter<ConnectionManagerEvents> {
  /**
   * Return connections, optionally filtering by a PeerId
   */
  getConnections: (peerId?: PeerId) => Connection[]

  /**
   * Open a connection to a remote peer
   */
  openConnection: (peer: PeerId, options?: AbortOptions) => Promise<Connection>

  /**
   * Close our connections to a peer
   */
  closeConnections: (peer: PeerId) => Promise<void>
}
