import type { Multiaddr } from '@multiformats/multiaddr'
import errCode from 'err-code'
import { OPEN, CLOSING, CLOSED } from '@libp2p/interfaces/connection/status'
import { symbol } from '@libp2p/interfaces/connection'
import type { Connection, ConnectionStat, Metadata, ProtocolStream, Stream } from '@libp2p/interfaces/connection'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import { logger } from '@libp2p/logger'
import type { AbortOptions } from '@libp2p/interfaces'

const log = logger('libp2p:connection')

interface ConnectionInit {
  remoteAddr: Multiaddr
  remotePeer: PeerId
  newStream: (protocols: string[], options?: AbortOptions) => Promise<ProtocolStream>
  close: () => Promise<void>
  getStreams: () => Stream[]
  stat: ConnectionStat
}

/**
 * An implementation of the js-libp2p connection.
 * Any libp2p transport should use an upgrader to return this connection.
 */
export class ConnectionImpl implements Connection {
  /**
   * Connection identifier.
   */
  public readonly id: string
  /**
   * Observed multiaddr of the remote peer
   */
  public readonly remoteAddr: Multiaddr
  /**
   * Remote peer id
   */
  public readonly remotePeer: PeerId
  /**
   * Connection metadata
   */
  public readonly stat: ConnectionStat
  /**
   * User provided tags
   *
   */
  public tags: string[]

  /**
   * Reference to the new stream function of the multiplexer
   */
  private readonly _newStream: (protocols: string[], options?: AbortOptions) => Promise<ProtocolStream>
  /**
   * Reference to the close function of the raw connection
   */
  private readonly _close: () => Promise<void>
  /**
   * Reference to the getStreams function of the muxer
   */
  private readonly _getStreams: () => Stream[]
  /**
   * Connection streams registry
   */
  public readonly registry: Map<string, Metadata>
  private _closing: boolean

  /**
   * An implementation of the js-libp2p connection.
   * Any libp2p transport should use an upgrader to return this connection.
   */
  constructor (init: ConnectionInit) {
    const { remoteAddr, remotePeer, newStream, close, getStreams, stat } = init

    this.id = `${(parseInt(String(Math.random() * 1e9))).toString(36)}${Date.now()}`
    this.remoteAddr = remoteAddr
    this.remotePeer = remotePeer
    this.stat = {
      ...stat,
      status: OPEN
    }
    this._newStream = newStream
    this._close = close
    this._getStreams = getStreams
    this.registry = new Map()
    this.tags = []
    this._closing = false
  }

  get [Symbol.toStringTag] () {
    return 'Connection'
  }

  get [symbol] () {
    return true
  }

  /**
   * Get all the streams of the muxer
   */
  get streams () {
    return this._getStreams()
  }

  /**
   * Create a new stream from this connection
   */
  async newStream (protocols: string | string[], options?: AbortOptions) {
    if (this.stat.status === CLOSING) {
      throw errCode(new Error('the connection is being closed'), 'ERR_CONNECTION_BEING_CLOSED')
    }

    if (this.stat.status === CLOSED) {
      throw errCode(new Error('the connection is closed'), 'ERR_CONNECTION_CLOSED')
    }

    if (!Array.isArray(protocols)) {
      protocols = [protocols]
    }

    const { stream, protocol } = await this._newStream(protocols, options)

    this.addStream(stream, { protocol, metadata: {} })

    return {
      stream,
      protocol
    }
  }

  /**
   * Add a stream when it is opened to the registry
   */
  addStream (stream: Stream, metadata: Partial<Metadata> = {}) {
    // Add metadata for the stream
    this.registry.set(stream.id, {
      protocol: metadata.protocol ?? '',
      metadata: metadata.metadata ?? {}
    })
  }

  /**
   * Remove stream registry after it is closed
   */
  removeStream (id: string) {
    this.registry.delete(id)
  }

  /**
   * Close the connection
   */
  async close () {
    if (this.stat.status === CLOSED || this._closing) {
      return
    }

    this.stat.status = CLOSING

    // close all streams - this can throw if we're not multiplexed
    try {
      this.streams.forEach(s => s.close())
    } catch (err) {
      log.error(err)
    }

    // Close raw connection
    this._closing = true
    await this._close()
    this._closing = false

    this.stat.timeline.close = Date.now()
    this.stat.status = CLOSED
  }
}

export function createConnection (init: ConnectionInit): Connection {
  return new ConnectionImpl(init)
}
