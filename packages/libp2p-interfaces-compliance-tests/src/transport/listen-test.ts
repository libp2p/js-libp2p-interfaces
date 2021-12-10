/* eslint max-nested-callbacks: ["error", 8] */
import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import pWaitFor from 'p-wait-for'
import { pipe } from 'it-pipe'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { isValidTick, mockUpgrader } from './utils/index.js'
import defer from 'p-defer'
import type { TestSetup } from '../index.js'
import type { Transport } from 'libp2p-interfaces/transport'
import type { TransportTestFixtures, SetupArgs } from './index.js'
import type { Multiaddr } from 'multiaddr'
import type { Connection } from 'libp2p-interfaces/connection'

export default (common: TestSetup<TransportTestFixtures, SetupArgs>) => {
  describe('listen', () => {
    const upgrader = mockUpgrader()
    let addrs: Multiaddr[]
    let transport: Transport<any, any>

    before(async () => {
      ({ transport, addrs } = await common.setup({ upgrader }))
    })

    after(async () => {
      await common.teardown()
    })

    afterEach(() => {
      sinon.restore()
    })

    it('simple', async () => {
      const listener = transport.createListener({}, (conn) => {})
      await listener.listen(addrs[0])
      await listener.close()
    })

    it('close listener with connections, through timeout', async () => {
      const upgradeSpy = sinon.spy(upgrader, 'upgradeInbound')
      const listenerConns: Connection[] = []

      const listener = transport.createListener({}, (conn) => {
        listenerConns.push(conn)
      })

      // Listen
      await listener.listen(addrs[0])

      // Create two connections to the listener
      const [conn1] = await Promise.all([
        transport.dial(addrs[0]),
        transport.dial(addrs[0])
      ])

      // Give the listener a chance to finish its upgrade
      await pWaitFor(() => listenerConns.length === 2)

      const { stream: stream1 } = await conn1.newStream(['/test/protocol'])

      // Wait for the data send and close to finish
      await Promise.all([
        pipe(
          [uint8ArrayFromString('Some data that is never handled')],
          stream1
        ),
        // Closer the listener (will take a couple of seconds to time out)
        listener.close()
      ])

      await stream1.close()
      await conn1.close()

      expect(isValidTick(conn1.stat.timeline.close)).to.equal(true)
      listenerConns.forEach(conn => {
        expect(isValidTick(conn.stat.timeline.close)).to.equal(true)
      })

      // 2 dials = 2 connections upgraded
      expect(upgradeSpy.callCount).to.equal(2)
    })

    it('should not handle connection if upgradeInbound throws', async () => {
      sinon.stub(upgrader, 'upgradeInbound').throws()

      const listener = transport.createListener(() => {
        throw new Error('should not handle the connection if upgradeInbound throws')
      })

      // Listen
      await listener.listen(addrs[0])

      // Create a connection to the listener
      const conn = await transport.dial(addrs[0])

      await pWaitFor(() => typeof conn.stat.timeline.close === 'number')
      await listener.close()
    })

    describe('events', () => {
      it('connection', async () => {
        const upgradeSpy = sinon.spy(upgrader, 'upgradeInbound')
        const listener = transport.createListener({})
        const deferred = defer()
        let conn

        listener.on('connection', (c) => {
          conn = c
          deferred.resolve()
        })

        void (async () => {
          await listener.listen(addrs[0])
          await transport.dial(addrs[0])
        })()

        await deferred.promise

        await expect(upgradeSpy.getCall(0).returnValue).to.eventually.equal(conn)
        expect(upgradeSpy.callCount).to.equal(1)
        await listener.close()
      })

      it('listening', (done) => {
        const listener = transport.createListener({})
        listener.on('listening', () => {
          listener.close().then(done, done)
        })
        void listener.listen(addrs[0])
      })

      it('error', (done) => {
        const listener = transport.createListener({})
        listener.on('error', (err) => {
          expect(err).to.exist()
          listener.close().then(done, done)
        })
        listener.emit('error', new Error('my err'))
      })

      it('close', (done) => {
        const listener = transport.createListener({})
        listener.on('close', done)

        void (async () => {
          await listener.listen(addrs[0])
          await listener.close()
        })()
      })
    })
  })
}
