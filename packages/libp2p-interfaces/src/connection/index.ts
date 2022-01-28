import type { Multiaddr } from '@multiformats/multiaddr'
import type { PeerId } from '../peer-id'
import type { MuxedStream } from '../stream-muxer'
import type * as Status from './status.js'

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

export interface StreamData {
  protocol: string
  metadata: Record<string, any>
}

export interface Stream {
  protocol: string
  stream: MuxedStream
}

export interface Connection {
  id: string
  stat: ConnectionStat
  remoteAddr: Multiaddr
  remotePeer: PeerId
  registry: Map<string, StreamData>
  tags: string[]
  streams: MuxedStream[]

  newStream: (multicodecs: string[]) => Promise<Stream>
  addStream: (muxedStream: MuxedStream, streamData: StreamData) => void
  removeStream: (id: string) => void
  close: () => Promise<void>
}
