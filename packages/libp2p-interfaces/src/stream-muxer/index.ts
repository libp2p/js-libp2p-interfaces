import type { Duplex } from 'it-stream-types'

export interface MuxerFactory {
  new (options: MuxerOptions): Muxer
  multicodec: string
}

/**
 * A libp2p stream muxer
 */
export interface Muxer {
  readonly streams: MuxedStream[]
  /**
   * Initiate a new stream with the given name. If no name is
   * provided, the id of th stream will be used.
   */
  newStream: (name?: string) => MuxedStream

  /**
   * A function called when receiving a new stream from the remote.
   */
  onStream: (stream: MuxedStream) => void

  /**
   * A function called when a stream ends.
   */
  onStreamEnd: (stream: MuxedStream) => void
}

export interface MuxerOptions {
  onStream?: (stream: MuxedStream) => void
  onStreamEnd?: (stream: MuxedStream) => void
  maxMsgSize?: number
}

export interface MuxedTimeline {
  open: number
  close?: number
}

export interface MuxedStream extends Duplex<Uint8Array> {
  close: () => void
  abort: () => void
  reset: () => void
  timeline: MuxedTimeline
  id: string
}
