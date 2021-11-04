import type { EventEmitter } from 'events'
import type { PeerData } from '../peer-data'

export interface PeerDiscoveryFactory {
  new (options?: any): PeerDiscovery
  tag: string
}

export interface PeerDiscoveryHandler { (peerData: PeerData): void }

export interface PeerDiscovery extends EventEmitter {
  start: () => void|Promise<void>
  stop: () => void|Promise<void>

  on: (event: 'peer', handler: PeerDiscoveryHandler) => this
}

export default PeerDiscovery
