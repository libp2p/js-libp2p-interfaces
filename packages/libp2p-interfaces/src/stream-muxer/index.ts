import type { Duplex } from 'it-stream-types'

export interface MuxerFactory {
  new (options: MuxerOptions): Muxer
  multicodec: string
}

/**
 * A libp2p stream muxer
 */
export interface Muxer extends Duplex<Uint8Array> {
  readonly streams: MuxedStream[]
  /**
   * Initiate a new stream with the given name. If no name is
   * provided, the id of th stream will be used.
   */
  newStream: (name?: string) => MuxedStream
}

export interface MuxerOptions {
  /**
   * A function called when receiving a new stream from the remote.
   */
  onStream?: (stream: MuxedStream) => void

  /**
   * A function called when a stream ends.
   */
  onStreamEnd?: (stream: MuxedStream) => void
  maxMsgSize?: number
}

export interface MuxedTimeline {
  open: number
  close?: number
}

export interface MuxedStream extends Duplex<Uint8Array> {
  close: () => void
  abort: (err?: Error) => void
  reset: () => void
  timeline: MuxedTimeline
  id: string
}
