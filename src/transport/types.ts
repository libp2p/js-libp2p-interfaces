export default Transport;

declare class Transport implements TransportInterface {
  constructor({ upgrader, ...others }: {
    upgrader: Upgrader;
    others: any;
  });
  /**
   * Dial a given multiaddr.
   * @param {Multiaddr} ma
   * @param {Object} [options]
   * @returns {Promise<Connection>}
   */
  dial(ma: Multiaddr, options?: Object): Promise<Connection>;
  /**
   * Create transport listeners.
   * @param {Object} options
   * @param {(Connection) => void} handler
   */
  createListener(options: Object, handler: Function): Listener;
  /**
   * Takes a list of `Multiaddr`s and returns only valid addresses for the transport
   * @param {Multiaddr[]} multiaddrs
   * @returns {Multiaddr[]}
   */
  filter(multiaddrs: Multiaddr[]): Multiaddr[];
}

/**
* A libp2p transport is understood as something that offers a dial and listen interface to establish connections.
*/
interface TransportInterface {
  /**
   * Dial a given multiaddr.
   * @param {Multiaddr} ma
   * @param {Object} [options]
   * @returns {Promise<Connection>}
   */
  dial(ma: Multiaddr, options?: Object): Promise<Connection>;
  /**
   * Create transport listeners.
   * @param {Object} options
   * @param {(Connection) => void} handler
   */
  createListener(options: Object, handler: Function): Listener;
  /**
   * Takes a list of `Multiaddr`s and returns only valid addresses for the transport
   * @param {Multiaddr[]} multiaddrs
   * @returns {Multiaddr[]}
   */
  filter(multiaddrs: Multiaddr[]): Multiaddr[];
}

interface Listener {
  /**
   * Start a listener
   * @param {Multiaddr} multiaddr
   * @returns {Promise<void>}
   */
  listen(multiaddr: Multiaddr): Promise<void>;
  /**
   * Get listen addresses
   * @returns {Multiaddr[]}
   */
  getAddrs(): Multiaddr[];
  /**
   * Close listener
   * @returns {Promise<void>}
   */
  close(): Promise<void>;
}

interface Upgrader {
  /**
   * Upgrades an outbound connection on `transport.dial`.
   * @param {MultiaddrConnection} maConn
   * @returns {Promise<Connection>}
   */
  upgradeOutbound(maConn: MultiaddrConnection): Promise<Connection>;

  /**
   * Upgrades an inbound connection on transport listener.
   * @param {MultiaddrConnection} maConn
   * @returns {Promise<Connection>}
   */
  upgradeInbound(maConn: MultiaddrConnection): Promise<Connection>;
}

type MultiaddrConnection = {
  connection: any;
  remoteAddr: Multiaddr;
  sink: Sink;
  source: () => AsyncIterator<Uint8Array, any, undefined>;
}

type Sink = (source: Uint8Array) => Promise<Uint8Array>;
type Connection = typeof import('../connection')

type Multiaddr = import('multiaddr');

declare namespace Transport {
  export { Upgrader, Listener, MultiaddrConnection };
}
