import { expect } from 'aegir/utils/chai.js'
import { isValidTick, mockUpgrader } from './utils/index.js'
import { goodbye } from 'it-goodbye'
import all from 'it-all'
import { pipe } from 'it-pipe'
import AbortController from 'abort-controller'
import { AbortError } from '@libp2p/interfaces/errors'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { Transport, Listener } from '@libp2p/interfaces/transport'
import type { TransportTestFixtures, SetupArgs, Connector } from './index.js'
import type { Multiaddr } from '@multiformats/multiaddr'

export default (common: TestSetup<TransportTestFixtures, SetupArgs>) => {
  describe('dial', () => {
    const upgrader = mockUpgrader()
    let addrs: Multiaddr[]
    let transport: Transport<any, any>
    let connector: Connector
    let listener: Listener

    before(async () => {
      ({ addrs, transport, connector } = await common.setup({ upgrader }))
    })

    after(async () => {
      await common.teardown()
    })

    beforeEach(async () => {
      listener = transport.createListener({})
      return await listener.listen(addrs[0])
    })

    afterEach(async () => {
      sinon.restore()
      connector.restore()
      return await listener.close()
    })

    it('simple', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')
      const conn = await transport.dial(addrs[0])
      const { stream } = await conn.newStream(['/hello'])
      const s = goodbye({ source: [uint8ArrayFromString('hey')], sink: async (source) => await all(source) })

      const result = await pipe(s, stream, s)

      expect(upgradeSpy.callCount).to.equal(1)
      await expect(upgradeSpy.getCall(0).returnValue).to.eventually.equal(conn)
      expect(result.length).to.equal(1)
      expect(result[0].toString()).to.equal('hey')
      await conn.close()
    })

    it('can close connections', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')
      const conn = await transport.dial(addrs[0])

      expect(upgradeSpy.callCount).to.equal(1)
      await expect(upgradeSpy.getCall(0).returnValue).to.eventually.equal(conn)
      await conn.close()
      expect(isValidTick(conn.stat.timeline.close)).to.equal(true)
    })

    it('to non existent listener', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')

      await expect(transport.dial(addrs[1])).to.eventually.be.rejected()
      expect(upgradeSpy.callCount).to.equal(0)
    })

    it('abort before dialing throws AbortError', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')
      const controller = new AbortController()
      controller.abort()
      const conn = transport.dial(addrs[0], { signal: controller.signal })

      await expect(conn).to.eventually.be.rejected().with.property('code', AbortError.code)
      expect(upgradeSpy.callCount).to.equal(0)
    })

    it('abort while dialing throws AbortError', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')
      // Add a delay to connect() so that we can abort while the dial is in
      // progress
      connector.delay(100)

      const controller = new AbortController()
      const conn = transport.dial(addrs[0], { signal: controller.signal })
      setTimeout(() => controller.abort(), 50)

      await expect(conn).to.eventually.be.rejected().with.property('code', AbortError.code)
      expect(upgradeSpy.callCount).to.equal(0)
    })
  })
}
