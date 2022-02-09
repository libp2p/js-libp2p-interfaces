import type { Multiaddr } from '@multiformats/multiaddr'
import type { PeerId } from '../peer-id'
import type * as Status from './status.js'
import type { Duplex } from 'it-stream-types'

export interface Timeline {
  open: number
  upgraded?: number
  close?: number
}

export interface ConnectionStat {
  direction: 'inbound' | 'outbound'
  timeline: Timeline
  multiplexer?: string
  encryption?: string
  status: keyof typeof Status
}

export interface Metadata {
  protocol: string
  metadata: Record<string, any>
}

/**
 * A Stream is a data channel between two peers that
 * can be written to and read from at both ends.
 *
 * It may be encrypted and multiplexed depending on the
 * configuration of the nodes.
 */
export interface Stream extends Duplex<Uint8Array> {
  close: () => void
  abort: (err?: Error) => void
  reset: () => void
  timeline: Timeline
  id: string
}

export interface ProtocolStream {
  protocol: string
  stream: Stream
}

/**
 * A Connection is a high-level representation of a connection
 * to a remote peer that may have been secured by encryption and
 * multiplexed, depending on the configuration of the nodes
 * between which the connection is made.
 */
export interface Connection {
  id: string
  stat: ConnectionStat
  remoteAddr: Multiaddr
  remotePeer: PeerId
  registry: Map<string, Metadata>
  tags: string[]
  streams: Stream[]

  newStream: (multicodecs: string[]) => Promise<ProtocolStream>
  addStream: (stream: Stream, data: Metadata) => void
  removeStream: (id: string) => void
  close: () => Promise<void>
}
