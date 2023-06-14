import { type Logger, logger } from '@libp2p/logger'
import { abortableSource } from 'abortable-iterator'
import map from 'it-map'
import * as ndjson from 'it-ndjson'
import { pipe } from 'it-pipe'
import { type Pushable, pushable } from 'it-pushable'
import { Uint8ArrayList } from 'uint8arraylist'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { AbstractStream } from '@libp2p/interface-stream-muxer/stream'
import type { Stream } from '@libp2p/interface-connection'
import type { StreamMuxer, StreamMuxerFactory, StreamMuxerInit } from '@libp2p/interface-stream-muxer'
import type { Source } from 'it-stream-types'

let muxers = 0
let streams = 0
const MAX_MESSAGE_SIZE = 1024 * 1024

interface DataMessage {
  id: string
  type: 'data'
  direction: 'initiator' | 'recipient'
  chunk: string
}

interface ResetMessage {
  id: string
  type: 'reset'
  direction: 'initiator' | 'recipient'
}

interface CloseMessage {
  id: string
  type: 'close'
  direction: 'initiator' | 'recipient'
}

interface CreateMessage {
  id: string
  type: 'create'
  direction: 'initiator'
}

type StreamMessage = DataMessage | ResetMessage | CloseMessage | CreateMessage

class MuxedStream extends AbstractStream {
  public readonly type: 'initiator' | 'recipient'
  public readonly pushable: Pushable<StreamMessage>

  constructor (init: { id: string, type: 'initiator' | 'recipient', push: Pushable<StreamMessage>, onEnd: (err?: Error) => void }) {
    const { id, type, push, onEnd } = init

    super({
      id,
      direction: type === 'initiator' ? 'outbound' : 'inbound',
      maxDataSize: MAX_MESSAGE_SIZE,
      onEnd
    })

    this.type = type
    this.pushable = push
  }

  /**
   * Send a message to the remote muxer informing them a new stream is being
   * opened
   */
  sendNewStream (): void | Promise<void> {
    console.info('initiator send create stream')
    const createMsg: CreateMessage = {
      id: this.id,
      type: 'create',
      direction: 'initiator'
    }
    this.pushable.push(createMsg)
  }

  /**
   * Send a data message to the remote muxer
   */
  sendData (buf: Uint8ArrayList): void | Promise<void> {
    console.info(this.type, 'send data')
    const dataMsg: DataMessage = {
      id: this.id,
      type: 'data',
      chunk: uint8ArrayToString(buf.subarray(), 'base64pad'),
      direction: this.type
    }
    this.pushable.push(dataMsg)
  }

  /**
   * Send a reset message to the remote muxer
   */
  sendReset (): void | Promise<void> {
    console.info(this.type, 'send reset')
    const resetMsg: ResetMessage = {
      id: this.id,
      type: 'reset',
      direction: this.type
    }
    this.pushable.push(resetMsg)
  }

  /**
   * Send a message to the remote muxer, informing them no more data messages
   * will be sent by this end of the stream
   */
  sendCloseWrite (): void | Promise<void> {
    console.info(this.type, 'send close write')
    const closeMsg: CloseMessage = {
      id: this.id,
      type: 'close',
      direction: this.type
    }
    this.pushable.push(closeMsg)
  }

  /**
   * Send a message to the remote muxer, informing them no more data messages
   * will be read by this end of the stream
   */
  sendCloseRead (): void | Promise<void> {
    console.info(this.type, 'send close read')
    const closeMsg: CloseMessage = {
      id: this.id,
      type: 'close',
      direction: this.type
    }
    this.pushable.push(closeMsg)
  }
}

class MockMuxer implements StreamMuxer {
  public source: AsyncGenerator<Uint8Array>
  public input: Pushable<Uint8Array>
  public streamInput: Pushable<StreamMessage>
  public name: string
  public protocol: string = '/mock-muxer/1.0.0'

  private readonly closeController: AbortController
  private readonly registryInitiatorStreams: Map<string, AbstractStream>
  private readonly registryRecipientStreams: Map<string, AbstractStream>
  private readonly options: StreamMuxerInit

  private readonly log: Logger

