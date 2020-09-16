export = PeerStreams;
/**
 * TODO: replace with import of that type from somewhere
 * @typedef {any} DuplexIterableStream
 */
/**
 * Thin wrapper around a peer's inbound / outbound pubsub streams
 */
declare class PeerStreams {
    /**
     * @param {object} properties properties of the PeerStreams.
     * @param {PeerId} properties.id
     * @param {string} properties.protocol
     */
    constructor({ id, protocol }: {
        id: import("peer-id");
        protocol: string;
    });
    /**
     * @type {typeof PeerId}
     */
    id: typeof PeerId;
    /**
     * Established protocol
     * @type {string}
     */
    protocol: string;
    /**
     * The raw outbound stream, as retrieved from conn.newStream
     * @private
     * @type {DuplexIterableStream}
     */
    _rawOutboundStream: DuplexIterableStream;
    /**
     * The raw inbound stream, as retrieved from the callback from libp2p.handle
     * @private
     * @type {DuplexIterableStream}
     */
    _rawInboundStream: DuplexIterableStream;
    /**
     * An AbortController for controlled shutdown of the inbound stream
     * @private
     * @type {typeof AbortController}
     */
    _inboundAbortController: typeof AbortController;
    /**
     * Write stream -- its preferable to use the write method
     * @type {typeof pushable}
     */
    outboundStream: typeof pushable;
    /**
     * Read stream
     * @type {DuplexIterableStream}
     */
    inboundStream: DuplexIterableStream;
    /**
     * Do we have a connection to read from?
     *
     * @type {boolean}
     */
    get isReadable(): boolean;
    /**
     * Do we have a connection to write on?
     *
     * @type {boolean}
     */
    get isWritable(): boolean;
    /**
     * Send a message to this peer.
     * Throws if there is no `stream` to write to available.
     *
     * @param {Uint8Array} data
     * @returns {void}
     */
    write(data: Uint8Array): void;
    /**
     * Attach a raw inbound stream and setup a read stream
     *
     * @param {DuplexIterableStream} stream
     * @returns {void}
     */
    attachInboundStream(stream: any): void;
    /**
     * Attach a raw outbound stream and setup a write stream
     *
     * @param {Stream} stream
     * @returns {Promise<void>}
     */
    attachOutboundStream(stream: any): Promise<void>;
    /**
     * Closes the open connection to peer
     * @returns {void}
     */
    close(): void;
}
declare namespace PeerStreams {
    export { DuplexIterableStream };
}
declare const PeerId: typeof import("peer-id");
/**
 * TODO: replace with import of that type from somewhere
 */
type DuplexIterableStream = any;
declare const AbortController: typeof import("abort-controller");
declare const pushable: typeof import("it-pushable");
