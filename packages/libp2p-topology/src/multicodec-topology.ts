import { Topology } from './index.js'
import type { PeerId } from 'libp2p-interfaces/peer-id'
import type { PeerData } from 'libp2p-interfaces/peer-data'
import type { Connection } from 'libp2p-interfaces/connection'
import type { Registrar } from 'libp2p-interfaces/registrar'
import type { MulticodecTopologyOptions } from 'libp2p-interfaces/topology'

interface ChangeProtocolsEvent {
  peerId: PeerId
  protocols: string[]
}

const multicodecTopologySymbol = Symbol.for('@libp2p/js-interfaces/topology/multicodec-topology')

export class MulticodecTopology extends Topology {
  public readonly multicodecs: string[]

  constructor (options: MulticodecTopologyOptions) {
    super(options)

    this.multicodecs = options.multicodecs
  }

  get [Symbol.toStringTag] () {
    return 'Topology'
  }

  get [multicodecTopologySymbol] () {
    return true
  }

  /**
   * Checks if the given value is a `MulticodecTopology` instance.
   */
  static isMulticodecTopology (other: any) {
    return Boolean(multicodecTopologySymbol in other)
  }

  set registrar (registrar: Registrar | undefined) {
    if (registrar == null) {
      return
    }

    this._registrar = registrar

    registrar.peerStore.on('change:protocols', this._onProtocolChange.bind(this))
    registrar.connectionManager.on('peer:connect', this._onPeerConnect.bind(this))

    // Update topology peers
    this._updatePeers(registrar.peerStore.peers.values())
  }

  get registrar () {
    return this._registrar
  }

  /**
   * Update topology
   *
   * @param peerDatas
   */
  _updatePeers (peerDatas: Iterable<PeerData>) {
    for (const { id, protocols } of peerDatas) {
      if (this.multicodecs.filter(multicodec => protocols.includes(multicodec)).length > 0) {
        // Add the peer regardless of whether or not there is currently a connection
        this.peers.add(id.toB58String())
        // If there is a connection, call _onConnect
        if (this._registrar != null) {
          const connection = this._registrar.getConnection(id)
          ;(connection != null) && this._onConnect(id, connection)
        }
      } else {
        // Remove any peers we might be tracking that are no longer of value to us
        this.peers.delete(id.toB58String())
      }
    }
  }

  /**
   * Check if a new peer support the multicodecs for this topology
   */
  _onProtocolChange (event: ChangeProtocolsEvent) {
    if (this._registrar == null) {
      return
    }

    const { peerId, protocols } = event
    const hadPeer = this.peers.has(peerId.toB58String())
    const hasProtocol = protocols.filter(protocol => this.multicodecs.includes(protocol))

    // Not supporting the protocol any more?
    if (hadPeer && hasProtocol.length === 0) {
      this._onDisconnect(peerId)
    }

    // New to protocol support
    for (const protocol of protocols) {
      if (this.multicodecs.includes(protocol)) {
        const peerData = this._registrar.peerStore.get(peerId)
        this._updatePeers([peerData])
        return
      }
    }
  }

  /**
   * Verify if a new connected peer has a topology multicodec and call _onConnect
   */
  _onPeerConnect (connection: Connection) {
    if (this._registrar == null) {
      return
    }

    const peerId = connection.remotePeer
    const protocols = this._registrar.peerStore.protoBook.get(peerId)

    if (protocols == null) {
      return
    }

    if (this.multicodecs.find(multicodec => protocols.includes(multicodec)) != null) {
      this.peers.add(peerId.toB58String())
      this._onConnect(peerId, connection)
    }
  }
}
