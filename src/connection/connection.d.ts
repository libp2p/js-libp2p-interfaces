export = Connection;
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
     * Creates an instance of Connection.
     * @param {object} properties properties of the connection.
     * @param {multiaddr} [properties.localAddr] local multiaddr of the connection if known.
     * @param {multiaddr} [properties.remoteAddr] remote multiaddr of the connection.
     * @param {PeerId} properties.localPeer local peer-id.
     * @param {PeerId} properties.remotePeer remote peer-id.
     * @param {function} properties.newStream new stream muxer function.
     * @param {function} properties.close close raw connection function.
     * @param {function(): Stream[]} properties.getStreams get streams from muxer function.
     * @param {object} properties.stat metadata of the connection.
     * @param {string} properties.stat.direction connection establishment direction ("inbound" or "outbound").
     * @param {object} properties.stat.timeline connection relevant events timestamp.
     * @param {string} properties.stat.timeline.open connection opening timestamp.
     * @param {string} properties.stat.timeline.upgraded connection upgraded timestamp.
     * @param {string} [properties.stat.multiplexer] connection multiplexing identifier.
     * @param {string} [properties.stat.encryption] connection encryption method identifier.
     */
    constructor({ localAddr, remoteAddr, localPeer, remotePeer, newStream, close, getStreams, stat }: {
        localAddr: multiaddr | undefined;
        remoteAddr: multiaddr | undefined;
        localPeer: PeerId;
        remotePeer: PeerId;
        newStream: Function;
        close: Function;
        getStreams: () => any[];
        stat: {
            direction: string;
            timeline: {
                open: string;
                upgraded: string;
            };
            multiplexer: string | undefined;
            encryption: string | undefined;
        };
    });
    /**
     * Connection identifier.
     */
    id: string;
    /**
     * Observed multiaddr of the local peer
     */
    localAddr: multiaddr | undefined;
    /**
     * Observed multiaddr of the remote peer
     */
    remoteAddr: multiaddr | undefined;
    /**
     * Local peer id.
     */
    localPeer: PeerId;
    /**
     * Remote peer id.
     */
    remotePeer: PeerId;
    /**
     * Connection metadata.
     */
    _stat: {
        status: "open";
        direction: string;
        timeline: {
            open: string;
            upgraded: string;
        };
        multiplexer?: string | undefined;
        encryption?: string | undefined;
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
    _getStreams: () => any[];
    /**
     * Connection streams registry
     */
    registry: Map<any, any>;
    /**
     * User provided tags
     * @type {string[]}
     */
    tags: string[];
    get [Symbol.toStringTag](): string;
    /**
     * Get connection metadata
     * @this {Connection}
     */
    get stat(): {
        status: "open";
        direction: string;
        timeline: {
            open: string;
            upgraded: string;
        };
        multiplexer?: string | undefined;
        encryption?: string | undefined;
    };
    /**
     * Get all the streams of the muxer.
     * @this {Connection}
     */
    get streams(): any[];
    /**
     * Create a new stream from this connection
     * @param {string[]} protocols intended protocol for the stream
     * @return {Promise<{stream: Stream, protocol: string}>} with muxed+multistream-selected stream and selected protocol
     */
    newStream(protocols: string[]): Promise<{
        stream: any;
        protocol: string;
    }>;
    /**
     * Add a stream when it is opened to the registry.
     * @param {*} muxedStream a muxed stream
     * @param {object} properties the stream properties to be registered
     * @param {string} properties.protocol the protocol used by the stream
     * @param {object} properties.metadata metadata of the stream
     * @return {void}
     */
    addStream(muxedStream: any, { protocol, metadata }: {
        protocol: string;
        metadata: object;
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
    get [connectionSymbol](): boolean;
}
import multiaddr = require("multiaddr");
import PeerId = require("peer-id");
declare const connectionSymbol: unique symbol;
