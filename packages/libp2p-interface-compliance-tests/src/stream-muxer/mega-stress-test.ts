import spawn from './spawner.js'
import type { TestSetup } from '../index.js'
import type { StreamMuxer, StreamMuxerFactory, StreamMuxerInit } from '@libp2p/interfaces/stream-muxer'
import { Components } from '@libp2p/interfaces/components'

export default (common: TestSetup<StreamMuxerFactory>) => {
  const createMuxer = async (init?: StreamMuxerInit): Promise<StreamMuxer> => {
    const factory = await common.setup()
    return factory.createStreamMuxer(new Components(), init)
  }

  describe.skip('mega stress test', function () {
    it('10,000 streams with 10,000 msg', async () => await spawn(createMuxer, 10000, 10000, 5000))
  })
}
