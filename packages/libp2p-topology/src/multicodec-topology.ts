import { Topology } from './index.js'
import all from 'it-all'
import { logger } from '@libp2p/logger'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { Peer } from '@libp2p/interfaces/peer-store'
import type { Connection } from '@libp2p/interfaces/connection'
import type { Registrar } from '@libp2p/interfaces/registrar'
import type { MulticodecTopologyOptions } from '@libp2p/interfaces/topology'

const log = logger('libp2p:topology:multicodec-topology')

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

  async setRegistrar (registrar: Registrar | undefined) {
    if (registrar == null) {
      return
    }

    this._registrar = registrar

    registrar.peerStore.on('change:protocols', this._onProtocolChange.bind(this))
    registrar.connectionManager.on('peer:connect', this._onPeerConnect.bind(this))

    // Update topology peers
    await this._updatePeers(registrar.peerStore.getPeers())
  }

  get registrar () {
    return this._registrar
  }

  /**
   * Update topology
   */
  async _updatePeers (peerDataIterable: Iterable<Peer> | AsyncIterable<Peer>) {
    const peerDatas = await all(peerDataIterable)

    for await (const { id, protocols } of peerDatas) {
      if (this.multicodecs.filter(multicodec => protocols.includes(multicodec)).length > 0) {
        // Add the peer regardless of whether or not there is currently a connection
        this.peers.add(id.toString())
        // If there is a connection, call _onConnect
        if (this._registrar != null) {
          const connection = this._registrar.getConnection(id)
          ;(connection != null) && this._onConnect(id, connection)
        }
      } else {
        // Remove any peers we might be tracking that are no longer of value to us
        this.peers.delete(id.toString())
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
    const hadPeer = this.peers.has(peerId.toString())
    const hasProtocol = protocols.filter(protocol => this.multicodecs.includes(protocol))

    // Not supporting the protocol any more?
    if (hadPeer && hasProtocol.length === 0) {
      this._onDisconnect(peerId)
    }

    let p: Promise<void> | undefined

    // New to protocol support
    for (const protocol of protocols) {
      if (this.multicodecs.includes(protocol)) {
        p = this._registrar.peerStore.get(peerId).then(async peerData => await this._updatePeers([peerData]))
        break
      }
    }

    if (p != null) {
      p.catch(err => log.error(err))
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
    this._registrar.peerStore.protoBook.get(peerId)
      .then(protocols => {
        if (this.multicodecs.find(multicodec => protocols.includes(multicodec)) != null) {
          this.peers.add(peerId.toString())
          this._onConnect(peerId, connection)
        }
      })
      .catch(err => log.error(err))
  }
}
