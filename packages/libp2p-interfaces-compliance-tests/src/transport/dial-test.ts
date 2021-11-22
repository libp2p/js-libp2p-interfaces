import { expect } from 'aegir/utils/chai.js'
import { isValidTick, mockUpgrader } from './utils/index.js'
// @ts-expect-error no types
import goodbye from 'it-goodbye'
import { collect } from 'streaming-iterables'
import { pipe } from 'it-pipe'
import AbortController from 'abort-controller'
import { AbortError } from 'libp2p-interfaces/transport/errors'
import sinon from 'sinon'
import type { TestSetup } from '../index.js'
import type { Transport, Listener } from 'libp2p-interfaces/transport'
import type { TransportTestFixtures, SetupArgs, Connector } from './index.js'
import type { Multiaddr } from 'multiaddr'

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
      listener = transport.createListener({}, (conn) => pipe(conn, conn))
      return await listener.listen(addrs[0])
    })

    afterEach(async () => {
      sinon.restore()
      return await listener.close()
    })

    it('simple', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')
      const conn = await transport.dial(addrs[0])

      const s = goodbye({ source: ['hey'], sink: collect })

      const result = await pipe(s, conn, s)

      expect(upgradeSpy.callCount).to.equal(1)
      // @ts-expect-error upgrader.upgradeOutbound returns a Connection, not Promise<Connection>
      expect(upgradeSpy.returned(conn)).to.equal(true)
      expect(result.length).to.equal(1)
      expect(result[0].toString()).to.equal('hey')
    })

    it('can close connections', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')
      const conn = await transport.dial(addrs[0])

      expect(upgradeSpy.callCount).to.equal(1)
      // @ts-expect-error upgrader.upgradeOutbound returns a Connection, not Promise<Connection>
      expect(upgradeSpy.returned(conn)).to.equal(true)
      await conn.close()
      expect(isValidTick(conn.stat.timeline.close)).to.equal(true)
    })

    it('to non existent listener', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')
      try {
        await transport.dial(addrs[1])
      } catch (_) {
        expect(upgradeSpy.callCount).to.equal(0)
        // Success: expected an error to be throw
        return
      }
      expect.fail('Did not throw error attempting to connect to non-existent listener')
    })

    it('abort before dialing throws AbortError', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')
      const controller = new AbortController()
      controller.abort()
      const socket = transport.dial(addrs[0], { signal: controller.signal })

      try {
        await socket
      } catch (err: any) {
        expect(upgradeSpy.callCount).to.equal(0)
        expect(err.code).to.eql(AbortError.code)
        expect(err.type).to.eql(AbortError.type)
        return
      }
      expect.fail('Did not throw error with code ' + AbortError.code)
    })

    it('abort while dialing throws AbortError', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeOutbound')
      // Add a delay to connect() so that we can abort while the dial is in
      // progress
      connector.delay(100)

      const controller = new AbortController()
      const socket = transport.dial(addrs[0], { signal: controller.signal })
      setTimeout(() => controller.abort(), 50)

      try {
        await socket
      } catch (err: any) {
        expect(upgradeSpy.callCount).to.equal(0)
        expect(err.code).to.eql(AbortError.code)
        expect(err.type).to.eql(AbortError.type)
        return
      } finally {
        connector.restore()
      }
      expect.fail('Did not throw error with code ' + AbortError.code)
    })

    it('abort while reading throws AbortError', async () => {
      // Add a delay to the response from the server
      async function * delayedResponse (source: AsyncIterable<Uint8Array>) {
        for await (const val of source) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          yield val
        }
      }
      const delayedListener = transport.createListener({}, (conn) => {
        void pipe(conn, delayedResponse, conn)
      })
      await delayedListener.listen(addrs[1])

      // Create an abort signal and dial the socket
      const controller = new AbortController()
      const socket = await transport.dial(addrs[1], { signal: controller.signal })

      try {
        // Set a timeout to abort before the server responds
        setTimeout(() => controller.abort(), 100)

        // An AbortError should be thrown before the pipe completes
        const s = goodbye({ source: ['hey'], sink: collect })
        await pipe(s, socket, s)
      } catch (err: any) {
        expect(err.code).to.eql(AbortError.code)
        expect(err.type).to.eql(AbortError.type)
        return
      } finally {
        await delayedListener.close()
      }
      expect.fail('Did not throw error with code ' + AbortError.code)
    })

    it('abort while writing does not throw AbortError', async () => {
      // Record values received by the listener
      const recorded: string[] = []
      async function * recorderTransform (source: AsyncIterable<string>) {
        for await (const val of source) {
          recorded.push(val)
          yield val
        }
      }
      const recordListener = transport.createListener({}, (conn) => {
        void pipe(conn, recorderTransform, conn)
      })
      await recordListener.listen(addrs[1])

      // Create an abort signal and dial the socket
      const controller = new AbortController()
      const socket = await transport.dial(addrs[1], { signal: controller.signal })

      // Set a timeout to abort before writing has completed
      setTimeout(() => controller.abort(), 100)

      try {
        // The pipe should write to the socket until aborted
        await pipe(
          async function * () {
            yield 'hey'
            await new Promise((resolve) => setTimeout(resolve, 200))
            yield 'there'
          },
          socket)
        expect(recorded.length).to.eql(1)
        expect(recorded[0].toString()).to.eql('hey')
      } finally {
        await recordListener.close()
      }
    })
  })
}
