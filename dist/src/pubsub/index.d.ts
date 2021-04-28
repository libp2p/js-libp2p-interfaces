export = PubsubBaseProtocol;
/**
 * @typedef {any} Libp2p
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('bl')} BufferList
 * @typedef {import('../stream-muxer/types').MuxedStream} MuxedStream
 * @typedef {import('../connection/connection')} Connection
 * @typedef {import('./signature-policy').SignaturePolicyType} SignaturePolicyType
 * @typedef {import('./message/rpc').IRPC} IRPC
 * @typedef {import('./message/rpc').RPC.SubOpts} RPCSubOpts
 * @typedef {import('./message/rpc').RPC.Message} RPCMessage
 */
/**
 * @typedef {Object} InMessage
 * @property {string} [from]
 * @property {string} receivedFrom
 * @property {string[]} topicIDs
 * @property {Uint8Array} [seqno]
 * @property {Uint8Array} data
 * @property {Uint8Array} [signature]
 * @property {Uint8Array} [key]
 *
 * @typedef {Object} PubsubProperties
 * @property {string} debugName - log namespace
 * @property {Array<string>|string} multicodecs - protocol identificers to connect
 * @property {Libp2p} libp2p
 *
 * @typedef {Object} PubsubOptions
 * @property {SignaturePolicyType} [globalSignaturePolicy = SignaturePolicy.StrictSign] - defines how signatures should be handled
 * @property {boolean} [canRelayMessage = false] - if can relay messages not subscribed
 * @property {boolean} [emitSelf = false] - if publish should emit to self, if subscribed
 */
/**
 * PubsubBaseProtocol handles the peers and connections logic for pubsub routers
 * and specifies the API that pubsub routers should have.
 */
