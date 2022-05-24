import type { Multiaddr } from '@multiformats/multiaddr'
import type { PeerId } from '../peer-id'
import type * as Status from './status.js'
import type { Duplex } from 'it-stream-types'
import type { MultiaddrConnection } from '../transport'
import type { AbortOptions } from '..'

export interface Timeline {
  open: number
  upgraded?: number
  close?: number
}

export interface ConnectionStat {
  direction: 'inbound' | 'outbound'
  timeline: Timeline
  multiplexer?: string
  encryption?: string
  status: keyof typeof Status
}

export interface Metadata {
  protocol: string
  metadata: Record<string, any>
}

/**
 * A Stream is a data channel between two peers that
 * can be written to and read from at both ends.
 *
 * It may be encrypted and multiplexed depending on the
 * configuration of the nodes.
 */
export interface Stream extends Duplex<Uint8Array> {
  /**
   * Close a stream for reading and writing
   */
  close: () => void

  /**
   * Close a stream for reading only
   */
  closeRead: () => void

  /**
   * Close a stream for writing only
   */
  closeWrite: () => void

  /**
   * Call when a local error occurs, should close the stream for reading and writing
   */
  abort: (err: Error) => void

  /**
   * Call when a remote error occurs, should close the stream for reading and writing
   */
  reset: () => void

  /**
   * Records stream lifecycle event timings
   */
  timeline: Timeline

  /**
   * Unique identifier for a stream
   */
  id: string
}

export interface ProtocolStream {
  protocol: string
  stream: Stream
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
  registry: Map<string, Metadata>
  tags: string[]
  streams: Stream[]

  newStream: (multicodecs: string | string[], options?: AbortOptions) => Promise<ProtocolStream>
  addStream: (stream: Stream, data: Partial<Metadata>) => void
  removeStream: (id: string) => void
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