  constructor (init?: StreamMuxerInit) {
    this.name = `muxer:${muxers++}`
    this.log = logger(`libp2p:mock-muxer:${this.name}`)
    this.registryInitiatorStreams = new Map()
    this.registryRecipientStreams = new Map()
    this.log('create muxer')
    this.options = init ?? { direction: 'inbound' }
    this.closeController = new AbortController()
    // receives data from the muxer at the other end of the stream
    this.source = this.input = pushable({
      onEnd: (err) => {
        this.close(err)
      }
    })

    // receives messages from all of the muxed streams
    this.streamInput = pushable<StreamMessage>({
      objectMode: true
    })
  }

  // receive incoming messages
  async sink (source: Source<Uint8ArrayList | Uint8Array>): Promise<void> {
    try {
      await pipe(
        abortableSource(source, this.closeController.signal),
        (source) => map(source, buf => uint8ArrayToString(buf.subarray())),
        ndjson.parse<StreamMessage>,
        async (source) => {
          for await (const message of source) {
            this.log.trace('-> %s %s %s', message.type, message.direction, message.id)
            this.handleMessage(message)
          }
        }
      )

      this.log('muxed stream ended')
      this.input.end()
    } catch (err: any) {
      this.log('muxed stream errored', err)
      this.input.end(err)
    }
  }

  handleMessage (message: StreamMessage): void {
    let muxedStream: AbstractStream | undefined

    const registry = message.direction === 'initiator' ? this.registryRecipientStreams : this.registryInitiatorStreams

    if (message.type === 'create') {
      if (registry.has(message.id)) {
        throw new Error(`Already had stream for ${message.id}`)
      }

      muxedStream = this.createStream(message.id, 'recipient')
      registry.set(muxedStream.id, muxedStream)

      if (this.options.onIncomingStream != null) {
        this.options.onIncomingStream(muxedStream)
      }
    }

    muxedStream = registry.get(message.id)

    if (muxedStream == null) {
      this.log.error(`No stream found for ${message.id}`)

      return
    }

    if (message.type === 'data') {
      muxedStream.sourcePush(new Uint8ArrayList(uint8ArrayFromString(message.chunk, 'base64pad')))
    } else if (message.type === 'reset') {
      this.log('-> reset stream %s %s', muxedStream.stat.direction, muxedStream.id)
      muxedStream.reset()
    } else if (message.type === 'close') {
      this.log('-> closing stream %s %s', muxedStream.stat.direction, muxedStream.id)
      muxedStream.closeRead()
    }
  }

  get streams (): Stream[] {
    return Array.from(this.registryRecipientStreams.values())
      .concat(Array.from(this.registryInitiatorStreams.values()))
  }

  newStream (name?: string): Stream {
    if (this.closeController.signal.aborted) {
      throw new Error('Muxer already closed')
    }
    this.log('newStream %s', name)
    const storedStream = this.createStream(name, 'initiator')
    this.registryInitiatorStreams.set(storedStream.id, storedStream)

    return storedStream
  }

  createStream (name?: string, type: 'initiator' | 'recipient' = 'initiator'): MuxedStream {
    const id = name ?? `${this.name}:stream:${streams++}`

    this.log('createStream %s %s', type, id)

    const muxedStream: MuxedStream = new MuxedStream({
      id,
      type,
      push: this.streamInput,
      onEnd: () => {
        this.log('stream ended %s %s', type, id)

        if (type === 'initiator') {
          this.registryInitiatorStreams.delete(id)
        } else {
          this.registryRecipientStreams.delete(id)
        }

        if (this.options.onStreamEnd != null) {
          this.options.onStreamEnd(muxedStream)
        }
      }
    })

    return muxedStream
  }

  close (err?: Error): void {
    if (this.closeController.signal.aborted) return
    this.log('closing muxed streams')

    if (err == null) {
      this.streams.forEach(s => {
        s.close()
      })
    } else {
      this.streams.forEach(s => {
        s.abort(err)
      })
    }
    this.closeController.abort()
    this.input.end(err)
  }
}

class MockMuxerFactory implements StreamMuxerFactory {
  public protocol: string = '/mock-muxer/1.0.0'

  createStreamMuxer (init?: StreamMuxerInit): StreamMuxer {
    const mockMuxer = new MockMuxer(init)

    void Promise.resolve().then(async () => {
      void pipe(
        mockMuxer.streamInput,
        ndjson.stringify,
        (source) => map(source, str => new Uint8ArrayList(uint8ArrayFromString(str))),
        async (source) => {
          for await (const buf of source) {
            mockMuxer.input.push(buf.subarray())
          }
        }
      )
    })

    return mockMuxer
  }
}

export function mockMuxer (): MockMuxerFactory {
  return new MockMuxerFactory()
}
