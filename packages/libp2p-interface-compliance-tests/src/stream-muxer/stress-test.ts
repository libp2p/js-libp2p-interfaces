import spawn from './spawner'
import type { TestSetup } from '../index.js'
import type { Muxer, MuxerOptions } from '@libp2p/interfaces/stream-muxer'

export default (common: TestSetup<Muxer, MuxerOptions>) => {
  const createMuxer = async (opts?: MuxerOptions) => await common.setup(opts)

  describe('stress test', () => {
    it('1 stream with 1 msg', async () => await spawn(createMuxer, 1, 1))
    it('1 stream with 10 msg', async () => await spawn(createMuxer, 1, 10))
    it('1 stream with 100 msg', async () => await spawn(createMuxer, 1, 100))
    it('10 streams with 1 msg', async () => await spawn(createMuxer, 10, 1))
    it('10 streams with 10 msg', async () => await spawn(createMuxer, 10, 10))
    it('10 streams with 100 msg', async () => await spawn(createMuxer, 10, 100))
    it('100 streams with 1 msg', async () => await spawn(createMuxer, 100, 1))
    it('100 streams with 10 msg', async () => await spawn(createMuxer, 100, 10))
    it('100 streams with 100 msg', async () => await spawn(createMuxer, 100, 100))
    it('1000 streams with 1 msg', async () => await spawn(createMuxer, 1000, 1))
    it('1000 streams with 10 msg', async () => await spawn(createMuxer, 1000, 10))
    it('1000 streams with 100 msg', async function () {
      return await spawn(createMuxer, 1000, 100)
    })
  })
}
