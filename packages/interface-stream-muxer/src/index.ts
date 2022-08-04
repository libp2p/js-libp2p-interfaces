import type { Duplex } from 'it-stream-types'
import type { Direction, Stream } from '@libp2p/interface-connection'
import type { AbortOptions } from '@libp2p/interfaces'
import type { Uint8ArrayList } from 'uint8arraylist'

export interface StreamMuxerFactory {
  protocol: string
  createStreamMuxer: (init?: StreamMuxerInit) => StreamMuxer
}

/**
 * A libp2p stream muxer
 */
export interface StreamMuxer extends Duplex<Uint8ArrayList> {
  protocol: string

  readonly streams: Stream<Uint8ArrayList>[]
  /**
   * Initiate a new stream with the given name. If no name is
   * provided, the id of the stream will be used.
   */
  newStream: (name?: string) => Stream<Uint8ArrayList>

  /**
   * Close or abort all tracked streams and stop the muxer
   */
  close: (err?: Error) => void
}

export interface StreamMuxerInit extends AbortOptions {
  onIncomingStream?: (stream: Stream<Uint8ArrayList>) => void
  onStreamEnd?: (stream: Stream<Uint8ArrayList>) => void

  /**
   * Outbound stream muxers are opened by the local node, inbound stream muxers are opened by the remote
   */
  direction?: Direction
}
