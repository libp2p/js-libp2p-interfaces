declare const _exports: MulticodecTopology;
export = _exports;
declare class MulticodecTopology {
    /**
     * @class
     * @param {import('./').TopologyOptions} options
     */
    constructor({ min, max, handlers, multicodecs, }: import('./').TopologyOptions);
    multicodecs: any[];
    _registrar: any;
    /**
     * Check if a new peer support the multicodecs for this topology.
     *
     * @param {Object} props
     * @param {PeerId} props.peerId
     * @param {Array<string>} props.protocols
     */
    _onProtocolChange({ peerId, protocols }: {
        peerId: any;
        protocols: Array<string>;
    }): void;
    /**
     * Verify if a new connected peer has a topology multicodec and call _onConnect.
     *
     * @param {Connection} connection
     * @returns {void}
     */
    _onPeerConnect(connection: any): void;
    set registrar(arg: any);
    /**
     * Update topology.
     *
     * @param {Array<{id: PeerId, multiaddrs: Array<Multiaddr>, protocols: Array<string>}>} peerDataIterable
     * @returns {void}
     */
    _updatePeers(peerDataIterable: Array<{
        id: any;
        multiaddrs: Array<any>;
        protocols: Array<string>;
    }>): void;
}
