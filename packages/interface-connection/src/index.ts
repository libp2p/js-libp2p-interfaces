import type { Multiaddr } from '@multiformats/multiaddr'
import type { PeerId } from '@libp2p/interface-peer-id'
import type * as Status from './status.js'
import type { Duplex } from 'it-stream-types'
import type { AbortOptions } from '@libp2p/interfaces'
import type { Uint8ArrayList } from 'uint8arraylist'

export interface ConnectionTimeline {
  open: number
  upgraded?: number
  close?: number
}

/**
 * Outbound conections are opened by the local node, inbound streams are opened by the remote
 */
export type Direction = 'inbound' | 'outbound'

export interface ConnectionStat {
  /**
   * Outbound conections are opened by the local node, inbound streams are opened by the remote
   */
  direction: Direction

  /**
   * Lifecycle times for the connection
   */
  timeline: ConnectionTimeline

  /**
   * Once a multiplexer has been negotiated for this stream, it will be set on the stat object
   */
  multiplexer?: string

  /**
   * Once a connection encrypter has been negotiated for this stream, it will be set on the stat object
   */
  encryption?: string

  /**
   * The current status of the connection
   */
  status: keyof typeof Status
}

export interface StreamTimeline {
  open: number
  close?: number
}

export interface StreamStat {
  /**
   * Outbound streams are opened by the local node, inbound streams are opened by the remote
   */
  direction: Direction

  /**
   * Lifecycle times for the stream
   */
  timeline: StreamTimeline

  /**
   * Once a protocol has been negotiated for this stream, it will be set on the stat object
   */
  protocol?: string
}

/**
 * A Stream is a data channel between two peers that
 * can be written to and read from at both ends.
 *
 * It may be encrypted and multiplexed depending on the
 * configuration of the nodes.
 */
export interface Stream extends Duplex<Uint8ArrayList, Uint8ArrayList | Uint8Array> {
  /**
   * Closes the stream for **reading** *and* **writing**.
   *
   * Any buffered data in the source can still be consumed and the stream will end normally.
   *
   * This will cause a `CLOSE` message to be sent to the remote, *unless* the sink has already ended.
   *
   * The sink and the source will return normally.
   */
  close: () => void

  /**
   * Closes the stream for **reading**. If iterating over the source of this stream in a `for await of` loop, it will return (exit the loop) after any buffered data has been consumed.
   *
   * This function is called automatically by the muxer when it receives a `CLOSE` message from the remote.
   *
   * The source will return normally, the sink will continue to consume.
   */
  closeRead: () => void

  /**
   * Closes the stream for **writing**. If iterating over the source of this stream in a `for await of` loop, it will return (exit the loop) after any buffered data has been consumed.
   *
   * The source will return normally, the sink will continue to consume.
   */
  closeWrite: () => void

  /**
   * Closes the stream for **reading** *and* **writing**. This should be called when a *local error* has occurred.
   *
   * Note, if called without an error any buffered data in the source can still be consumed and the stream will end normally.
   *
   * This will cause a `RESET` message to be sent to the remote, *unless* the sink has already ended.
   *
   * The sink will return and the source will throw if an error is passed or return normally if not.
   */
  abort: (err: Error) => void

  /**
   * Closes the stream *immediately* for **reading** *and* **writing**. This should be called when a *remote error* has occurred.
   *
   * This function is called automatically by the muxer when it receives a `RESET` message from the remote.
   *
   * The sink will return and the source will throw.
   */
  reset: () => void

  /**
   * Unique identifier for a stream. Identifiers are not unique across muxers.
   */
  id: string

  /**
   * Stats about this stream
   */
  stat: StreamStat

  /**
   * User defined stream metadata
   */
  metadata: Record<string, any>
}

/**
 * A Connection is a high-level representation of a connection
 * to a remote peer that may have been secured by encryption and
 * multiplexed, depending on the configuration of the nodes
 * between which the connection is made.
 */
export interface Connection {
  id: string
  stat: ConnectionStat
  remoteAddr: Multiaddr
  remotePeer: PeerId
  tags: string[]
  streams: Stream[]

  newStream: (multicodecs: string | string[], options?: AbortOptions) => Promise<Stream>
  addStream: (stream: Stream) => void
  removeStream: (id: string) => void
  close: () => Promise<void>
}

export const symbol = Symbol.for('@libp2p/connection')

export function isConnection (other: any): other is Connection {
  return other != null && Boolean(other[symbol])
}

