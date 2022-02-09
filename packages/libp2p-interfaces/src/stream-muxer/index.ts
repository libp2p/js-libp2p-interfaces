import type { Duplex } from 'it-stream-types'
import type { Stream } from '../connection/index.js'

export interface MuxerFactory {
  new (options: MuxerOptions): Muxer
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

export interface MuxerOptions {
  /**
   * A function called when receiving a new stream from the remote.
   */
  onStream?: (stream: Stream) => void

  /**
   * A function called when a stream ends.
   */
  onStreamEnd?: (stream: Stream) => void
  maxMsgSize?: number
}
