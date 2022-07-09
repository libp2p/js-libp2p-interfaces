import { CustomEvent, EventEmitter } from '@libp2p/interfaces/events'
import type { Startable } from '@libp2p/interfaces/startable'
import type { Connection } from '@libp2p/interface-connection'
import type { PeerId } from '@libp2p/interface-peer-id'
import type { ConnectionManager, ConnectionManagerEvents } from '@libp2p/interface-connection-manager'
import type { Components, Initializable } from '@libp2p/components'
import { connectionPair } from './connection.js'
import errCode from 'err-code'

class MockNetwork {
  private components: Components[] = []

  addNode (components: Components): void {
    this.components.push(components)
  }

  getNode (peerId: PeerId): Components {
    for (const components of this.components) {
      if (peerId.equals(components.getPeerId())) {
        return components
      }
    }

    throw errCode(new Error('Peer not found'), 'ERR_PEER_NOT_FOUND')
  }

  reset () {
    this.components = []
  }
}

export const mockNetwork = new MockNetwork()

class MockConnectionManager extends EventEmitter<ConnectionManagerEvents> implements ConnectionManager, Initializable, Startable {
  private connections: Connection[] = []
  private components?: Components
  private started = false

  init (components: Components) {
    this.components = components
  }

  isStarted () {
    return this.started
  }

  async start () {
    this.started = true
  }

  async stop () {
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

  async openConnection (peerId: PeerId) {
    if (this.components == null) {
      throw errCode(new Error('Not initialized'), 'ERR_NOT_INITIALIZED')
    }

    const existingConnections = this.getConnections(peerId)

    if (existingConnections.length > 0) {
      return existingConnections[0]
    }

    const componentsB = mockNetwork.getNode(peerId)

    const [aToB, bToA] = connectionPair(this.components, componentsB)

    // track connections
    this.connections.push(aToB)
    ;(componentsB.getConnectionManager() as MockConnectionManager).connections.push(bToA)

    this.components.getConnectionManager().dispatchEvent(new CustomEvent<Connection>('peer:connect', {
      detail: aToB
    }))

    for (const protocol of this.components.getRegistrar().getProtocols()) {
      for (const topology of this.components.getRegistrar().getTopologies(protocol)) {
        topology.onConnect(componentsB.getPeerId(), aToB)
      }
    }

    componentsB.getConnectionManager().dispatchEvent(new CustomEvent<Connection>('peer:connect', {
      detail: bToA
    }))

    for (const protocol of componentsB.getRegistrar().getProtocols()) {
      for (const topology of componentsB.getRegistrar().getTopologies(protocol)) {
        topology.onConnect(this.components.getPeerId(), bToA)
      }
    }

    return aToB
  }

  async closeConnections (peerId: PeerId) {
    if (this.components == null) {
      throw errCode(new Error('Not initialized'), 'ERR_NOT_INITIALIZED')
    }

    const connections = this.getConnections(peerId)

    if (connections.length === 0) {
      return
    }

    const componentsB = mockNetwork.getNode(peerId)

    for (const protocol of this.components.getRegistrar().getProtocols()) {
      this.components.getRegistrar().getTopologies(protocol).forEach(topology => {
        topology.onDisconnect(componentsB.getPeerId())
      })
    }

    for (const conn of connections) {
      await conn.close()
    }

    this.connections = this.connections.filter(c => !c.remotePeer.equals(peerId))

    await componentsB.getConnectionManager().closeConnections(this.components.getPeerId())
  }
}

export function mockConnectionManager () {
  return new MockConnectionManager()
}
