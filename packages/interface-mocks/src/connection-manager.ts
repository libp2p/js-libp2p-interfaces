import { EventEmitter } from '@libp2p/interfaces/events'
import type { Startable } from '@libp2p/interfaces/startable'
import type { Connection } from '@libp2p/interface-connection'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { ConnectionManager, ConnectionManagerEvents } from '@libp2p/interface-connection-manager'
import { connectionPair } from './connection.js'
import { CodeError } from '@libp2p/interfaces/errors'
import type { Registrar } from '@libp2p/interface-registrar'
import type { PubSub } from '@libp2p/interface-pubsub'
import { isMultiaddr, Multiaddr } from '@multiformats/multiaddr'
import { peerIdFromString } from '@libp2p/peer-id'

export interface MockNetworkComponents {
  peerId: PeerId
  registrar: Registrar
  connectionManager: ConnectionManager
  pubsub?: PubSub
}

class MockNetwork {
  private components: MockNetworkComponents[] = []

  addNode (components: MockNetworkComponents): void {
    this.components.push(components)
  }

  getNode (peerId: PeerId | Multiaddr []): MockNetworkComponents {
    if (Array.isArray(peerId)) {
      peerId = peerIdFromString(peerId[0].getPeerId() ?? '')
    }

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

export interface MockConnectionManagerComponents {
  peerId: PeerId
  registrar: Registrar
}

class MockConnectionManager extends EventEmitter<ConnectionManagerEvents> implements ConnectionManager, Startable {
  private connections: Connection[] = []
  private readonly components: MockConnectionManagerComponents
  private started = false

  constructor (components: MockConnectionManagerComponents) {
    super()

    this.components = components
  }

  isStarted (): boolean {
    return this.started
  }

  async start (): Promise<void> {
    this.started = true
  }

  async stop (): Promise<void> {
    for (const connection of this.connections) {
      await this.closeConnections(connection.remotePeer)
    }

    this.started = false
  }

  getConnections (peerId?: PeerId): Connection[] {
    if (peerId != null) {
      return this.connections
        .filter(c => c.remotePeer.toString() === peerId.toString())
    }

    return this.connections
  }

  async openConnection (peerId: PeerId | Multiaddr | Multiaddr[]): Promise<Connection> {
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
    this.connections.push(aToB)
    ;(componentsB.connectionManager as MockConnectionManager).connections.push(bToA)

    this.safeDispatchEvent<Connection>('peer:connect', {
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

    const componentsB = mockNetwork.getNode(peerId)

    for (const protocol of this.components.registrar.getProtocols()) {
      this.components.registrar.getTopologies(protocol).forEach(topology => {
        topology.onDisconnect(componentsB.peerId)
      })
    }

    for (const conn of connections) {
      await conn.close()
    }

    this.connections = this.connections.filter(c => !c.remotePeer.equals(peerId))

    await componentsB.connectionManager?.closeConnections(this.components.peerId)
  }

  async acceptIncomingConnection (): Promise<boolean> {
    return true
  }

  afterUpgradeInbound (): void {

  }
}

export function mockConnectionManager (components: MockConnectionManagerComponents): ConnectionManager {
  return new MockConnectionManager(components)
}