declare class PubsubBaseProtocol extends EventEmitter {
    /**
     * @param {PubsubProperties & PubsubOptions} props
     * @abstract
     */
    constructor({ debugName, multicodecs, libp2p, globalSignaturePolicy, canRelayMessage, emitSelf }: PubsubProperties & PubsubOptions);
    log: debug.Debugger & {
        err: debug.Debugger;
    };
    /**
     * @type {Array<string>}
     */
    multicodecs: Array<string>;
    _libp2p: any;
    registrar: any;
    /**
     * @type {PeerId}
     */
    peerId: PeerId;
    started: boolean;
    /**
     * Map of topics to which peers are subscribed to
     *
     * @type {Map<string, Set<string>>}
     */
    topics: Map<string, Set<string>>;
    /**
     * List of our subscriptions
     *
     * @type {Set<string>}
     */
    subscriptions: Set<string>;
    /**
     * Map of peer streams
     *
     * @type {Map<string, import('./peer-streams')>}
     */
    peers: Map<string, import('./peer-streams')>;
    /**
     * The signature policy to follow by default
     *
     * @type {string}
     */
    globalSignaturePolicy: string;
    /**
     * If router can relay received messages, even if not subscribed
     *
     * @type {boolean}
     */
    canRelayMessage: boolean;
    /**
     * if publish should emit to self, if subscribed
     *
     * @type {boolean}
     */
    emitSelf: boolean;
    /**
     * Topic validator function
     *
     * @typedef {function(string, InMessage): Promise<void>} validator
     */
    /**
     * Topic validator map
     *
     * Keyed by topic
     * Topic validators are functions with the following input:
     *
     * @type {Map<string, validator>}
     */
    topicValidators: Map<string, validator>;
    _registrarId: any;
    /**
     * On an inbound stream opened.
     *
     * @protected
     * @param {Object} props
     * @param {string} props.protocol
     * @param {MuxedStream} props.stream
     * @param {Connection} props.connection - connection
     */
    protected _onIncomingStream({ protocol, stream, connection }: {
        protocol: string;
        stream: MuxedStream;
        connection: Connection;
    }): void;
    /**
     * Registrar notifies an established connection with pubsub protocol.
     *
     * @protected
     * @param {PeerId} peerId - remote peer-id
     * @param {Connection} conn - connection to the peer
     */
    protected _onPeerConnected(peerId: PeerId, conn: Connection): Promise<void>;
    /**
     * Registrar notifies a closing connection with pubsub protocol.
     *
     * @protected
     * @param {PeerId} peerId - peerId
     * @param {Error} [err] - error for connection end
     */
    protected _onPeerDisconnected(peerId: PeerId, err?: Error | undefined): void;
    /**
     * Register the pubsub protocol onto the libp2p node.
     *
     * @returns {void}
     */
    start(): void;
    /**
     * Unregister the pubsub protocol and the streams with other peers will be closed.
     *
     * @returns {void}
     */
    stop(): void;
    /**
     * Notifies the router that a peer has been connected
     *
     * @protected
     * @param {PeerId} peerId
     * @param {string} protocol
     * @returns {PeerStreams}
     */
    protected _addPeer(peerId: PeerId, protocol: string): PeerStreams;
    /**
     * Notifies the router that a peer has been disconnected.
     *
     * @protected
     * @param {PeerId} peerId
     * @returns {PeerStreams | undefined}
     */
    protected _removePeer(peerId: PeerId): PeerStreams | undefined;
    /**
     * Responsible for processing each RPC message received by other peers.
     *
     * @param {string} idB58Str - peer id string in base58
     * @param {AsyncIterable<Uint8Array|BufferList>} stream - inbound stream
     * @param {PeerStreams} peerStreams - PubSub peer
     * @returns {Promise<void>}
     */
    _processMessages(idB58Str: string, stream: AsyncIterable<Uint8Array | BufferList>, peerStreams: PeerStreams): Promise<void>;
    /**
     * Handles an rpc request from a peer
     *
     * @param {string} idB58Str
     * @param {PeerStreams} peerStreams
     * @param {RPC} rpc
     * @returns {boolean}
     */
    _processRpc(idB58Str: string, peerStreams: PeerStreams, rpc: RPC): boolean;
    /**
     * Handles a subscription change from a peer
     *
     * @param {string} id
     * @param {RPC.ISubOpts} subOpt
     */
    _processRpcSubOpt(id: string, subOpt: RPC.ISubOpts): void;
    /**
     * Handles an message from a peer
     *
     * @param {InMessage} msg
     * @returns {Promise<void>}
     */
    _processRpcMessage(msg: InMessage): Promise<void>;
    /**
     * Emit a message from a peer
     *
     * @param {InMessage} message
     */
    _emitMessage(message: InMessage): void;
    /**
     * The default msgID implementation
     * Child class can override this.
     *
     * @param {InMessage} msg - the message object
     * @returns {Uint8Array} message id as bytes
     */
    getMsgId(msg: InMessage): Uint8Array;
    /**
     * Whether to accept a message from a peer
     * Override to create a graylist
     *
     * @override
     * @param {string} id
     * @returns {boolean}
     */
    _acceptFrom(id: string): boolean;
    /**
     * Decode Uint8Array into an RPC object.
     * This can be override to use a custom router protobuf.
     *
     * @param {Uint8Array} bytes
     * @returns {RPC}
     */
    _decodeRpc(bytes: Uint8Array): RPC;
    /**
     * Encode RPC object into a Uint8Array.
     * This can be override to use a custom router protobuf.
     *
     * @param {IRPC} rpc
     * @returns {Uint8Array}
     */
    _encodeRpc(rpc: IRPC): Uint8Array;
    /**
     * Send an rpc object to a peer
     *
     * @param {string} id - peer id
     * @param {IRPC} rpc
     * @returns {void}
     */
    _sendRpc(id: string, rpc: IRPC): void;
    /**
     * Send subscroptions to a peer
     *
     * @param {string} id - peer id
     * @param {string[]} topics
     * @param {boolean} subscribe - set to false for unsubscriptions
     * @returns {void}
     */
    _sendSubscriptions(id: string, topics: string[], subscribe: boolean): void;
    /**
     * Validates the given message. The signature will be checked for authenticity.
     * Throws an error on invalid messages
     *
     * @param {InMessage} message
     * @returns {Promise<void>}
     */
    validate(message: InMessage): Promise<void>;
    /**
     * Normalizes the message and signs it, if signing is enabled.
     * Should be used by the routers to create the message to send.
     *
     * @protected
     * @param {InMessage} message
     * @returns {Promise<InMessage>}
     */
    protected _buildMessage(message: InMessage): Promise<InMessage>;
    /**
     * Get a list of the peer-ids that are subscribed to one topic.
     *
     * @param {string} topic
     * @returns {Array<string>}
     */
    getSubscribers(topic: string): Array<string>;
    /**
     * Publishes messages to all subscribed peers
     *
     * @override
     * @param {string} topic
     * @param {Uint8Array} message
     * @returns {Promise<void>}
     */
    publish(topic: string, message: Uint8Array): Promise<void>;
    /**
     * Overriding the implementation of publish should handle the appropriate algorithms for the publish/subscriber implementation.
     * For example, a Floodsub implementation might simply publish each message to each topic for every peer
     *
     * @abstract
     * @param {InMessage|RPCMessage} message
     * @returns {Promise<void>}
     *
     */
    _publish(message: RPC.Message | InMessage): Promise<void>;
    /**
     * Subscribes to a given topic.
     *
     * @abstract
     * @param {string} topic
     * @returns {void}
     */
    subscribe(topic: string): void;
    /**
     * Unsubscribe from the given topic.
     *
     * @override
     * @param {string} topic
     * @returns {void}
     */
    unsubscribe(topic: string): void;
    /**
     * Get the list of topics which the peer is subscribed to.
     *
     * @override
     * @returns {Array<string>}
     */
    getTopics(): Array<string>;
}
declare namespace PubsubBaseProtocol {
    export { utils, SignaturePolicy, validator, Libp2p, PeerId, BufferList, MuxedStream, Connection, SignaturePolicyType, IRPC, RPCSubOpts, RPCMessage, InMessage, PubsubProperties, PubsubOptions };
}
import { EventEmitter } from "events";
import debug = require("debug");
type PeerId = import('peer-id');
/**
 * Topic validator function
 */
