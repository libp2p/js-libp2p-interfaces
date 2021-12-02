import type { PeerId } from 'libp2p-peer-id'
import type { TopologyOptions, onConnectHandler, onDisconnectHandler } from 'libp2p-interfaces/topology'
import type { Registrar } from 'libp2p-interfaces/registrar'

const noop = () => {}
const topologySymbol = Symbol.for('@libp2p/js-interfaces/topology')

export class Topology {
  public min: number
  public max: number

  /**
   * Set of peers that support the protocol
   */
  public peers: Set<string>

  protected _onConnect: onConnectHandler
  protected _onDisconnect: onDisconnectHandler
  protected _registrar: Registrar | undefined

  constructor (options: TopologyOptions) {
    this.min = options.min ?? 0
    this.max = options.max ?? Infinity
    this.peers = new Set()

    this._onConnect = options.handlers?.onConnect == null ? noop : options.handlers?.onConnect
    this._onDisconnect = options.handlers?.onDisconnect == null ? noop : options.handlers?.onDisconnect
  }

  get [Symbol.toStringTag] () {
    return 'Topology'
  }

  get [topologySymbol] () {
    return true
  }

  /**
   * Checks if the given value is a Topology instance
   */
  static isTopology (other: any) {
    return topologySymbol in other
  }

  set registrar (registrar: Registrar | undefined) {
    this._registrar = registrar
  }

  get registrar () {
    return this._registrar
  }

  /**
   * Notify about peer disconnected event
   */
  disconnect (peerId: PeerId) {
    this._onDisconnect(peerId)
  }
}
