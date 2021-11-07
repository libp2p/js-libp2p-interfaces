import type { EventEmitter } from 'events'
import type { PeerData } from '../peer-data'

export interface PeerDiscoveryFactory {
  new (options?: any): PeerDiscovery
  tag: string
}

export interface PeerDiscoveryListener { (peerData: PeerData): void }

interface PeerDiscoveryEvents {
  'peer': PeerDiscoveryListener
}

export interface PeerDiscovery extends EventEmitter {
  on: <U extends keyof PeerDiscoveryEvents>(
    event: U, listener: PeerDiscoveryEvents[U]
  ) => this
  once: <U extends keyof PeerDiscoveryEvents>(
    event: U, listener: PeerDiscoveryEvents[U]
  ) => this
}

export default PeerDiscovery
