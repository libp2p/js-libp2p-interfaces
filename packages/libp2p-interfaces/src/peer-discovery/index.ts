import type { PeerData } from '../peer-data/index.js'
import type { EventEmitter, Startable } from '../index.js'

export interface PeerDiscoveryFactory {
  new (options?: any): PeerDiscovery
  tag: string
}

export interface PeerDiscoveryEvents {
  'peer': CustomEvent<PeerData>
}

export interface PeerDiscovery extends EventEmitter<PeerDiscoveryEvents>, Startable {

}
