import spawn from './spawner'
import type { TestSetup } from '../index.js'
import type { Muxer, MuxerOptions } from 'libp2p-interfaces/stream-muxer'

export default (common: TestSetup<Muxer, MuxerOptions>) => {
  const createMuxer = async (opts?: MuxerOptions) => await common.setup(opts)

  describe.skip('mega stress test', function () {
    it('10,000 streams with 10,000 msg', async () => await spawn(createMuxer, 10000, 10000, 5000))
  })
}
