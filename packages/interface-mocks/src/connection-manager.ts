import { EventEmitter } from '@libp2p/interfaces/events'
import type { Startable } from '@libp2p/interfaces/startable'
import type { Connection } from '@libp2p/interface-connection'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { ConnectionManager, ConnectionManagerComponents, ConnectionManagerConfig, ConnectionManagerEvents, Dialer } from '@libp2p/interface-connection-manager'
import { connectionPair } from './connection.js'
import { CodeError } from '@libp2p/interfaces/errors'
import type { Registrar } from '@libp2p/interface-registrar'
import type { PubSub } from '@libp2p/interface-pubsub'
import { isMultiaddr, Multiaddr } from '@multiformats/multiaddr'
import type { Metrics } from '@libp2p/interface-metrics'
import type { PeerStore } from '@libp2p/interface-peer-store'
import type { Upgrader } from '@libp2p/interface-transport'

export interface MockNetworkComponents {
  peerId: PeerId
  registrar: Registrar
  connectionManager: ConnectionManager
  pubsub?: PubSub
  metrics?: Metrics
  upgrader: Upgrader
  peerStore: PeerStore
  dialer: Dialer
}

export interface MockConnectionManagerConfig {
  maxConnections: number
  minConnections: number
}

class MockNetwork {
  private components: MockNetworkComponents[] = []

  addNode (components: MockNetworkComponents): void {
    this.components.push(components)
  }

  getNode (peerId: PeerId): MockNetworkComponents {
    for (const components of this.components) {
      if (peerId.equals(components.peerId)) {
        return components
      }
    }

    throw new CodeError('Peer not found', 'ERR_PEER_NOT_FOUND')
  }

  reset (): void {
    this.components = []
  }
}

export const mockNetwork = new MockNetwork()

class MockConnectionManager extends EventEmitter<ConnectionManagerEvents> implements ConnectionManager, Startable {
  private readonly config: ConnectionManagerConfig
  private readonly connections: Map<string, Connection[]> = new Map()
  private readonly components: MockNetworkComponents
  private started = false

  constructor (components: MockNetworkComponents, config: ConnectionManagerConfig) {
    super()

    this.components = components
    this.config = config
  }
  getComponents(): ConnectionManagerComponents {
    return this.components
  }

  getConfig (): ConnectionManagerConfig {
    return this.config
  }

  getConnectionsMap (): Map<string, Connection[]> {
    return this.connections
  }

  isStarted (): boolean {
    return this.started
  }

  async start (): Promise<void> {
    this.started = true
  }

  async stop (): Promise<void> {
    for (const connectionList of this.connections.values()) {
      for (const connection of connectionList) {
        await connection.close()
      }
    }

    this.started = false
  }

  getConnections (peerId?: PeerId): Connection[] {
    if (peerId != null) {
      return this.connections.get(peerId.toString()) ?? []
    }

    let conns: Connection[] = []

    for (const c of this.connections.values()) {
      conns = conns.concat(c)
    }

    return conns
  }

  async openConnection (peerId: PeerId | Multiaddr): Promise<Connection> {
    if (this.components == null) {
      throw new CodeError('Not initialized', 'ERR_NOT_INITIALIZED')
    }

    if (isMultiaddr(peerId)) {
      throw new CodeError('Dialing multiaddrs not supported', 'ERR_NOT_SUPPORTED')
    }

    const existingConnections = this.getConnections(peerId)

    if (existingConnections.length > 0) {
      return existingConnections[0]
    }

    const componentsB = mockNetwork.getNode(peerId)

    const [aToB, bToA] = connectionPair(this.components, componentsB)

    // track connections
    this.connections.set(peerId.toString(), [aToB])
    this.connections.set(componentsB.peerId.toString(), [bToA])

    this.components.connectionManager.safeDispatchEvent<Connection>('peer:connect', {
      detail: aToB
    })

    for (const protocol of this.components.registrar.getProtocols()) {
      for (const topology of this.components.registrar.getTopologies(protocol)) {
        topology.onConnect(componentsB.peerId, aToB)
      }
    }

    componentsB.connectionManager.safeDispatchEvent<Connection>('peer:connect', {
      detail: bToA
    })

    for (const protocol of componentsB.registrar.getProtocols()) {
      for (const topology of componentsB.registrar.getTopologies(protocol)) {
        topology.onConnect(this.components.peerId, bToA)
      }
    }

    return aToB
  }

  async closeConnections (peerId: PeerId): Promise<void> {
    if (this.components == null) {
      throw new CodeError('Not initialized', 'ERR_NOT_INITIALIZED')
    }

    const connections = this.getConnections(peerId)

    if (connections.length === 0) {
      return
    }

    await Promise.all(
      connections.map(async connection => {
        await connection.close()
      })
    )
  }

  async acceptIncomingConnection (): Promise<boolean> {
    return true
  }

  afterUpgradeInbound (): void {

  }
}

export function mockConnectionManager (components: MockNetworkComponents, config: MockConnectionManagerConfig): ConnectionManager {
  return new MockConnectionManager(components, config)
}
