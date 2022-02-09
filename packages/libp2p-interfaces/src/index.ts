import type { PeerId } from './peer-id/index.js'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { Duplex } from 'it-stream-types'

export interface AbortOptions {
  signal?: AbortSignal
}

export interface Startable {
  start: () => void | Promise<void>
  stop: () => void | Promise<void>
  isStarted: () => boolean
}

// Implemented by libp2p, should be moved to libp2p-interfaces eventually
export interface Dialer {
  dialProtocol: (peer: PeerId, protocol: string, options?: { signal?: AbortSignal }) => Promise<{ stream: Duplex<Uint8Array> }>
}

// Implemented by libp2p, should be moved to libp2p-interfaces eventually
export interface Addressable {
  multiaddrs: Multiaddr[]
}
