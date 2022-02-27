import type { Duplex } from 'it-stream-types'
import type { Stream } from '../connection/index.js'
import type { AbortOptions } from '../index.js'

export interface MuxerFactory<T extends MuxerInit> {
  new (init?: T): Muxer
  multicodec: string
}

/**
 * A libp2p stream muxer
 */
export interface Muxer extends Duplex<Uint8Array> {
  readonly streams: Stream[]
  /**
   * Initiate a new stream with the given name. If no name is
   * provided, the id of the stream will be used.
   */
  newStream: (name?: string) => Stream
}

export interface MuxerInit extends AbortOptions {
  onIncomingStream?: (stream: Stream) => void
  onStreamEnd?: (stream: Stream) => void
}
