import { expect } from 'aegir/utils/chai.js'
import { duplexPair } from 'it-pair/duplex'
import { pipe } from 'it-pipe'
import pLimit from 'p-limit'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import drain from 'it-drain'
import all from 'it-all'
import type { Muxer, MuxerOptions } from '@libp2p/interfaces/stream-muxer'

export default async (createMuxer: (options?: MuxerOptions) => Promise<Muxer>, nStreams: number, nMsg: number, limit?: number) => {
  const [dialerSocket, listenerSocket] = duplexPair<Uint8Array>()

  const msg = uint8ArrayFromString('simple msg')

  const listener = await createMuxer({
    onStream: async (stream) => {
      await pipe(
        stream,
        drain
      )

      void pipe([], stream)
    }
  })

  const dialer = await createMuxer()

  void pipe(listenerSocket, listener.newStream('/test/stream'), listenerSocket)
  void pipe(dialerSocket, dialer.newStream('/test/stream'), dialerSocket)

  const spawnStream = async () => {
    const stream = dialer.newStream()
    expect(stream).to.exist // eslint-disable-line

    const res = await pipe(
      (async function * () {
        for (let i = 0; i < nMsg; i++) {
          yield msg
        }
      }()),
      stream,
      async (source) => await all(source)
    )

    expect(res).to.be.eql([])
  }

  const limiter = pLimit(limit ?? Infinity)

  await Promise.all(
    Array.from(Array(nStreams), async () => await limiter(async () => await spawnStream()))
  )
}
