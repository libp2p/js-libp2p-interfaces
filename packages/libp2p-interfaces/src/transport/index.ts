import type { EventEmitter } from 'events'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { Connection } from '../connection/index.js'
import type { AbortOptions } from '../index.js'
import type { Duplex } from 'it-stream-types'

export interface TransportFactory<DialOptions extends { signal?: AbortSignal }, ListenerOptions> {
  new(upgrader: Upgrader): Transport<DialOptions, ListenerOptions>
}

export interface ConnectionHandler { (connection: Connection): void }

export interface MultiaddrFilter { (multiaddrs: Multiaddr[]): Multiaddr[] }

export interface ListenerOptions {
  handler?: ConnectionHandler
}

/**
 * A libp2p transport is understood as something that offers a dial and listen interface to establish connections.
 */
export interface Transport <DialOptions extends AbortOptions = AbortOptions, CreateListenerOptions extends ListenerOptions = ListenerOptions> {
  /**
   * Dial a given multiaddr.
   */
  dial: (ma: Multiaddr, options?: DialOptions) => Promise<Connection>
  /**
   * Create transport listeners.
   */
  createListener: (options?: CreateListenerOptions) => Listener
  /**
   * Takes a list of `Multiaddr`s and returns only valid addresses for the transport
   */
  filter: MultiaddrFilter
}

export interface Listener extends EventEmitter {
  /**
   * Start a listener
   */
  listen: (multiaddr: Multiaddr) => Promise<void>
  /**
   * Get listen addresses
   */
  getAddrs: () => Multiaddr[]
  /**
   * Close listener
   *
   * @returns {Promise<void>}
   */
  close: () => Promise<void>
}

export interface Upgrader {
  /**
   * Upgrades an outbound connection on `transport.dial`.
   */
  upgradeOutbound: (maConn: MultiaddrConnection) => Promise<Connection>

  /**
   * Upgrades an inbound connection on transport listener.
   */
  upgradeInbound: (maConn: MultiaddrConnection) => Promise<Connection>
}

export interface MultiaddrConnectionTimeline {
  open: number
  upgraded?: number
  close?: number
}

export interface MultiaddrConnection extends Duplex<Uint8Array> {
  close: (err?: Error) => Promise<void>
  remoteAddr: Multiaddr
  timeline: MultiaddrConnectionTimeline
}
