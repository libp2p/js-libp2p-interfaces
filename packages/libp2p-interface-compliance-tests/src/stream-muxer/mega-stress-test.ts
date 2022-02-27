import spawn from './spawner.js'
import type { TestSetup } from '../index.js'
import type { Muxer, MuxerInit } from '@libp2p/interfaces/stream-muxer'

export default (common: TestSetup<Muxer, MuxerInit>) => {
  const createMuxer = async (init?: MuxerInit) => await common.setup(init)

  describe.skip('mega stress test', function () {
    it('10,000 streams with 10,000 msg', async () => await spawn(createMuxer, 10000, 10000, 5000))
  })
}
