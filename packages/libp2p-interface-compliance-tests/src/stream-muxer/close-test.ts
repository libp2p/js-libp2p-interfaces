/* eslint max-nested-callbacks: ["error", 8] */
import { pipe } from 'it-pipe'
import { duplexPair } from 'it-pair/duplex'
import { abortableSource, abortableDuplex } from 'abortable-iterator'
import AbortController from 'abort-controller'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import drain from 'it-drain'
import type { TestSetup } from '../index.js'
import type { Muxer, MuxerOptions } from '@libp2p/interfaces/stream-muxer'
import type { Connection } from '@libp2p/interfaces/connection'

async function pause (ms: number) {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

function randomBuffer () {
  return uint8ArrayFromString(Math.random().toString())
}

const infiniteRandom = {
  [Symbol.asyncIterator]: async function * () {
    while (true) {
      yield randomBuffer()
      await pause(10)
    }
  }
}

export default (common: TestSetup<Muxer, MuxerOptions>) => {
  describe('close', () => {
    it('closing underlying socket closes streams (tcp)', async () => {
      const mockConn = (muxer: Muxer): Connection => {
        // @ts-expect-error not all Connection methods are implemented
        const connection: Connection = {
          newStream: async (multicodecs) => {
            return {
              protocol: multicodecs[0],
              stream: muxer.newStream(`${multicodecs[0]}`)
            }
          }
        }

        return connection
      }

      const mockUpgrade = async (maConn: any) => {
        const muxer = await common.setup({
          onStream: (stream) => {
            void pipe(stream, stream)
          }
        })
        pipe(maConn, muxer.newStream('/test/stream'), maConn)
        return mockConn(muxer)
      }

      const [local, remote] = duplexPair<Uint8Array>()
      const controller = new AbortController()
      const abortableRemote = abortableDuplex(remote, controller.signal, {
        returnOnAbort: true
      })

      await mockUpgrade(abortableRemote)
      const dialerConn = await mockUpgrade(local)

      const s1 = await dialerConn.newStream([''])
      const s2 = await dialerConn.newStream([''])

      // close the remote in a bit
      setTimeout(() => controller.abort(), 50)

      const s1Result = pipe(infiniteRandom, s1.stream, drain)
      const s2Result = pipe(infiniteRandom, s2.stream, drain)

      // test is complete when all muxed streams have closed
      await s1Result
      await s2Result
    })

    it('closing one of the muxed streams doesn\'t close others', async () => {
      const p = duplexPair<Uint8Array>()
      const dialer = await common.setup()

      // Listener is echo server :)
      const listener = await common.setup({
        onStream: async (stream) => await pipe(stream, stream)
      })

      void pipe(p[0], dialer.newStream('/test/stream'), p[0])
      void pipe(p[1], listener.newStream('/test/stream'), p[1])

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
      await pause(50)
      await pipe([randomBuffer()], stream, drain)
      closed = true

      // Abort all the other streams later
      await pause(50)
      controllers.forEach(c => c.abort())

      // These should now all resolve without error
      await Promise.all(streamResults)
    })
  })
}
