import errCode from 'err-code'
import type { ConnectionGater, ConnectionProtector } from './connection/index.js'
import type { ContentRouting } from './content-routing/index.js'
import type { AddressManager } from './address-manager/index.js'
import { isStartable, Startable } from './startable.js'
import type { Metrics } from './metrics/index.js'
import type { PeerId } from './peer-id/index.js'
import type { PeerRouting } from './peer-routing/index.js'
import type { PeerStore } from './peer-store/index.js'
import type { Registrar } from './registrar/index.js'
import type { TransportManager, Upgrader } from './transport/index.js'
import type { Datastore } from 'interface-datastore'
import type { PubSub } from './pubsub/index.js'
import type { DualDHT } from './dht/index.js'
import type { ConnectionManager } from './connection-manager/index.js'

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

export class Components implements Startable {
  private peerId?: PeerId
  private addressManager?: AddressManager
  private peerStore?: PeerStore
  private upgrader?: Upgrader
  private metrics?: Metrics
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
  private started = false

  constructor (init: ComponentsInit = {}) {
    if (init.peerId != null) {
      this.setPeerId(init.peerId)
    }

    if (init.addressManager != null) {
      this.setAddressManager(init.addressManager)
    }

    if (init.peerStore != null) {
      this.setPeerStore(init.peerStore)
    }

    if (init.upgrader != null) {
      this.setUpgrader(init.upgrader)
    }

    if (init.metrics != null) {
      this.setMetrics(init.metrics)
    }

    if (init.registrar != null) {
      this.setRegistrar(init.registrar)
    }

    if (init.connectionManager != null) {
      this.setConnectionManager(init.connectionManager)
    }

    if (init.transportManager != null) {
      this.setTransportManager(init.transportManager)
    }

    if (init.connectionGater != null) {
      this.setConnectionGater(init.connectionGater)
    }

    if (init.contentRouting != null) {
      this.setContentRouting(init.contentRouting)
    }

    if (init.peerRouting != null) {
      this.setPeerRouting(init.peerRouting)
    }

    if (init.datastore != null) {
      this.setDatastore(init.datastore)
    }

    if (init.connectionProtector != null) {
      this.setConnectionProtector(init.connectionProtector)
    }

    if (init.dht != null) {
      this.setDHT(init.dht)
    }

    if (init.pubsub != null) {
      this.setPubSub(init.pubsub)
    }
  }

  isStarted () {
    return this.started
  }

  async beforeStart () {
    await Promise.all(
      Object.values(this).filter(obj => isStartable(obj)).map(async (startable: Startable) => {
        if (startable.beforeStart != null) {
          await startable.beforeStart()
        }
      })
    )
  }

  async start () {
    await Promise.all(
      Object.values(this).filter(obj => isStartable(obj)).map(async (startable: Startable) => {
        await startable.start()
      })
    )

    this.started = true
  }

  async afterStart () {
    await Promise.all(
      Object.values(this).filter(obj => isStartable(obj)).map(async (startable: Startable) => {
        if (startable.afterStart != null) {
          await startable.afterStart()
        }
      })
    )
  }

  async beforeStop () {
    await Promise.all(
      Object.values(this).filter(obj => isStartable(obj)).map(async (startable: Startable) => {
        if (startable.beforeStop != null) {
          await startable.beforeStop()
        }
      })
    )
  }

  async stop () {
    await Promise.all(
      Object.values(this).filter(obj => isStartable(obj)).map(async (startable: Startable) => {
        await startable.stop()
      })
    )

    this.started = false
  }

  async afterStop () {
    await Promise.all(
      Object.values(this).filter(obj => isStartable(obj)).map(async (startable: Startable) => {
        if (startable.afterStop != null) {
          await startable.afterStop()
        }
      })
    )
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

    if (isInitializable(metrics)) {
      metrics.init(this)
    }

    return metrics
  }

  getMetrics (): Metrics | undefined {
    return this.metrics
  }

  setAddressManager (addressManager: AddressManager) {
    this.addressManager = addressManager

    if (isInitializable(addressManager)) {
      addressManager.init(this)
    }

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

    if (isInitializable(peerStore)) {
      peerStore.init(this)
    }

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

    if (isInitializable(upgrader)) {
      upgrader.init(this)
    }

    return upgrader
  }

  getUpgrader (): Upgrader {
    if (this.upgrader == null) {
      throw errCode(new Error('upgrader not set'), 'ERR_SERVICE_MISSING')
    }

    return this.upgrader
  }

  setRegistrar (registrar: Registrar) {
    this.registrar = registrar

    if (isInitializable(registrar)) {
      registrar.init(this)
    }

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

    if (isInitializable(connectionManager)) {
      connectionManager.init(this)
    }

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

    if (isInitializable(transportManager)) {
      transportManager.init(this)
    }

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

    if (isInitializable(connectionGater)) {
      connectionGater.init(this)
    }

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

    if (isInitializable(contentRouting)) {
      contentRouting.init(this)
    }

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

    if (isInitializable(peerRouting)) {
      peerRouting.init(this)
    }

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

    if (isInitializable(datastore)) {
      datastore.init(this)
    }

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

    if (isInitializable(connectionProtector)) {
      connectionProtector.init(this)
    }

    return connectionProtector
  }

  getConnectionProtector (): ConnectionProtector | undefined {
    return this.connectionProtector
  }

  setDHT (dht: DualDHT) {
    this.dht = dht

    if (isInitializable(dht)) {
      dht.init(this)
    }

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

    if (isInitializable(pubsub)) {
      pubsub.init(this)
    }

    return pubsub
  }

  getPubSub (): PubSub {
    if (this.pubsub == null) {
      throw errCode(new Error('pubsub not set'), 'ERR_SERVICE_MISSING')
    }

    return this.pubsub
  }
}
