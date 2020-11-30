export = PubsubBaseProtocol;
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
 * @typedef PeerId
 * @type import('peer-id')
 */
/**
* PubsubBaseProtocol handles the peers and connections logic for pubsub routers
* and specifies the API that pubsub routers should have.
*/
declare class PubsubBaseProtocol {
    /**
     * @param {Object} props
     * @param {String} props.debugName log namespace
     * @param {Array<string>|string} props.multicodecs protocol identificers to connect
     * @param {Libp2p} props.libp2p
     * @param {SignaturePolicy} [props.globalSignaturePolicy = SignaturePolicy.StrictSign] defines how signatures should be handled
     * @param {boolean} [props.canRelayMessage = false] if can relay messages not subscribed
     * @param {boolean} [props.emitSelf = false] if publish should emit to self, if subscribed
     * @abstract
     */
    constructor({ debugName, multicodecs, libp2p, globalSignaturePolicy, canRelayMessage, emitSelf }: {
        debugName: string;
        multicodecs: Array<string> | string;
        libp2p: any;
        globalSignaturePolicy: {
            StrictSign: "StrictSign";
            StrictNoSign: string;
        };
        canRelayMessage: boolean;
        emitSelf: boolean;
    });
    log: any;
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
     * @typedef {function(string, InMessage): Promise<void>} validator
     */
    /**
     * Topic validator map
     *
     * Keyed by topic
     * Topic validators are functions with the following input:
     * @type {Map<string, validator>}
     */
    topicValidators: Map<string, (arg0: string, arg1: InMessage) => Promise<void>>;
    _registrarId: any;
    /**
     * On an inbound stream opened.
     * @private
     * @param {Object} props
     * @param {string} props.protocol
     * @param {DuplexIterableStream} props.stream
     * @param {Connection} props.connection connection
     */
    private _onIncomingStream;
    /**
     * Registrar notifies an established connection with pubsub protocol.
     * @private
     * @param {PeerId} peerId remote peer-id
     * @param {Connection} conn connection to the peer
     */
    private _onPeerConnected;
    /**
     * Registrar notifies a closing connection with pubsub protocol.
     * @private
     * @param {PeerId} peerId peerId
     * @param {Error} err error for connection end
     */
    private _onPeerDisconnected;
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
    private _addPeer;
    /**
     * Notifies the router that a peer has been disconnected.
     * @private
     * @param {PeerId} peerId
     * @returns {PeerStreams | undefined}
     */
    private _removePeer;
    /**
     * Responsible for processing each RPC message received by other peers.
     * @param {string} idB58Str peer id string in base58
     * @param {DuplexIterableStream} stream inbound stream
     * @param {PeerStreams} peerStreams PubSub peer
     * @returns {Promise<void>}
     */
    _processMessages(idB58Str: string, stream: any, peerStreams: PeerStreams): Promise<void>;
    /**
     * Handles an rpc request from a peer
     * @param {String} idB58Str
     * @param {PeerStreams} peerStreams
     * @param {RPC} rpc
     * @returns {boolean}
     */
    _processRpc(idB58Str: string, peerStreams: PeerStreams, rpc: any): boolean;
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
     * @returns {Uint8Array} message id as bytes
     */
    getMsgId(msg: any): Uint8Array;
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
    private _buildMessage;
    /**
     * Get a list of the peer-ids that are subscribed to one topic.
     * @param {string} topic
     * @returns {Array<string>}
     */
    getSubscribers(topic: string): Array<string>;
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
    getTopics(): Array<string>;
}
declare namespace PubsubBaseProtocol {
    export { message, utils, SignaturePolicy, InMessage, PeerId };
}
type PeerId = import("peer-id");
type InMessage = {
    from?: string;
    receivedFrom: string;
    topicIDs: string[];
    seqno?: Uint8Array;
    data: Uint8Array;
    signature?: Uint8Array;
    key?: Uint8Array;
};
import PeerStreams = require("./peer-streams");
/**
 * @type {typeof import('./message')}
 */
declare const message: typeof import('./message');
import utils = require("./utils");
import { SignaturePolicy } from "./signature-policy";
