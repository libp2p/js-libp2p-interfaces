export = Topology;
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
    _onConnect: Function;
    _onDisconnect: Function;
    /**
     * Set of peers that support the protocol.
     * @type {Set<string>}
     */
    peers: Set<string>;
    get [Symbol.toStringTag](): string;
    set registrar(arg: any);
    _registrar: any;
    /**
     * @typedef PeerId
     * @type {import('peer-id')}
     */
    /**
     * Notify about peer disconnected event.
     * @param {PeerId} peerId
     * @returns {void}
     */
    disconnect(peerId: import("peer-id")): void;
    get [topologySymbol](): boolean;
}
declare namespace Topology {
    export { Options, Handlers };
}
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
    onConnect?: Function | undefined;
    /**
     * - protocol "onDisconnect" handler
     */
    onDisconnect?: Function | undefined;
};
