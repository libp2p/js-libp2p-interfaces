import type { AbortOptions } from '@libp2p/interfaces'
import type { EventEmitter } from '@libp2p/interfaces/events'
import type { Connection, MultiaddrConnection } from '@libp2p/interface-connection'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { Multiaddr } from '@multiformats/multiaddr'

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

  /**
   * Invoked after an incoming connection is opened but before PeerIds are
   * exchanged, this lets the ConnectionManager check we have sufficient
   * resources to accept the connection in which case it will return true,
   * otherwise it will return false.
   */
  acceptIncomingConnection: (maConn: MultiaddrConnection) => Promise<boolean>
}

export interface Dialer {
  /**
   * Dial a peer or multiaddr and return the promise of a connection
   */
  dial: (peer: PeerId | Multiaddr, options?: AbortOptions) => Promise<Connection>

  /**
   * Request `num` dial tokens. Only the returned number of dials may be attempted.
   */
  getTokens: (num: number) => number[]

  /**
   * After a dial attempt succeeds or fails, return the passed token to the pool
   */
  releaseToken: (token: number) => void
}
