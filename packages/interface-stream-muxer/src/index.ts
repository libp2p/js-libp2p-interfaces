import type { Duplex } from 'it-stream-types'
import type { Components } from '@libp2p/components'
import type { Stream } from '@libp2p/interface-connection'
import type { AbortOptions } from '@libp2p/interfaces'

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