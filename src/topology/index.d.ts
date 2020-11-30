declare const _exports: Topology;
export = _exports;
export type PeerId = import("peer-id");
export type TopologyHandlers = {
    /**
     * - protocol "onConnect" handler
     */
    onConnect?: (peerId: PeerId, conn: import('../connection')) => void;
    /**
     * - protocol "onDisconnect" handler
     */
    onDisconnect?: (peerId: PeerId) => void;
};
export type TopologyOptions = {
    /**
     * - minimum needed connections
     */
    min?: number;
    /**
     * - maximum needed connections
     */
    max?: number;
    handlers?: TopologyHandlers;
};
/**
 * @typedef {import('peer-id')} PeerId
 */
/**
 * @typedef {Object} TopologyHandlers
 * @property {(peerId: PeerId, conn: import('../connection')) => void} [handlers.onConnect] - protocol "onConnect" handler
 * @property {(peerId: PeerId) => void} [handlers.onDisconnect] - protocol "onDisconnect" handler
 *
 * @typedef {Object} TopologyOptions
 * @property {number} [props.min = 0] - minimum needed connections
 * @property {number} [props.max = Infinity] - maximum needed connections
 * @property {TopologyHandlers} [props.handlers]
 */
declare class Topology {
    /**
     * @class
     * @param {TopologyHandlers} options
     */
    constructor({ min, max, handlers }: TopologyHandlers);
    min: any;
    max: any;
    _onConnect: any;
    _onDisconnect: any;
    /**
     * Set of peers that support the protocol.
     *
     * @type {Set<string>}
     */
    peers: Set<string>;
    set registrar(arg: any);
    _registrar: any;
    /**
     * Notify about peer disconnected event.
     *
     * @param {PeerId} peerId
     * @returns {void}
     */
    disconnect(peerId: PeerId): void;
}
