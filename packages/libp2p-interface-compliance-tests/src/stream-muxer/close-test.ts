/* eslint max-nested-callbacks: ["error", 8] */
import { pipe } from 'it-pipe'
import { duplexPair } from 'it-pair/duplex'
import { abortableSource } from 'abortable-iterator'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import drain from 'it-drain'
import { expect } from 'aegir/utils/chai.js'
import delay from 'delay'
import type { TestSetup } from '../index.js'
import type { Muxer, MuxerOptions } from '@libp2p/interfaces/stream-muxer'

function randomBuffer () {
  return uint8ArrayFromString(Math.random().toString())
}

const infiniteRandom = {
  [Symbol.asyncIterator]: async function * () {
    while (true) {
      yield randomBuffer()
      await delay(50)
    }
  }
}

export default (common: TestSetup<Muxer, MuxerOptions>) => {
  describe('close', () => {
    it('closing underlying socket closes streams', async () => {
      let openedStreams = 0
      const expectedStreams = 5
      const dialer = await common.setup()

      // Listener is echo server :)
      const listener = await common.setup({
        onIncomingStream: (stream) => {
          openedStreams++
          void pipe(stream, stream)
        }
      })

      const p = duplexPair<Uint8Array>()
      void pipe(p[0], dialer, p[0])
      void pipe(p[1], listener, p[1])

      const streams = Array(expectedStreams).fill(0).map(() => dialer.newStream())

      void Promise.all(
        streams.map(async stream => {
          return await pipe(
            infiniteRandom,
            stream,
            drain
          )
        })
      )

      expect(dialer.streams).to.have.lengthOf(expectedStreams)

      // Pause, and then send some data and close the dialer
      await delay(50)
      await pipe([randomBuffer()], dialer, drain)

      expect(openedStreams).to.have.equal(expectedStreams)
      expect(dialer.streams).to.have.lengthOf(0)
    })

    it('closing one of the muxed streams doesn\'t close others', async () => {
      const p = duplexPair<Uint8Array>()
      const dialer = await common.setup()

      // Listener is echo server :)
      const listener = await common.setup({
        onIncomingStream: (stream) => {
          void pipe(stream, stream)
        }
      })

      void pipe(p[0], dialer, p[0])
      void pipe(p[1], listener, p[1])

      const stream = dialer.newStream()
      const streams = Array.from(Array(5), () => dialer.newStream())
      let closed = false
      const controllers: AbortController[] = []

      const streamResults = streams.map(async stream => {
        const controller = new AbortController()
        controllers.push(controller)

        try {
          const abortableRand = abortableSource(infiniteRandom, controller.signal, { abortCode: 'ERR_TEST_ABORT' })
          await pipe(abortableRand, stream, drain)
        } catch (err: any) {
          if (err.code !== 'ERR_TEST_ABORT') throw err
        }

        if (!closed) throw new Error('stream should not have ended yet!')
      })

      // Pause, and then send some data and close the first stream
      await delay(50)
      await pipe([randomBuffer()], stream, drain)
      closed = true

      // Abort all the other streams later
      await delay(50)
      controllers.forEach(c => c.abort())

      // These should now all resolve without error
      await Promise.all(streamResults)
    })
  })
}
