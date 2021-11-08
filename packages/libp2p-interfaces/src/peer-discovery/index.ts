import type { EventEmitter } from 'events'
import type { PeerData } from '../peer-data'

export interface PeerDiscoveryFactory {
  new (options?: any): PeerDiscovery
  tag: string
}

interface PeerDiscoveryEvents {
  'peer': PeerData
}

export interface PeerDiscovery extends EventEmitter {
  on: (<U extends keyof PeerDiscoveryEvents> (event: U, listener: (event: PeerDiscoveryEvents[U]) => void) => this) &
  ((event: string, listener: (...args: any[]) => void) => this)

  once: (<U extends keyof PeerDiscoveryEvents> (event: U, listener: (event: PeerDiscoveryEvents[U]) => void) => this) &
  ((event: string, listener: (...args: any[]) => void) => this)

  emit: (<U extends keyof PeerDiscoveryEvents> (name: U, event: PeerDiscoveryEvents[U]) => boolean) &
  ((name: string, ...args: any[]) => boolean)
}

export default PeerDiscovery
