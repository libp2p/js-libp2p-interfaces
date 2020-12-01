import events from 'events'

/**
 * A libp2p transport is understood as something that offers a dial and listen interface to establish connections.
 */
export interface Interface {
  /**
   * Dial a given multiaddr.
   *
   * @param {Multiaddr} ma
   * @param {any} [options]
   * @returns {Promise<Connection>}
   */
  dial(ma: Multiaddr, options?: any): Promise<Connection>;
  /**
   * Create transport listeners.
   *
   * @param {any} options
   * @param {(Connection) => void} handler
   */
  createListener(options: any, handler: (Connection) => void): Listener;
  /**
   * Takes a list of `Multiaddr`s and returns only valid addresses for the transport
   *
   * @param {Multiaddr[]} multiaddrs
   * @returns {Multiaddr[]}
   */
  filter(multiaddrs: Multiaddr[]): Multiaddr[];
}

export interface Listener extends events.EventEmitter {
  /**
   * Start a listener
   *
   * @param {Multiaddr} multiaddr
   * @returns {Promise<void>}
   */
  listen(multiaddr: Multiaddr): Promise<void>;
  /**
   * Get listen addresses
   *
   * @returns {Multiaddr[]}
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
   *
   * @param {MultiaddrConnection} maConn
   * @returns {Promise<Connection>}
   */
  upgradeOutbound(maConn: MultiaddrConnection): Promise<Connection>;

  /**
   * Upgrades an inbound connection on transport listener.
   *
   * @param {MultiaddrConnection} maConn
   * @returns {Promise<Connection>}
   */
  upgradeInbound(maConn: MultiaddrConnection): Promise<Connection>;
}

export declare class Transport implements Interface {
  constructor({ upgrader, ...others }: {
    upgrader: Upgrader;
    others: any;
  });

  /**
   * Dial a given multiaddr.
   *
   * @param {Multiaddr} ma
   * @param {any} [options]
   * @returns {Promise<Connection>}
   */
  dial(ma: Multiaddr, options?: any): Promise<Connection>;
  /**
   * Create transport listeners.
   *
   * @param {any} options
   * @param {(Connection) => void} handler
   */
  createListener(options: any, handler: (Connection) => void): Listener;
  /**
   * Takes a list of `Multiaddr`s and returns only valid addresses for the transport
   *
   * @param {Multiaddr[]} multiaddrs
   * @returns {Multiaddr[]}
   */
  filter(multiaddrs: Multiaddr[]): Multiaddr[];
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

type Sink = (source: Uint8Array) => Promise<Uint8Array>;
type Connection = import('../connection/connection')

type Multiaddr = import('multiaddr');
