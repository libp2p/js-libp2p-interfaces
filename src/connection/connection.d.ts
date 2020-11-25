declare const _exports: typeof Connection;
export = _exports;
export type Sink = (source: Uint8Array) => Promise<Uint8Array>;
export type DuplexIterableStream = {
    sink: Sink;
    source: () => AsyncIterator<Uint8Array, any, undefined>;
};
export type PeerId = import("peer-id");
export type Multiaddr = import("multiaddr");
/**
 * @callback Sink
 * @param {Uint8Array} source
 * @returns {Promise<Uint8Array>}
 *
 * @typedef {object} DuplexIterableStream
 * @property {Sink} sink
 * @property {() AsyncIterator<Uint8Array>} source
 *
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('multiaddr')} Multiaddr
 */
/**
 * An implementation of the js-libp2p connection.
 * Any libp2p transport should use an upgrader to return this connection.
 */
declare class Connection {
    /**
     * Creates an instance of Connection.
     * @param {object} properties properties of the connection.
     * @param {Multiaddr} [properties.localAddr] local multiaddr of the connection if known.
     * @param {Multiaddr} [properties.remoteAddr] remote multiaddr of the connection.
     * @param {PeerId} properties.localPeer local peer-id.
     * @param {PeerId} properties.remotePeer remote peer-id.
     * @param {function} properties.newStream new stream muxer function.
     * @param {function} properties.close close raw connection function.
     * @param {function(): DuplexIterableStream[]} properties.getStreams get streams from muxer function.
     * @param {object} properties.stat metadata of the connection.
     * @param {string} properties.stat.direction connection establishment direction ("inbound" or "outbound").
     * @param {object} properties.stat.timeline connection relevant events timestamp.
     * @param {string} properties.stat.timeline.open connection opening timestamp.
     * @param {string} properties.stat.timeline.upgraded connection upgraded timestamp.
     * @param {string} [properties.stat.multiplexer] connection multiplexing identifier.
     * @param {string} [properties.stat.encryption] connection encryption method identifier.
     */
    constructor({ localAddr, remoteAddr, localPeer, remotePeer, newStream, close, getStreams, stat }: {
        localAddr?: import("multiaddr");
        remoteAddr?: import("multiaddr");
        localPeer: import("peer-id");
        remotePeer: import("peer-id");
        newStream: Function;
        close: Function;
        getStreams: () => DuplexIterableStream[];
        stat: {
            direction: string;
            timeline: {
                open: string;
                upgraded: string;
            };
            multiplexer?: string;
            encryption?: string;
        };
    });
    /**
     * Connection identifier.
     */
    id: any;
    /**
     * Observed multiaddr of the local peer
     */
    localAddr: import("multiaddr");
    /**
     * Observed multiaddr of the remote peer
     */
    remoteAddr: import("multiaddr");
    /**
     * Local peer id.
     */
    localPeer: import("peer-id");
    /**
     * Remote peer id.
     */
    remotePeer: import("peer-id");
    /**
     * Connection metadata.
     */
    _stat: {
        status: string;
        direction: string;
        timeline: {
            open: string;
            upgraded: string;
        };
        multiplexer?: string;
        encryption?: string;
    };
    /**
     * Reference to the new stream function of the multiplexer
     */
    _newStream: Function;
    /**
     * Reference to the close function of the raw connection
     */
    _close: Function;
    /**
     * Reference to the getStreams function of the muxer
     */
    _getStreams: () => DuplexIterableStream[];
    /**
     * Connection streams registry
     */
    registry: Map<any, any>;
    /**
     * User provided tags
     * @type {string[]}
     */
    tags: string[];
    /**
     * Get connection metadata
     * @this {Connection}
     */
    get stat(): {
        status: string;
        direction: string;
        timeline: {
            open: string;
            upgraded: string;
        };
        multiplexer?: string;
        encryption?: string;
    };
    /**
     * Get all the streams of the muxer.
     * @this {Connection}
     */
    get streams(): DuplexIterableStream[];
    /**
     * Create a new stream from this connection
     * @param {string[]} protocols intended protocol for the stream
     * @return {Promise<{stream: DuplexIterableStream, protocol: string}>} with muxed+multistream-selected stream and selected protocol
     */
    newStream(protocols: string[]): Promise<{
        stream: DuplexIterableStream;
        protocol: string;
    }>;
    /**
     * Add a stream when it is opened to the registry.
     * @param {DuplexIterableStream} muxedStream a muxed stream
     * @param {object} properties the stream properties to be registered
     * @param {string} properties.protocol the protocol used by the stream
     * @param {object} properties.metadata metadata of the stream
     * @return {void}
     */
    addStream(muxedStream: DuplexIterableStream, { protocol, metadata }: {
        protocol: string;
        metadata: any;
    }): void;
    /**
     * Remove stream registry after it is closed.
     * @param {string} id identifier of the stream
     */
    removeStream(id: string): void;
    /**
     * Close the connection.
     * @return {Promise<void>}
     */
    close(): Promise<void>;
    _closing: any;
}
