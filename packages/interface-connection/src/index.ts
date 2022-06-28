import type { Multiaddr } from '@multiformats/multiaddr'
import type { PeerId } from '@libp2p/interface-peer-id'
import type * as Status from './status.js'
import type { Duplex } from 'it-stream-types'
import type { AbortOptions } from '@libp2p/interfaces'
import type { MuxedStream, MuxedStreamStat, MuxedStreamTimeline, Direction } from '@libp2p/interface-stream-muxer'

export interface ConnectionTimeline {
  open: number
  upgraded?: number
  close?: number
}

/**
 * Outbound connections are opened by the local node, inbound connections are opened by the remote
 */
export type { Direction }

export type { MuxedStreamTimeline as StreamTimeline }

export interface ConnectionStat {
  /**
   * Outbound connections are opened by the local node, inbound connections are opened by the remote
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

export interface StreamStat extends MuxedStreamStat {
  /**
   * Once a protocol has been negotiated for this stream, it will be set on the stat object
   */
  protocol: string
}

/**
 * A Stream is a data channel between two peers that
 * can be written to and read from at both ends.
 *
 * It may be encrypted and multiplexed depending on the
 * configuration of the nodes.
 */
export interface Stream extends MuxedStream {
  /**
   * Stats about this stream
   */
  stat: StreamStat
}

/**
 * A Connection is a high-level representation of a connection
 * to a remote peer that may have been secured by encryption and
 * multiplexed, depending on the configuration of the nodes
 * between which the connection is made.
 */
export interface Connection {
  /**
   * A unique identifer for this stream
   */
  id: string

  /**
   * Stats about this stream
   */
  stat: ConnectionStat

  /**
   * The address of the remote peer
   */
  remoteAddr: Multiaddr

  /**
   * The PeerId of the remote peer
   */
  remotePeer: PeerId

  /**
   * Tags this connection has
   */
  tags: string[]

  /**
   * A list of multiplexed streams open on this connection
   */
  streams: Stream[]

  /**
   * Open a new multiplexed stream
   */
  newStream: (multicodecs: string | string[], options?: AbortOptions) => Promise<Stream>

  /**
   * When a multiplexed stream is open on the remote, add it to this connection
   */
  addStream: (stream: Stream) => void

  /**
   * Remove a stream from this connection
   */
  removeStream: (id: string) => void

  /**
   * Close this connection and tear down any multiplexed streams
   */
  close: () => Promise<void>
}

export const symbol = Symbol.for('@libp2p/connection')

export function isConnection (other: any): other is Connection {
  return other != null && Boolean(other[symbol])
}

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
