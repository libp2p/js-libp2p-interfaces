declare const _exports: Topology;
export = _exports;
declare class Topology {
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