/**
 * @deprecated Please use the version from `@libp2p/interface-connection-gater` instead, this will be removed in a future release
 */
export interface ConnectionGater {
  /**
   * denyDialMultiaddr tests whether we're permitted to Dial the
   * specified peer.
   *
   * This is called by the dialer.connectToPeer implementation before
   * dialling a peer.
   *
   * Return true to prevent dialing the passed peer.
   */
  denyDialPeer: (peerId: PeerId) => Promise<boolean>

  /**
   * denyDialMultiaddr tests whether we're permitted to dial the specified
   * multiaddr for the given peer.
   *
   * This is called by the dialer.connectToPeer implementation after it has
   * resolved the peer's addrs, and prior to dialling each.
   *
   * Return true to prevent dialing the passed peer on the passed multiaddr.
   */
  denyDialMultiaddr: (peerId: PeerId, multiaddr: Multiaddr) => Promise<boolean>

  /**
   * denyInboundConnection tests whether an incipient inbound connection is allowed.
   *
   * This is called by the upgrader, or by the transport directly (e.g. QUIC,
   * Bluetooth), straight after it has accepted a connection from its socket.
   *
   * Return true to deny the incoming passed connection.
   */
  denyInboundConnection: (maConn: MultiaddrConnection) => Promise<boolean>

  /**
   * denyOutboundConnection tests whether an incipient outbound connection is allowed.
   *
   * This is called by the upgrader, or by the transport directly (e.g. QUIC,
   * Bluetooth), straight after it has created a connection with its socket.
   *
   * Return true to deny the incoming passed connection.
   */
  denyOutboundConnection: (peerId: PeerId, maConn: MultiaddrConnection) => Promise<boolean>

  /**
   * denyInboundEncryptedConnection tests whether a given connection, now encrypted,
   * is allowed.
   *
   * This is called by the upgrader, after it has performed the security
   * handshake, and before it negotiates the muxer, or by the directly by the
   * transport, at the exact same checkpoint.
   *
   * Return true to deny the passed secured connection.
   */
  denyInboundEncryptedConnection: (peerId: PeerId, maConn: MultiaddrConnection) => Promise<boolean>

  /**
   * denyOutboundEncryptedConnection tests whether a given connection, now encrypted,
   * is allowed.
   *
   * This is called by the upgrader, after it has performed the security
   * handshake, and before it negotiates the muxer, or by the directly by the
   * transport, at the exact same checkpoint.
   *
   * Return true to deny the passed secured connection.
   */
  denyOutboundEncryptedConnection: (peerId: PeerId, maConn: MultiaddrConnection) => Promise<boolean>

  /**
   * denyInboundUpgradedConnection tests whether a fully capable connection is allowed.
   *
   * This is called after encryption has been negotiated and the connection has been
   * multiplexed, if a multiplexer is configured.
   *
   * Return true to deny the passed upgraded connection.
   */
  denyInboundUpgradedConnection: (peerId: PeerId, maConn: MultiaddrConnection) => Promise<boolean>

  /**
   * denyOutboundUpgradedConnection tests whether a fully capable connection is allowed.
   *
   * This is called after encryption has been negotiated and the connection has been
   * multiplexed, if a multiplexer is configured.
   *
   * Return true to deny the passed upgraded connection.
   */
  denyOutboundUpgradedConnection: (peerId: PeerId, maConn: MultiaddrConnection) => Promise<boolean>

  /**
   * Used by the address book to filter passed addresses.
   *
   * Return true to allow storing the passed multiaddr for the passed peer.
   */
  filterMultiaddrForPeer: (peer: PeerId, multiaddr: Multiaddr) => Promise<boolean>
}

export interface ConnectionProtector {

  /**
   * Takes a given Connection and creates a private encryption stream
   * between its two peers from the PSK the Protector instance was
   * created with.
   */
  protect: (connection: MultiaddrConnection) => Promise<MultiaddrConnection>
}

export interface MultiaddrConnectionTimeline {
  open: number
  upgraded?: number
  close?: number
}

/**
 * A MultiaddrConnection is returned by transports after dialing
 * a peer. It is a low-level primitive and is the raw connection
 * without encryption or stream multiplexing.
 */
export interface MultiaddrConnection extends Duplex<Uint8Array> {
  close: (err?: Error) => Promise<void>
  remoteAddr: Multiaddr
  timeline: MultiaddrConnectionTimeline
}
