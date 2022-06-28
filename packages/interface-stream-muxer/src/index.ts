import type { Duplex } from 'it-stream-types'
import type { AbortOptions } from '@libp2p/interfaces'

/**
 * Outbound streams are opened by the local node, inbound streams are opened by the remote
 */
export type Direction = 'inbound' | 'outbound'

export interface StreamMuxerFactory {
  protocol: string
  createStreamMuxer: (init?: StreamMuxerInit) => StreamMuxer
}

/**
 * A libp2p stream muxer
 */
export interface StreamMuxer extends Duplex<Uint8Array> {
  protocol: string

  readonly streams: MuxedStream[]

  /**
   * Initiate a new stream with the given name. If no name is
   * provided, the id of the stream will be used.
   */
  newStream: (name?: string) => MuxedStream

  /**
   * Close or abort all tracked streams and stop the muxer
   */
  close: (err?: Error) => void
}

export interface StreamMuxerInit extends AbortOptions {
  onIncomingStream?: (stream: MuxedStream) => void
  onStreamEnd?: (stream: MuxedStream) => void

  /**
   * Outbound stream muxers are opened by the local node, inbound stream muxers are opened by the remote
   */
  direction?: Direction
}

/**
 * A Stream is a data channel between two peers that
 * can be written to and read from at both ends.
 *
 * It may be encrypted and multiplexed depending on the
 * configuration of the nodes.
 */
export interface MuxedStream extends Duplex<Uint8Array> {
  /**
   * Close a stream for reading and writing
   */
  close: () => void

  /**
   * Close a stream for reading only
   */
  closeRead: () => void

  /**
   * Close a stream for writing only
   */
  closeWrite: () => void

  /**
   * Call when a local error occurs, should close the stream for reading and writing
   */
  abort: (err: Error) => void

  /**
   * Call when a remote error occurs, should close the stream for reading and writing
   */
  reset: () => void

  /**
   * Unique identifier for a stream
   */
  id: string

  /**
   * Stats about this stream
   */
  stat: MuxedStreamStat

  /**
   * User defined stream metadata
   */
  metadata: Record<string, any>
}

export interface MuxedStreamStat {
  /**
   * Outbound streams are opened by the local node, inbound streams are opened by the remote
   */
  direction: Direction

  /**
   * Lifecycle times for the stream
   */
  timeline: MuxedStreamTimeline
}

export interface MuxedStreamTimeline {
  open: number
  close?: number
}
