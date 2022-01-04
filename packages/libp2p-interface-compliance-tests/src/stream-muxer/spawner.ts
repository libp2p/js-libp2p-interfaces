import { expect } from 'aegir/utils/chai.js'
// @ts-expect-error no types
import pair from 'it-pair/duplex.js'
import { pipe } from 'it-pipe'
import pLimit from 'p-limit'
import { collect, consume } from 'streaming-iterables'
import type { Muxer, MuxerOptions } from '@libp2p/interfaces/stream-muxer'

export default async (createMuxer: (options?: MuxerOptions) => Promise<Muxer>, nStreams: number, nMsg: number, limit?: number) => {
  const [dialerSocket, listenerSocket] = pair()

  const msg = 'simple msg'

  const listener = await createMuxer({
    onStream: async (stream) => {
      await pipe(
        stream,
        consume
      )

      pipe([], stream)
    }
  })

  const dialer = await createMuxer()

  pipe(listenerSocket, listener, listenerSocket)
  pipe(dialerSocket, dialer, dialerSocket)

  const spawnStream = async () => {
    const stream = dialer.newStream()
    expect(stream).to.exist // eslint-disable-line

    const res = await pipe(
      (function * () {
        for (let i = 0; i < nMsg; i++) {
          yield new Promise(resolve => resolve(msg))
        }
      })(),
      stream,
      collect
    )

    expect(res).to.be.eql([])
  }

  const limiter = pLimit(limit ?? Infinity)

  await Promise.all(
    Array.from(Array(nStreams), async () => await limiter(async () => await spawnStream()))
  )
}
