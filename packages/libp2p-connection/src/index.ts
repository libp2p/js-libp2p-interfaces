import type { Multiaddr } from 'multiaddr'
import errCode from 'err-code'
import { OPEN, CLOSING, CLOSED } from '@libp2p/interfaces/connection/status'
import type { MuxedStream } from '@libp2p/interfaces/stream-muxer'
import type { ConnectionStat, StreamData } from '@libp2p/interfaces/connection'
import type { PeerId } from '@libp2p/interfaces/peer-id'

const connectionSymbol = Symbol.for('@libp2p/interface-connection/connection')

export interface ProtocolStream {
  protocol: string
  stream: MuxedStream
}

interface ConnectionOptions {
  localAddr: Multiaddr
  remoteAddr: Multiaddr
  localPeer: PeerId
  remotePeer: PeerId
  newStream: (protocols: string[]) => Promise<ProtocolStream>
  close: () => Promise<void>
  getStreams: () => MuxedStream[]
  stat: ConnectionStat
}

/**
 * An implementation of the js-libp2p connection.
 * Any libp2p transport should use an upgrader to return this connection.
 */
export class Connection {
  /**
   * Connection identifier.
   */
  public readonly id: string
  /**
   * Observed multiaddr of the local peer
   */
  public readonly localAddr: Multiaddr
  /**
   * Observed multiaddr of the remote peer
   */
  public readonly remoteAddr: Multiaddr
  /**
   * Local peer id
   */
  public readonly localPeer: PeerId
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
  private readonly _newStream: (protocols: string[]) => Promise<ProtocolStream>
  /**
   * Reference to the close function of the raw connection
   */
  private readonly _close: () => Promise<void>
  /**
   * Reference to the getStreams function of the muxer
   */
  private readonly _getStreams: () => MuxedStream[]
  /**
   * Connection streams registry
   */
  public readonly registry: Map<string, StreamData>
  private _closing: boolean

  /**
   * An implementation of the js-libp2p connection.
   * Any libp2p transport should use an upgrader to return this connection.
   */
  constructor (options: ConnectionOptions) {
    const { localAddr, remoteAddr, localPeer, remotePeer, newStream, close, getStreams, stat } = options

    this.id = `${(parseInt(String(Math.random() * 1e9))).toString(36)}${Date.now()}`
    this.localAddr = localAddr
    this.remoteAddr = remoteAddr
    this.localPeer = localPeer
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

  get [connectionSymbol] () {
    return true
  }

  /**
   * Checks if the given value is a `Connection` instance
   */
  static isConnection (other: any) {
    return Boolean(connectionSymbol in other)
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
  async newStream (protocols: string[]) {
    if (this.stat.status === CLOSING) {
      throw errCode(new Error('the connection is being closed'), 'ERR_CONNECTION_BEING_CLOSED')
    }

    if (this.stat.status === CLOSED) {
      throw errCode(new Error('the connection is closed'), 'ERR_CONNECTION_CLOSED')
    }

    if (!Array.isArray(protocols)) protocols = [protocols]

    const { stream, protocol } = await this._newStream(protocols)

    this.addStream(stream, { protocol, metadata: {} })

    return {
      stream,
      protocol
    }
  }

  /**
   * Add a stream when it is opened to the registry
   */
  addStream (muxedStream: MuxedStream, streamData: StreamData) {
    // Add metadata for the stream
    this.registry.set(muxedStream.id, streamData)
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

    // Close raw connection
    this._closing = true
    await this._close()
    this._closing = false

    this.stat.timeline.close = Date.now()
    this.stat.status = CLOSED
  }
}
