import { Pushable, pushable } from 'it-pushable'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { abortableSource } from 'abortable-iterator'
import type { Stream } from '@libp2p/interfaces/connection'
import type { Muxer, MuxerOptions } from '@libp2p/interfaces/stream-muxer'
import type { Source } from 'it-stream-types'

interface DataMessage {
  id: string
  type: 'data'
  chunk: string
}

interface ResetMessage {
  id: string
  type: 'reset'
}

interface CloseMessage {
  id: string
  type: 'close'
}

type StreamMessage = DataMessage | ResetMessage | CloseMessage

class MuxedStream {
  public id: string
  public input: Pushable<Uint8Array>
  public stream: Stream

  private sourceClosed: boolean
  private sinkClosed: boolean
  private readonly controller: AbortController
  private readonly onEnd: () => void

  constructor (opts: { id: string, push: Pushable<StreamMessage>, onEnd: () => void }) {
    const { id, push, onEnd } = opts

    this.id = id
    this.controller = new AbortController()
    this.onEnd = onEnd
    this.sourceClosed = false
    this.sinkClosed = false
    this.input = pushable<Uint8Array>({
      onEnd: () => {
        this.sourceClosed = true
        this.maybeEndStream()
      }
    })
    this.stream = {
      id,
      sink: async (source) => {
        source = abortableSource(source, this.controller.signal)

        try {
          for await (const chunk of source) {
            const dataMsg: DataMessage = {
              id,
              type: 'data',
              chunk: uint8ArrayToString(chunk, 'base64')
            }

            push.push(dataMsg)
          }

          const closeMsg: CloseMessage = {
            id,
            type: 'close'
          }

          push.push(closeMsg)
        } catch (err) {
          if (!this.controller.signal.aborted) {
            throw err
          }
        }

        this.closeSink()
      },
      source: this.input,
      close: () => {
        const closeMsg: CloseMessage = {
          id,
          type: 'close'
        }
        push.push(closeMsg)

        this.closeSink()
        this.closeSource()
      },
      abort: () => {
        const resetMsg: ResetMessage = {
          id,
          type: 'reset'
        }
        push.push(resetMsg)

        this.closeSink()
        this.closeSource()
      },
      reset: () => {
        const resetMsg: ResetMessage = {
          id,
          type: 'reset'
        }
        push.push(resetMsg)

        this.closeSink()
        this.closeSource()
      },
      timeline: {
        open: Date.now()
      }
    }
  }

  maybeEndStream () {
    if (this.stream.timeline.close != null) {
      // already ended
      return
    }

    if (this.sinkClosed && this.sourceClosed) {
      this.stream.timeline.close = Date.now()
      this.onEnd()
    }
  }

  closeSource () {
    this.sourceClosed = true
    this.input.end()
  }

  closeSink () {
    this.sinkClosed = true
    this.controller.abort()
    this.maybeEndStream()
  }
}

export function mockMuxer (options?: MuxerOptions): Muxer {
  let streamId = 0
  const streams = new Map<string, MuxedStream>()

  // process incoming messages from the other muxer
  const muxerSource = pushable<Uint8Array>({
    onEnd: () => {
      for (const muxedStream of streams.values()) {
        muxedStream.stream.close()
      }
    }
  })

  // receives messages from all of the muxed streams
  const push = pushable<StreamMessage>()
  void Promise.resolve().then(async () => {
    for await (const message of push) {
      if (message.type === 'data') {
        muxerSource.push(uint8ArrayFromString(JSON.stringify({
          id: message.id,
          type: message.type,
          chunk: message.chunk
        })))
      } else {
        muxerSource.push(uint8ArrayFromString(JSON.stringify({
          id: message.id,
          type: message.type
        })))
      }
    }
  })

  function createStream (name?: string): MuxedStream {
    const id = name ?? `${streamId++}`

    const muxedStream: MuxedStream = new MuxedStream({
      id,
      push,
      onEnd: () => {
        streams.delete(id)

        if (options?.onStreamEnd != null) {
          options?.onStreamEnd(muxedStream.stream)
        }
      }
    })

    return muxedStream
  }

  const muxer: Muxer = {
    // receive incoming messages
    async sink (source: Source<Uint8Array>) {
      for await (const buf of source) {
        const message: StreamMessage = JSON.parse(uint8ArrayToString(buf))
        let muxedStream = streams.get(message.id)

        if (muxedStream == null) {
          muxedStream = createStream(message.id)
          streams.set(muxedStream.stream.id, muxedStream)

          if (options?.onStream != null) {
            options.onStream(muxedStream.stream)
          }
        }

        if (message.type === 'data') {
          muxedStream.input.push(uint8ArrayFromString(message.chunk, 'base64'))
        } else if (message.type === 'reset') {
          muxedStream.closeSink()
          muxedStream.closeSource()
        } else if (message.type === 'close') {
          muxedStream.closeSource()
        }
      }

      for (const muxedStream of streams.values()) {
        muxedStream.stream.close()
      }

      muxerSource.end()
    },

    source: muxerSource,

    get streams () {
      return Array.from(streams.values()).map(({ stream }) => stream)
    },

    newStream (name?: string) {
      const storedStream = createStream(name)

      streams.set(storedStream.stream.id, storedStream)

      if (options?.onStream != null) {
        options.onStream(storedStream.stream)
      }

      return storedStream.stream
    }
  }

  return muxer
}
