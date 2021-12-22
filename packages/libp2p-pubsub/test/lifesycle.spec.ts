import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { PubsubBaseProtocol } from '../src/index.js'
import {
  createPeerId,
  createMockRegistrar,
  PubsubImplementation,
  ConnectionPair
} from './utils/index.js'
import type { PeerId } from 'libp2p-interfaces/peer-id'
import type { Registrar } from 'libp2p-interfaces/registrar'
import type { Message } from 'libp2p-interfaces/pubsub'

class PubsubProtocol extends PubsubBaseProtocol {
  async _publish (message: Message): Promise<Set<string> | undefined> {
    throw new Error('Method not implemented.')
  }
}

describe('pubsub base lifecycle', () => {
  describe('should start and stop properly', () => {
    let pubsub: PubsubProtocol
    let sinonMockRegistrar: Partial<Registrar>

    beforeEach(async () => {
      const peerId = await createPeerId()
      sinonMockRegistrar = {
        handle: sinon.stub(),
        register: sinon.stub().returns(`id-${Math.random()}`),
        unregister: sinon.stub()
      }

      pubsub = new PubsubProtocol({
        debugName: 'pubsub',
        multicodecs: ['/pubsub/1.0.0'],
        libp2p: {
          peerId: peerId,
          registrar: sinonMockRegistrar
        }
      })

      expect(pubsub.peers.size).to.be.eql(0)
    })

    afterEach(() => {
      sinon.restore()
    })

    it('should be able to start and stop', async () => {
      await pubsub.start()
      expect(sinonMockRegistrar.handle).to.have.property('calledOnce', true)
      expect(sinonMockRegistrar.register).to.have.property('calledOnce', true)

      await pubsub.stop()
      expect(sinonMockRegistrar.unregister).to.have.property('calledOnce', true)
    })

    it('starting should not throw if already started', async () => {
      await pubsub.start()
      await pubsub.start()
      expect(sinonMockRegistrar.handle).to.have.property('calledOnce', true)
      expect(sinonMockRegistrar.register).to.have.property('calledOnce', true)

      await pubsub.stop()
      expect(sinonMockRegistrar.unregister).to.have.property('calledOnce', true)
    })

    it('stopping should not throw if not started', async () => {
      await pubsub.stop()
      expect(sinonMockRegistrar.register).to.have.property('calledOnce', false)
      expect(sinonMockRegistrar.unregister).to.have.property('calledOnce', false)
    })
  })

  describe('should be able to register two nodes', () => {
    const protocol = '/pubsub/1.0.0'
    let pubsubA: PubsubImplementation, pubsubB: PubsubImplementation
    let peerIdA: PeerId, peerIdB: PeerId
    const registrarRecordA = new Map()
    const registrarRecordB = new Map()

    // mount pubsub
    beforeEach(async () => {
      peerIdA = await createPeerId()
      peerIdB = await createPeerId()

      pubsubA = new PubsubImplementation({
        multicodecs: [protocol],
        libp2p: {
          peerId: peerIdA,
          registrar: createMockRegistrar(registrarRecordA)
        }
      })
      pubsubB = new PubsubImplementation({
        multicodecs: [protocol],
        libp2p: {
          peerId: peerIdB,
          registrar: createMockRegistrar(registrarRecordB)
        }
      })
    })

    // start pubsub
    beforeEach(() => {
      pubsubA.start()
      pubsubB.start()

      expect(registrarRecordA).to.have.lengthOf(1)
      expect(registrarRecordB).to.have.lengthOf(1)
    })

    afterEach(async () => {
      sinon.restore()

      return await Promise.all([
        pubsubA.stop(),
        pubsubB.stop()
      ])
    })

    it('should handle onConnect as expected', async () => {
      const onConnectA = registrarRecordA.get(protocol).onConnect
      const handlerB = registrarRecordB.get(protocol).handler

      // Notice peers of connection
      const [c0, c1] = ConnectionPair()

      await onConnectA(peerIdB, c0)
      await handlerB({
        protocol,
        stream: c1.stream,
        connection: {
          remotePeer: peerIdA
        }
      })

      expect(pubsubA.peers.size).to.be.eql(1)
      expect(pubsubB.peers.size).to.be.eql(1)
    })

    it('should use the latest connection if onConnect is called more than once', async () => {
      const onConnectA = registrarRecordA.get(protocol).onConnect
      const handlerB = registrarRecordB.get(protocol).handler

      // Notice peers of connection
      const [c0, c1] = ConnectionPair()
      const [c2] = ConnectionPair()

      sinon.spy(c0, 'newStream')

      await onConnectA(peerIdB, c0)
      await handlerB({
        protocol,
        stream: c1.stream,
        connection: {
          remotePeer: peerIdA
        }
      })
      expect(c0.newStream).to.have.property('callCount', 1)

      // @ts-expect-error _removePeer is a protected method
      sinon.spy(pubsubA, '_removePeer')

      sinon.spy(c2, 'newStream')

      await onConnectA(peerIdB, c2)
      expect(c2.newStream).to.have.property('callCount', 1)

      // @ts-expect-error _removePeer is a protected method
      expect(pubsubA._removePeer).to.have.property('callCount', 0)

      // Verify the first stream was closed
      // @ts-expect-error .returnValues is a sinon property
      const { stream: firstStream } = await c0.newStream.returnValues[0]
      try {
        await firstStream.sink(['test'])
      } catch (err: any) {
        expect(err).to.exist()
        return
      }
      expect.fail('original stream should have ended')
    })

    it('should handle newStream errors in onConnect', async () => {
      const onConnectA = registrarRecordA.get(protocol).onConnect
      const handlerB = registrarRecordB.get(protocol).handler

      // Notice peers of connection
      const [c0, c1] = ConnectionPair()
      const error = new Error('new stream error')
      sinon.stub(c0, 'newStream').throws(error)

      await onConnectA(peerIdB, c0)
      await handlerB({
        protocol,
        stream: c1.stream,
        connection: {
          remotePeer: peerIdA
        }
      })

      expect(c0.newStream).to.have.property('callCount', 1)
    })

    it('should handle onDisconnect as expected', async () => {
      const onConnectA = registrarRecordA.get(protocol).onConnect
      const onDisconnectA = registrarRecordA.get(protocol).onDisconnect
      const handlerB = registrarRecordB.get(protocol).handler
      const onDisconnectB = registrarRecordB.get(protocol).onDisconnect

      // Notice peers of connection
      const [c0, c1] = ConnectionPair()

      await onConnectA(peerIdB, c0)
      await handlerB({
        protocol,
        stream: c1.stream,
        connection: {
          remotePeer: peerIdA
        }
      })

      // Notice peers of disconnect
      onDisconnectA(peerIdB)
      onDisconnectB(peerIdA)

      expect(pubsubA.peers.size).to.be.eql(0)
      expect(pubsubB.peers.size).to.be.eql(0)
    })

    it('should handle onDisconnect for unknown peers', () => {
      const onDisconnectA = registrarRecordA.get(protocol).onDisconnect

      expect(pubsubA.peers.size).to.be.eql(0)

      // Notice peers of disconnect
      onDisconnectA(peerIdB)

      expect(pubsubA.peers.size).to.be.eql(0)
    })
  })
})
