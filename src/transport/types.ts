import events from 'events'
import Multiaddr from 'multiaddr'
import Connection from '../connection/connection'

/**
 * A libp2p transport is understood as something that offers a dial and listen interface to establish connections.
 */
export interface Transport {
  /**
   * Dial a given multiaddr.
   */
  dial(ma: Multiaddr, options?: any): Promise<Connection>;
  /**
   * Create transport listeners.
   */
  createListener(options: any, handler: (Connection) => void): Listener;
  /**
   * Takes a list of `Multiaddr`s and returns only valid addresses for the transport
   */
  filter(multiaddrs: Multiaddr[]): Multiaddr[];
}

export interface Listener extends events.EventEmitter {
  /**
   * Start a listener
   */
  listen(multiaddr: Multiaddr): Promise<void>;
  /**
   * Get listen addresses
   */
  getAddrs(): Multiaddr[];
  /**
   * Close listener
   *
   * @returns {Promise<void>}
   */
  close(): Promise<void>;
}

export interface Upgrader {
  /**
   * Upgrades an outbound connection on `transport.dial`.
   */
  upgradeOutbound(maConn: MultiaddrConnection): Promise<Connection>;

  /**
   * Upgrades an inbound connection on transport listener.
   */
  upgradeInbound(maConn: MultiaddrConnection): Promise<Connection>;
}

export type MultiaddrConnectionTimeline = {
  open: number;
  upgraded?: number;
  close?: number;
}

export type MultiaddrConnection = {
  sink: Sink;
  source: () => AsyncIterable<Uint8Array>;
  close: (err?: Error) => Promise<void>;
  conn: any;
  remoteAddr: Multiaddr;
  localAddr?: Multiaddr;
  timeline: MultiaddrConnectionTimeline;
}

export type Sink = (source: Uint8Array) => Promise<Uint8Array>;
