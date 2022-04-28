import errCode from 'err-code'
import type { ConnectionGater, ConnectionProtector } from './connection/index.js'
import type { ContentRouting } from './content-routing/index.js'
import type { Dialer } from './dialer/index.js'
import type { AddressManager } from './index.js'
import type { Metrics } from './metrics/index.js'
import type { PeerId } from './peer-id/index.js'
import type { PeerRouting } from './peer-routing/index.js'
import type { PeerStore } from './peer-store/index.js'
import type { ConnectionManager, Registrar } from './registrar/index.js'
import type { TransportManager, Upgrader } from './transport/index.js'
import type { Datastore } from 'interface-datastore'
import type { PubSub } from './pubsub/index.js'
import type { DualDHT } from './dht/index.js'

export interface Initializable {
  init: (components: Components) => void
}

export function isInitializable (obj: any): obj is Initializable {
  return obj != null && typeof obj.init === 'function'
}

export interface ComponentsInit {
  peerId?: PeerId
  addressManager?: AddressManager
  peerStore?: PeerStore
  upgrader?: Upgrader
  metrics?: Metrics
  dialer?: Dialer
  registrar?: Registrar
  connectionManager?: ConnectionManager
  transportManager?: TransportManager
  connectionGater?: ConnectionGater
  contentRouting?: ContentRouting
  peerRouting?: PeerRouting
  datastore?: Datastore
  connectionProtector?: ConnectionProtector
  dht?: DualDHT
  pubsub?: PubSub
}

export class Components {
  private peerId?: PeerId
  private addressManager?: AddressManager
  private peerStore?: PeerStore
  private upgrader?: Upgrader
  private metrics?: Metrics
  private dialer?: Dialer
  private registrar?: Registrar
  private connectionManager?: ConnectionManager
  private transportManager?: TransportManager
  private connectionGater?: ConnectionGater
  private contentRouting?: ContentRouting
  private peerRouting?: PeerRouting
  private datastore?: Datastore
  private connectionProtector?: ConnectionProtector
  private dht?: DualDHT
  private pubsub?: PubSub

  constructor (init: ComponentsInit = {}) {
    this.peerId = init.peerId
    this.addressManager = init.addressManager
    this.peerStore = init.peerStore
    this.upgrader = init.upgrader
    this.metrics = init.metrics
    this.dialer = init.dialer
    this.registrar = init.registrar
    this.connectionManager = init.connectionManager
    this.transportManager = init.transportManager
    this.connectionGater = init.connectionGater
    this.contentRouting = init.contentRouting
    this.peerRouting = init.peerRouting
    this.datastore = init.datastore
    this.connectionProtector = init.connectionProtector
    this.dht = init.dht
    this.pubsub = init.pubsub
  }

  setPeerId (peerId: PeerId) {
    this.peerId = peerId

    return peerId
  }

  getPeerId (): PeerId {
    if (this.peerId == null) {
      throw errCode(new Error('peerId not set'), 'ERR_SERVICE_MISSING')
    }

    return this.peerId
  }

  setMetrics (metrics: Metrics) {
    this.metrics = metrics

    return metrics
  }

  getMetrics (): Metrics | undefined {
    return this.metrics
  }

  setAddressManager (addressManager: AddressManager) {
    this.addressManager = addressManager

    return addressManager
  }

  getAddressManager (): AddressManager {
    if (this.addressManager == null) {
      throw errCode(new Error('addressManager not set'), 'ERR_SERVICE_MISSING')
    }

    return this.addressManager
  }

  setPeerStore (peerStore: PeerStore) {
    this.peerStore = peerStore

    return peerStore
  }

  getPeerStore (): PeerStore {
    if (this.peerStore == null) {
      throw errCode(new Error('peerStore not set'), 'ERR_SERVICE_MISSING')
    }

    return this.peerStore
  }

  setUpgrader (upgrader: Upgrader) {
    this.upgrader = upgrader

    return upgrader
  }

  getUpgrader (): Upgrader {
    if (this.upgrader == null) {
      throw errCode(new Error('upgrader not set'), 'ERR_SERVICE_MISSING')
    }

    return this.upgrader
  }

  setDialer (dialer: Dialer) {
    this.dialer = dialer

    return dialer
  }

  getDialer (): Dialer {
    if (this.dialer == null) {
      throw errCode(new Error('dialer not set'), 'ERR_SERVICE_MISSING')
    }

    return this.dialer
  }

  setRegistrar (registrar: Registrar) {
    this.registrar = registrar

    return registrar
  }

  getRegistrar (): Registrar {
    if (this.registrar == null) {
      throw errCode(new Error('registrar not set'), 'ERR_SERVICE_MISSING')
    }

    return this.registrar
  }

  setConnectionManager (connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager

    return connectionManager
  }

  getConnectionManager (): ConnectionManager {
    if (this.connectionManager == null) {
      throw errCode(new Error('connectionManager not set'), 'ERR_SERVICE_MISSING')
    }

    return this.connectionManager
  }

  setTransportManager (transportManager: TransportManager) {
    this.transportManager = transportManager

    return transportManager
  }

  getTransportManager (): TransportManager {
    if (this.transportManager == null) {
      throw errCode(new Error('transportManager not set'), 'ERR_SERVICE_MISSING')
    }

    return this.transportManager
  }

  setConnectionGater (connectionGater: ConnectionGater) {
    this.connectionGater = connectionGater

    return connectionGater
  }

  getConnectionGater (): ConnectionGater {
    if (this.connectionGater == null) {
      throw errCode(new Error('connectionGater not set'), 'ERR_SERVICE_MISSING')
    }

    return this.connectionGater
  }

  setContentRouting (contentRouting: ContentRouting) {
    this.contentRouting = contentRouting

    return contentRouting
  }

  getContentRouting (): ContentRouting {
    if (this.contentRouting == null) {
      throw errCode(new Error('contentRouting not set'), 'ERR_SERVICE_MISSING')
    }

    return this.contentRouting
  }

  setPeerRouting (peerRouting: PeerRouting) {
    this.peerRouting = peerRouting

    return peerRouting
  }

  getPeerRouting (): PeerRouting {
    if (this.peerRouting == null) {
      throw errCode(new Error('peerRouting not set'), 'ERR_SERVICE_MISSING')
    }

    return this.peerRouting
  }

  setDatastore (datastore: Datastore) {
    this.datastore = datastore

    return datastore
  }

  getDatastore (): Datastore {
    if (this.datastore == null) {
      throw errCode(new Error('datastore not set'), 'ERR_SERVICE_MISSING')
    }

    return this.datastore
  }

  setConnectionProtector (connectionProtector: ConnectionProtector) {
    this.connectionProtector = connectionProtector

    return connectionProtector
  }

  getConnectionProtector (): ConnectionProtector | undefined {
    return this.connectionProtector
  }

  setDHT (dht: DualDHT) {
    this.dht = dht

    return dht
  }

  getDHT (): DualDHT {
    if (this.dht == null) {
      throw errCode(new Error('dht not set'), 'ERR_SERVICE_MISSING')
    }

    return this.dht
  }

  setPubSub (pubsub: PubSub) {
    this.pubsub = pubsub

    return pubsub
  }

  getPubSub (): PubSub {
    if (this.pubsub == null) {
      throw errCode(new Error('pubsub not set'), 'ERR_SERVICE_MISSING')
    }

    return this.pubsub
  }
}
