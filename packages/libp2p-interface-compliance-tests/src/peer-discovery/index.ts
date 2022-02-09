import { expect } from 'aegir/utils/chai.js'
import { Multiaddr } from '@multiformats/multiaddr'
import delay from 'delay'
import pDefer from 'p-defer'
import type { TestSetup } from '../index.js'
import type { PeerDiscovery } from '@libp2p/interfaces/peer-discovery'
import type { Startable } from '@libp2p/interfaces'

export default (common: TestSetup<PeerDiscovery & Startable>) => {
  describe('interface-peer-discovery compliance tests', () => {
    let discovery: PeerDiscovery & Startable

    beforeEach(async () => {
      discovery = await common.setup()
    })

    afterEach('ensure discovery was stopped', async () => {
      await discovery.stop()
      await common.teardown()
    })

    it('can start the service', async () => {
      await discovery.start()
    })

    it('can start and stop the service', async () => {
      await discovery.start()
      await discovery.stop()
    })

    it('should not fail to stop the service if it was not started', async () => {
      await discovery.stop()
    })

    it('should not fail to start the service if it is already started', async () => {
      await discovery.start()
      await discovery.start()
    })

    it('should emit a peer event after start', async () => {
      const defer = pDefer()
      await discovery.start()

      discovery.addEventListener('peer', (evt) => {
        const { id, multiaddrs } = evt.detail
        expect(id).to.exist()
        expect(id).to.have.property('type').that.is.oneOf(['RSA', 'Ed25519', 'secp256k1'])
        expect(multiaddrs).to.exist()

        multiaddrs.forEach((m) => expect(Multiaddr.isMultiaddr(m)).to.eql(true))

        defer.resolve()
      })

      await defer.promise
    })

    it('should not receive a peer event before start', async () => {
      discovery.addEventListener('peer', () => {
        throw new Error('should not receive a peer event before start')
      })

      await delay(2000)
    })

    it('should not receive a peer event after stop', async () => {
      const deferStart = pDefer()

      await discovery.start()

      discovery.addEventListener('peer', () => {
        deferStart.resolve()
      })

      await deferStart.promise
      await discovery.stop()

      discovery.addEventListener('peer', () => {
        throw new Error('should not receive a peer event after stop')
      })

      await delay(2000)
    })
  })
}
