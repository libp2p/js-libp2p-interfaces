import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { TopologyOptions, onConnectHandler, onDisconnectHandler } from '@libp2p/interfaces/topology'
import type { Registrar } from '@libp2p/interfaces/registrar'

const noop = () => {}
const topologySymbol = Symbol.for('@libp2p/topology')

export class Topology {
  public min: number
  public max: number

  /**
   * Set of peers that support the protocol
   */
  public peers: Set<string>
  public onConnect: onConnectHandler
  public onDisconnect: onDisconnectHandler

  protected _registrar: Registrar | undefined

  constructor (options: TopologyOptions) {
    this.min = options.min ?? 0
    this.max = options.max ?? Infinity
    this.peers = new Set()

    this.onConnect = options.onConnect ?? noop
    this.onDisconnect = options.onDisconnect ?? noop
  }

  get [Symbol.toStringTag] () {
    return topologySymbol.toString()
  }

  get [topologySymbol] () {
    return true
  }

  /**
   * Checks if the given value is a Topology instance
   */
  static isTopology (other: any): other is Topology {
    return topologySymbol in other
  }

  /**
   * Notify about peer disconnected event
   */
  disconnect (peerId: PeerId) {
    this.onDisconnect(peerId)
  }
}