type validator = (arg0: string, arg1: InMessage) => Promise<void>;
type MuxedStream = import('../stream-muxer/types').MuxedStream;
type Connection = import('../connection/connection');
import PeerStreams = require("./peer-streams");
type BufferList = import('bl');
import { RPC } from "./message/rpc";
type InMessage = {
    from?: string | undefined;
    receivedFrom: string;
    topicIDs: string[];
    seqno?: Uint8Array | undefined;
    data: Uint8Array;
    signature?: Uint8Array | undefined;
    key?: Uint8Array | undefined;
};
type IRPC = import('./message/rpc').IRPC;
type PubsubProperties = {
    /**
     * - log namespace
     */
    debugName: string;
    /**
     * - protocol identificers to connect
     */
    multicodecs: Array<string> | string;
    libp2p: Libp2p;
};
type PubsubOptions = {
    /**
     * - defines how signatures should be handled
     */
    globalSignaturePolicy?: import("./signature-policy").SignaturePolicyType | undefined;
    /**
     * - if can relay messages not subscribed
     */
    canRelayMessage?: boolean | undefined;
    /**
     * - if publish should emit to self, if subscribed
     */
    emitSelf?: boolean | undefined;
};
import utils = require("./utils");
import { SignaturePolicy } from "./signature-policy";
type Libp2p = any;
type SignaturePolicyType = import('./signature-policy').SignaturePolicyType;
type RPCSubOpts = import('./message/rpc').RPC.SubOpts;
type RPCMessage = import('./message/rpc').RPC.Message;
//# sourceMappingURL=index.d.ts.map