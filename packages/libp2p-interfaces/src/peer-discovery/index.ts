import type { PeerInfo } from '../peer-info/index.js'
import type { EventEmitter } from '../events.js'

export interface PeerDiscoveryEvents {
  'peer': CustomEvent<PeerInfo>
}

export interface PeerDiscovery extends EventEmitter<PeerDiscoveryEvents> {

}
