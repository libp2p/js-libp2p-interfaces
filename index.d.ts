declare module "connection/status" {
    export const OPEN: string;
    export const CLOSING: string;
    export const CLOSED: string;
}
declare module "connection/connection" {
    const _exports: Connection;
    export = _exports;
    /**
     * An implementation of the js-libp2p connection.
     * Any libp2p transport should use an upgrader to return this connection.
     */
    class Connection {
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
            localAddr?: import("multiaddr");
            remoteAddr?: import("multiaddr");
            localPeer: import("peer-id");
            remotePeer: import("peer-id");
            newStream: Function;
            close: Function;
            getStreams: () => any[];
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
}
declare module "connection/index" {
    export var Connection: typeof import("connection/connection");
}
declare module "crypto/errors" {
    export class UnexpectedPeerError extends Error {
        static get code(): string;
        constructor(message?: string);
        code: string;
    }
    export class InvalidCryptoExchangeError extends Error {
        static get code(): string;
        constructor(message?: string);
        code: string;
    }
    export class InvalidCryptoTransmissionError extends Error {
        static get code(): string;
        constructor(message?: string);
        code: string;
    }
}
declare module "pubsub/errors" {
    export namespace codes {
        export const ERR_MISSING_SIGNATURE: string;
        export const ERR_INVALID_SIGNATURE: string;
    }
}
declare module "topology/index" {
    const _exports: Topology;
    export = _exports;
    class Topology {
        /**
         * @param {Object} props
         * @param {number} props.min minimum needed connections (default: 0)
         * @param {number} props.max maximum needed connections (default: Infinity)
         * @param {Object} [props.handlers]
         * @param {function} [props.handlers.onConnect] protocol "onConnect" handler
         * @param {function} [props.handlers.onDisconnect] protocol "onDisconnect" handler
         * @constructor
         */
        constructor({ min, max, handlers }: {
            min: number;
            max: number;
            handlers?: {
                onConnect?: Function;
                onDisconnect?: Function;
            };
        });
        min: number;
        max: number;
        _onConnect: Function;
        _onDisconnect: Function;
        /**
         * Set of peers that support the protocol.
         * @type {Set<string>}
         */
        peers: Set<string>;
        set registrar(arg: any);
        _registrar: any;
        /**
         * Notify about peer disconnected event.
         * @param {PeerId} peerId
         * @returns {void}
         */
        disconnect(peerId: import("peer-id")): void;
    }
}
declare module "topology/multicodec-topology" {
    const _exports: MulticodecTopology;
    export = _exports;
    class MulticodecTopology {
        /**
         * @param {Object} props
         * @param {number} props.min minimum needed connections (default: 0)
         * @param {number} props.max maximum needed connections (default: Infinity)
         * @param {Array<string>} props.multicodecs protocol multicodecs
         * @param {Object} props.handlers
         * @param {function} props.handlers.onConnect protocol "onConnect" handler
         * @param {function} props.handlers.onDisconnect protocol "onDisconnect" handler
         * @constructor
         */
        constructor({ min, max, multicodecs, handlers }: {
            min: number;
            max: number;
            multicodecs: string[];
            handlers: {
                onConnect: Function;
                onDisconnect: Function;
            };
        });
        multicodecs: string[];
        _registrar: any;
        /**
         * Check if a new peer support the multicodecs for this topology.
         * @param {Object} props
         * @param {PeerId} props.peerId
         * @param {Array<string>} props.protocols
         */
        _onProtocolChange({ peerId, protocols }: {
            peerId: any;
            protocols: string[];
        }): void;
        /**
         * Verify if a new connected peer has a topology multicodec and call _onConnect.
         * @param {Connection} connection
         * @returns {void}
         */
        _onPeerConnect(connection: any): void;
        set registrar(arg: any);
        /**
         * Update topology.
         * @param {Array<{id: PeerId, multiaddrs: Array<Multiaddr>, protocols: Array<string>}>} peerDataIterable
         * @returns {void}
         */
        _updatePeers(peerDataIterable: {
            id: any;
            multiaddrs: any[];
            protocols: string[];
        }[]): void;
    }
}
declare module "pubsub/message/rpc.proto" {
    const _exports: string;
    export = _exports;
}
declare module "pubsub/message/topic-descriptor.proto" {
    const _exports: string;
    export = _exports;
}
declare module "pubsub/message/index" {
    export var rpc: any;
    export var td: any;
    export var RPC: any;
    export var Message: any;
    export var SubOpts: any;
}
declare module "pubsub/peer-streams" {
    export = PeerStreams;
    /**
     * TODO: replace with import of that type from somewhere
     * @typedef {any} DuplexIterableStream
     */
    /**
     * Thin wrapper around a peer's inbound / outbound pubsub streams
     */
    class PeerStreams {
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
         * @type {AbortController}
         */
        _inboundAbortController: AbortController;
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
    namespace PeerStreams {
        export { DuplexIterableStream };
    }
    const PeerId: typeof import("peer-id");
    /**
     * TODO: replace with import of that type from somewhere
     */
    type DuplexIterableStream = any;
    const AbortController: typeof import("abort-controller");
    const pushable: typeof import("it-pushable");
}
declare module "pubsub/utils" {
    export function randomSeqno(): Uint8Array;
    export function msgId(from: string, seqno: Uint8Array): string;
    export function anyMatch(a: any[] | Set<any>, b: any[] | Set<any>): boolean;
    export function ensureArray(maybeArray: any): any[];
    export function normalizeInRpcMessage(message: any, peerId: string): any;
    export function normalizeOutRpcMessage(message: any): any;
}
declare module "pubsub/message/sign" {
    /**
     * Returns the PublicKey associated with the given message.
     * If no, valid PublicKey can be retrieved an error will be returned.
     *
     * @param {InMessage} message
     * @returns {Promise<PublicKey>}
     */
    export function messagePublicKey(message: any): Promise<any>;
    /**
     * Signs the provided message with the given `peerId`
     *
     * @param {PeerId} peerId
     * @param {Message} message
     * @returns {Promise<Message>}
     */
    export function signMessage(peerId: import("peer-id"), message: any): Promise<any>;
    export const SignPrefix: any;
    /**
     * Verifies the signature of the given message
     * @param {InMessage} message
     * @returns {Promise<Boolean>}
     */
    export function verifySignature(message: any): Promise<boolean>;
}
declare module "pubsub/index" {
    export = PubsubBaseProtocol;
    /**
     * @typedef {Object} InMessage
     * @property {string} from
     * @property {string} receivedFrom
     * @property {string[]} topicIDs
     * @property {Uint8Array} data
     * @property {Uint8Array} [signature]
     * @property {Uint8Array} [key]
     */
    /**
    * PubsubBaseProtocol handles the peers and connections logic for pubsub routers
    * and specifies the API that pubsub routers should have.
    */
    class PubsubBaseProtocol {
        /**
         * @param {Object} props
         * @param {String} props.debugName log namespace
         * @param {Array<string>|string} props.multicodecs protocol identificers to connect
         * @param {Libp2p} props.libp2p
         * @param {boolean} [props.signMessages = true] if messages should be signed
         * @param {boolean} [props.strictSigning = true] if message signing should be required
         * @param {boolean} [props.canRelayMessage = false] if can relay messages not subscribed
         * @param {boolean} [props.emitSelf = false] if publish should emit to self, if subscribed
         * @abstract
         */
        constructor({ debugName, multicodecs, libp2p, signMessages, strictSigning, canRelayMessage, emitSelf }: {
            debugName: string;
            multicodecs: string | string[];
            libp2p: any;
            signMessages?: boolean;
            strictSigning?: boolean;
            canRelayMessage?: boolean;
            emitSelf?: boolean;
        });
        log: any;
        /**
         * @type {Array<string>}
         */
        multicodecs: Array<string>;
        _libp2p: any;
        registrar: any;
        /**
         * @type {typeof PeerId}
         */
        peerId: typeof PeerId;
        started: boolean;
        /**
         * Map of topics to which peers are subscribed to
         *
         * @type {Map<string, Set<string>>}
         */
        topics: Map<string, Set<string>>;
        /**
         * List of our subscriptions
         * @type {Set<string>}
         */
        subscriptions: Set<string>;
        /**
         * Map of peer streams
         *
         * @type {Map<string, typeof PeerStreams>}
         */
        peers: Map<string, typeof PeerStreams>;
        signMessages: boolean;
        /**
         * If message signing should be required for incoming messages
         * @type {boolean}
         */
        strictSigning: boolean;
        /**
         * If router can relay received messages, even if not subscribed
         * @type {boolean}
         */
        canRelayMessage: boolean;
        /**
         * if publish should emit to self, if subscribed
         * @type {boolean}
         */
        emitSelf: boolean;
        /**
         * Topic validator function
         * @typedef {function(string, RPC): boolean} validator
         */
        /**
         * Topic validator map
         *
         * Keyed by topic
         * Topic validators are functions with the following input:
         * @type {Map<string, validator>}
         */
        topicValidators: Map<string, validator>;
        _registrarId: any;
        /**
         * On an inbound stream opened.
         * @private
         * @param {Object} props
         * @param {string} props.protocol
         * @param {DuplexIterableStream} props.stream
         * @param {Connection} props.connection connection
         */
        _onIncomingStream({ protocol, stream, connection }: {
            protocol: string;
            stream: any;
            connection: typeof import("connection");
        }): void;
        /**
         * Registrar notifies an established connection with pubsub protocol.
         * @private
         * @param {PeerId} peerId remote peer-id
         * @param {Connection} conn connection to the peer
         */
        _onPeerConnected(peerId: any, conn: typeof import("connection")): Promise<void>;
        /**
         * Registrar notifies a closing connection with pubsub protocol.
         * @private
         * @param {PeerId} peerId peerId
         * @param {Error} err error for connection end
         */
        _onPeerDisconnected(peerId: any, err: Error): void;
        /**
         * Register the pubsub protocol onto the libp2p node.
         * @returns {void}
         */
        start(): void;
        /**
         * Unregister the pubsub protocol and the streams with other peers will be closed.
         * @returns {void}
         */
        stop(): void;
        /**
         * Notifies the router that a peer has been connected
         * @private
         * @param {PeerId} peerId
         * @param {string} protocol
         * @returns {PeerStreams}
         */
        _addPeer(peerId: any, protocol: string): import("pubsub/peer-streams");
        /**
         * Notifies the router that a peer has been disconnected.
         * @private
         * @param {PeerId} peerId
         * @returns {PeerStreams | undefined}
         */
        _removePeer(peerId: any): import("pubsub/peer-streams");
        /**
         * Responsible for processing each RPC message received by other peers.
         * @param {string} idB58Str peer id string in base58
         * @param {DuplexIterableStream} stream inbound stream
         * @param {PeerStreams} peerStreams PubSub peer
         * @returns {Promise<void>}
         */
        _processMessages(idB58Str: string, stream: any, peerStreams: import("pubsub/peer-streams")): Promise<void>;
        /**
         * Handles an rpc request from a peer
         * @param {String} idB58Str
         * @param {PeerStreams} peerStreams
         * @param {RPC} rpc
         * @returns {boolean}
         */
        _processRpc(idB58Str: string, peerStreams: import("pubsub/peer-streams"), rpc: any): boolean;
        /**
         * Handles a subscription change from a peer
         * @param {string} id
         * @param {RPC.SubOpt} subOpt
         */
        _processRpcSubOpt(id: string, subOpt: any): void;
        /**
         * Handles an message from a peer
         * @param {InMessage} msg
         * @returns {Promise<void>}
         */
        _processRpcMessage(msg: InMessage): Promise<void>;
        /**
         * Emit a message from a peer
         * @param {InMessage} message
         */
        _emitMessage(message: InMessage): void;
        /**
         * The default msgID implementation
         * Child class can override this.
         * @param {RPC.Message} msg the message object
         * @returns {string} message id as string
         */
        getMsgId(msg: any): string;
        /**
         * Whether to accept a message from a peer
         * Override to create a graylist
         * @override
         * @param {string} id
         * @returns {boolean}
         */
        _acceptFrom(id: string): boolean;
        /**
         * Decode Uint8Array into an RPC object.
         * This can be override to use a custom router protobuf.
         * @param {Uint8Array} bytes
         * @returns {RPC}
         */
        _decodeRpc(bytes: Uint8Array): any;
        /**
         * Encode RPC object into a Uint8Array.
         * This can be override to use a custom router protobuf.
         * @param {RPC} rpc
         * @returns {Uint8Array}
         */
        _encodeRpc(rpc: any): Uint8Array;
        /**
         * Send an rpc object to a peer
         * @param {string} id peer id
         * @param {RPC} rpc
         * @returns {void}
         */
        _sendRpc(id: string, rpc: any): void;
        /**
         * Send subscroptions to a peer
         * @param {string} id peer id
         * @param {string[]} topics
         * @param {boolean} subscribe set to false for unsubscriptions
         * @returns {void}
         */
        _sendSubscriptions(id: string, topics: string[], subscribe: boolean): void;
        /**
         * Validates the given message. The signature will be checked for authenticity.
         * Throws an error on invalid messages
         * @param {InMessage} message
         * @returns {Promise<void>}
         */
        validate(message: InMessage): Promise<void>;
        /**
         * Normalizes the message and signs it, if signing is enabled.
         * Should be used by the routers to create the message to send.
         * @private
         * @param {Message} message
         * @returns {Promise<Message>}
         */
        _buildMessage(message: any): Promise<any>;
        /**
         * Get a list of the peer-ids that are subscribed to one topic.
         * @param {string} topic
         * @returns {Array<string>}
         */
        getSubscribers(topic: string): string[];
        /**
         * Publishes messages to all subscribed peers
         * @override
         * @param {string} topic
         * @param {Buffer} message
         * @returns {Promise<void>}
         */
        publish(topic: string, message: Buffer): Promise<void>;
        /**
         * Overriding the implementation of publish should handle the appropriate algorithms for the publish/subscriber implementation.
         * For example, a Floodsub implementation might simply publish each message to each topic for every peer
         * @abstract
         * @param {InMessage} message
         * @returns {Promise<void>}
         *
         */
        _publish(message: InMessage): Promise<void>;
        /**
         * Subscribes to a given topic.
         * @abstract
         * @param {string} topic
         * @returns {void}
         */
        subscribe(topic: string): void;
        /**
         * Unsubscribe from the given topic.
         * @override
         * @param {string} topic
         * @returns {void}
         */
        unsubscribe(topic: string): void;
        /**
         * Get the list of topics which the peer is subscribed to.
         * @override
         * @returns {Array<String>}
         */
        getTopics(): string[];
    }
    namespace PubsubBaseProtocol {
        export { message, utils, InMessage };
    }
    const PeerId: any;
    const PeerStreams: typeof import("pubsub/peer-streams");
    /**
     * Topic validator function
     */
    type validator = (arg0: string, arg1: any) => boolean;
    type InMessage = {
        from: string;
        receivedFrom: string;
        topicIDs: string[];
        data: Uint8Array;
        signature?: Uint8Array;
        key?: Uint8Array;
    };
    /**
     * @type {typeof import('./message')}
     */
    const message: typeof import("pubsub/message/index");
    const utils: typeof import("pubsub/utils");
}
declare module "record/index" {
    export = Record;
    /**
     * Record is the base implementation of a record that can be used as the payload of a libp2p envelope.
     */
    class Record {
        /**
         * @constructor
         * @param {String} domain signature domain
         * @param {Uint8Array} codec identifier of the type of record
         */
        constructor(domain: string, codec: Uint8Array);
        domain: string;
        codec: Uint8Array;
        /**
         * Marshal a record to be used in an envelope.
         */
        marshal(): void;
        /**
         * Verifies if the other provided Record is identical to this one.
         * @param {Record} other
         */
        equals(other: Record): void;
    }
}
declare module "transport/errors" {
    export class AbortError extends Error {
        static get code(): string;
        static get type(): string;
        code: string;
        type: string;
    }
}
