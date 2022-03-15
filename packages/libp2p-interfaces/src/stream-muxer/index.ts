import type { Duplex } from 'it-stream-types'
import type { Components } from '../components.js'
import type { Stream } from '../connection/index.js'
import type { AbortOptions } from '../index.js'

export interface StreamMuxerFactory {
  protocol: string
  createStreamMuxer: (components: Components, init?: StreamMuxerInit) => StreamMuxer
}

/**
 * A libp2p stream muxer
 */
export interface StreamMuxer extends Duplex<Uint8Array> {
  protocol: string

  readonly streams: Stream[]
  /**
   * Initiate a new stream with the given name. If no name is
   * provided, the id of the stream will be used.
   */
  newStream: (name?: string) => Stream
}

export interface StreamMuxerInit extends AbortOptions {
  onIncomingStream?: (stream: Stream) => void
  onStreamEnd?: (stream: Stream) => void
}
