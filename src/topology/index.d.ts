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
     * @param {Object} props
     * @param {number} [props.min] minimum needed connections (default: 0)
     * @param {number} [props.max] maximum needed connections (default: Infinity)
     * @param {Object} [props.handlers]
     * @param {function} [props.handlers.onConnect] protocol "onConnect" handler
     * @param {function} [props.handlers.onDisconnect] protocol "onDisconnect" handler
     * @constructor
     */
    constructor({ min, max, handlers }: {
        min: number;
        max: number;
        handlers: {
            onConnect: Function;
            onDisconnect: Function;
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
declare const topologySymbol: unique symbol;
