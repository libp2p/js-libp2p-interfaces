import type { PeerId } from 'libp2p-peer-id'
import type { Multiaddr } from 'multiaddr'

export interface PeerData {
  id: PeerId
  multiaddrs: Multiaddr[]
  protocols: string[]
}
