export = Connection;
/**
 * @typedef {import('../stream-muxer/types').MuxedStream} MuxedStream
 */
/**
 * @typedef {Object} ConectionStat
 * @property {string} direction - connection establishment direction ("inbound" or "outbound").
 * @property {object} timeline - connection relevant events timestamp.
 * @property {number} timeline.open - connection opening timestamp.
 * @property {number} [timeline.upgraded] - connection upgraded timestamp.
 * @property {number} [timeline.close] - connection upgraded timestamp.
 * @property {string} [multiplexer] - connection multiplexing identifier.
 * @property {string} [encryption] - connection encryption method identifier.
 *
 * @typedef {Object} ConnectionOptions
 * @property {multiaddr} [localAddr] - local multiaddr of the connection if known.
 * @property {multiaddr} remoteAddr - remote multiaddr of the connection.
 * @property {PeerId} localPeer - local peer-id.
 * @property {PeerId} remotePeer - remote peer-id.
 * @property {(protocols: string|string[]) => Promise<{stream: MuxedStream, protocol: string}>} newStream - new stream muxer function.
 * @property {() => Promise<void>} close - close raw connection function.
 * @property {() => MuxedStream[]} getStreams - get streams from muxer function.
 * @property {ConectionStat} stat - metadata of the connection.
 */
/**
 * An implementation of the js-libp2p connection.
 * Any libp2p transport should use an upgrader to return this connection.
 */
declare class Connection {
    /**
     * Checks if the given value is a `Connection` instance.
     *
     * @param {any} other
     * @returns {other is Connection}
     */
    static isConnection(other: any): other is Connection;
    /**
     * An implementation of the js-libp2p connection.
     * Any libp2p transport should use an upgrader to return this connection.
     *
     * @class
     * @param {ConnectionOptions} options
     */
    constructor({ localAddr, remoteAddr, localPeer, remotePeer, newStream, close, getStreams, stat }: ConnectionOptions);
    /**
     * Connection identifier.
     */
    id: string;
    /**
     * Observed multiaddr of the local peer
     */
    localAddr: import("multiaddr") | undefined;
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
        status: "open";
        /**
         * - connection establishment direction ("inbound" or "outbound").
         */
        direction: string;
        /**
         * - connection relevant events timestamp.
         */
        timeline: {
            open: number;
            upgraded: number | undefined;
            close: number | undefined;
        };
        /**
         * - connection multiplexing identifier.
         */
        multiplexer?: string | undefined;
        /**
         * - connection encryption method identifier.
         */
        encryption?: string | undefined;
    };
    /**
     * Reference to the new stream function of the multiplexer
     */
    _newStream: (protocols: string | string[]) => Promise<{
        stream: MuxedStream;
        protocol: string;
    }>;
    /**
     * Reference to the close function of the raw connection
     */
    _close: () => Promise<void>;
    /**
     * Reference to the getStreams function of the muxer
     */
    _getStreams: () => MuxedStream[];
    /**
     * Connection streams registry
     */
    registry: Map<any, any>;
    /**
     * User provided tags
     *
     * @type {string[]}
     */
    tags: string[];
    get [Symbol.toStringTag](): string;
    /**
     * Get connection metadata
     *
     * @this {Connection}
     */
    get stat(): {
        status: "open";
        /**
         * - connection establishment direction ("inbound" or "outbound").
         */
        direction: string;
        /**
         * - connection relevant events timestamp.
         */
        timeline: {
            open: number;
            upgraded: number | undefined;
            close: number | undefined;
        };
        /**
         * - connection multiplexing identifier.
         */
        multiplexer?: string | undefined;
        /**
         * - connection encryption method identifier.
         */
        encryption?: string | undefined;
    };
    /**
     * Get all the streams of the muxer.
     *
     * @this {Connection}
     */
    get streams(): import("../stream-muxer/types").MuxedStream[];
    /**
     * Create a new stream from this connection
     *
     * @param {string|string[]} protocols - intended protocol for the stream
     * @returns {Promise<{stream: MuxedStream, protocol: string}>} with muxed+multistream-selected stream and selected protocol
     */
    newStream(protocols: string | string[]): Promise<{
        stream: MuxedStream;
        protocol: string;
    }>;
    /**
     * Add a stream when it is opened to the registry.
     *
     * @param {MuxedStream} muxedStream - a muxed stream
     * @param {object} properties - the stream properties to be registered
     * @param {string} properties.protocol - the protocol used by the stream
     * @param {object} properties.metadata - metadata of the stream
     * @returns {void}
     */
    addStream(muxedStream: MuxedStream, { protocol, metadata }: {
        protocol: string;
        metadata: object;
    }): void;
    /**
     * Remove stream registry after it is closed.
     *
     * @param {string} id - identifier of the stream
     */
    removeStream(id: string): void;
    /**
     * Close the connection.
     *
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    _closing: void | undefined;
}
declare namespace Connection {
    export { MuxedStream, ConectionStat, ConnectionOptions };
}
type MuxedStream = {
    close: () => void;
    abort: () => void;
    reset: () => void;
    sink: (source: Uint8Array) => Promise<Uint8Array>;
    source: () => AsyncIterable<Uint8Array>;
    timeline: import("../stream-muxer/types").MuxedTimeline;
    id: string;
};
type ConnectionOptions = {
    /**
     * - local multiaddr of the connection if known.
     */
    localAddr?: import("multiaddr") | undefined;
    /**
     * - remote multiaddr of the connection.
     */
    remoteAddr: import("multiaddr");
    /**
     * - local peer-id.
     */
    localPeer: import("peer-id");
    /**
     * - remote peer-id.
     */
    remotePeer: import("peer-id");
    /**
     * - new stream muxer function.
     */
    newStream: (protocols: string | string[]) => Promise<{
        stream: MuxedStream;
        protocol: string;
    }>;
    /**
     * - close raw connection function.
     */
    close: () => Promise<void>;
    /**
     * - get streams from muxer function.
     */
    getStreams: () => MuxedStream[];
    /**
     * - metadata of the connection.
     */
    stat: ConectionStat;
};
type ConectionStat = {
    /**
     * - connection establishment direction ("inbound" or "outbound").
     */
    direction: string;
    /**
     * - connection relevant events timestamp.
     */
    timeline: {
        open: number;
        upgraded: number | undefined;
        close: number | undefined;
    };
    /**
     * - connection multiplexing identifier.
     */
    multiplexer?: string | undefined;
    /**
     * - connection encryption method identifier.
     */
    encryption?: string | undefined;
};
