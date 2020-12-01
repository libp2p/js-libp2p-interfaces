export = Topology;
/**
 * @typedef {import('peer-id')} PeerId
 */
/**
 * @typedef {Object} Options
 * @property {number} [min=0] - minimum needed connections.
 * @property {number} [max=Infinity] - maximum needed connections.
 * @property {Handlers} [handlers]
 *
 * @typedef {Object} Handlers
 * @property {(peerId: PeerId, conn: import('../connection')) => void} [onConnect] - protocol "onConnect" handler
 * @property {(peerId: PeerId) => void} [onDisconnect] - protocol "onDisconnect" handler
 */
declare class Topology {
    /**
     * Checks if the given value is a Topology instance.
     *
     * @param {any} other
     * @returns {other is Topology}
     */
    static isTopology(other: any): other is Topology;
    /**
     * @param {Options} options
     */
    constructor({ min, max, handlers }: Options);
    min: number;
    max: number;
    _onConnect: (peerId: PeerId, conn: import('../connection')) => void;
    _onDisconnect: (peerId: PeerId) => void;
    /**
     * Set of peers that support the protocol.
     *
     * @type {Set<string>}
     */
    peers: Set<string>;
    get [Symbol.toStringTag](): string;
    set registrar(arg: any);
    _registrar: any;
    /**
     * Notify about peer disconnected event.
     *
     * @param {PeerId} peerId
     * @returns {void}
     */
    disconnect(peerId: PeerId): void;
    get [topologySymbol](): boolean;
}
declare namespace Topology {
    export { PeerId, Options, Handlers };
}
type PeerId = import("peer-id");
declare const topologySymbol: unique symbol;
type Options = {
    /**
     * - minimum needed connections.
     */
    min?: number | undefined;
    /**
     * - maximum needed connections.
     */
    max?: number | undefined;
    handlers?: Handlers | undefined;
};
type Handlers = {
    /**
     * - protocol "onConnect" handler
     */
    onConnect?: ((peerId: PeerId, conn: import('../connection')) => void) | undefined;
    /**
     * - protocol "onDisconnect" handler
     */
    onDisconnect?: ((peerId: PeerId) => void) | undefined;
};
