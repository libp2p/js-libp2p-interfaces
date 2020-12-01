export = MulticodecTopology;
declare class MulticodecTopology extends Topology {
    /**
     * Checks if the given value is a `MulticodecTopology` instance.
     *
     * @param {any} other
     * @returns {other is MulticodecTopology}
     */
    static isMulticodecTopology(other: any): other is MulticodecTopology;
    /**
     * @param {Object} props
     * @param {number} [props.min] minimum needed connections (default: 0)
     * @param {number} [props.max] maximum needed connections (default: Infinity)
     * @param {Array<string>} props.multicodecs protocol multicodecs
     * @param {Object} props.handlers
     * @param {function} props.handlers.onConnect protocol "onConnect" handler
     * @param {function} props.handlers.onDisconnect protocol "onDisconnect" handler
     * @constructor
     */
    constructor({ min, max, multicodecs, handlers }: {
        min: number | undefined;
        max: number | undefined;
        multicodecs: Array<string>;
        handlers: {
            onConnect: Function;
            onDisconnect: Function;
        };
    });
    multicodecs: string[];
    /**
     * Check if a new peer support the multicodecs for this topology.
     * @param {Object} props
     * @param {PeerId} props.peerId
     * @param {Array<string>} props.protocols
     */
    _onProtocolChange({ peerId, protocols }: {
        peerId: PeerId;
        protocols: Array<string>;
    }): void;
    /**
     * Verify if a new connected peer has a topology multicodec and call _onConnect.
     * @param {Connection} connection
     * @returns {void}
     */
    _onPeerConnect(connection: Connection): void;
    /**
     * Update topology.
     * @param {Array<{id: PeerId, multiaddrs: Array<Multiaddr>, protocols: Array<string>}>} peerDataIterable
     * @returns {void}
     */
    _updatePeers(peerDataIterable: Array<{
        id: PeerId;
        multiaddrs: Array<Multiaddr>;
        protocols: Array<string>;
    }>): void;
}
declare namespace MulticodecTopology {
    export { PeerId, Multiaddr, Connection };
}
import Topology = require(".");
type PeerId = import("peer-id");
type Connection = typeof import("../connection");
type Multiaddr = import("multiaddr");
