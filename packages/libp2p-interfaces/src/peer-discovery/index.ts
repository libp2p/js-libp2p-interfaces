import type { PeerData } from '../peer-data/index.js'
import type { EventEmitter } from '../index.js'

export interface PeerDiscoveryEvents {
  'peer': CustomEvent<PeerData>
}

export interface PeerDiscovery extends EventEmitter<PeerDiscoveryEvents> {

}
