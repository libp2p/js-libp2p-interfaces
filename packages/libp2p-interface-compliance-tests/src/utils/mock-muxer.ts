import { pair } from 'it-pair'
import { pushable } from 'it-pushable'
import drain from 'it-drain'
import type { Stream } from '@libp2p/interfaces/connection'
import type { Muxer } from '@libp2p/interfaces/stream-muxer'

export function mockMuxer (): Muxer {
  let streamId = 0
  let streams: Stream[] = []
  const p = pushable<Uint8Array>()

  const muxer: Muxer = {
    source: p,
    sink: async (source) => {
      await drain(source)
    },
    get streams () {
      return streams
    },
    newStream: (name?: string) => {
      const echo = pair<Uint8Array>()

      const id = `${streamId++}`
      const stream: Stream = {
        id,
        sink: echo.sink,
        source: echo.source,
        close: () => {
          streams = streams.filter(s => s !== stream)
        },
        abort: () => {},
        reset: () => {},
        timeline: {
          open: 0
        }
      }

      return stream
    }
  }

  return muxer
}
