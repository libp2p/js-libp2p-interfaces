import type { PeerData } from '../peer-data/index.js'
import type { EventEmitter, Startable } from '../index.js'

export interface PeerDiscoveryFactory<PeerDiscoveryInit> {
  new (init?: PeerDiscoveryInit): PeerDiscovery
  tag: string
}

export interface PeerDiscoveryEvents {
  'peer': CustomEvent<PeerData>
}

export interface PeerDiscovery extends EventEmitter<PeerDiscoveryEvents>, Startable {

}
