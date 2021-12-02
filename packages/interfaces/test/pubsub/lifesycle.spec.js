/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')

const PubsubBaseImpl = require('../../src/pubsub')
const {
  createPeerId,
  createMockRegistrar,
  PubsubImplementation,
  ConnectionPair
} = require('./utils')

describe('pubsub base lifecycle', () => {
  describe('should start and stop properly', () => {
    let pubsub
    let sinonMockRegistrar

    beforeEach(async () => {
      const peerId = await createPeerId()
      sinonMockRegistrar = {
        handle: sinon.stub(),
        register: sinon.stub(),
        unregister: sinon.stub()
      }

      pubsub = new PubsubBaseImpl({
        debugName: 'pubsub',
        multicodecs: '/pubsub/1.0.0',
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
      expect(sinonMockRegistrar.handle.calledOnce).to.be.true()
      expect(sinonMockRegistrar.register.calledOnce).to.be.true()

      await pubsub.stop()
      expect(sinonMockRegistrar.unregister.calledOnce).to.be.true()
    })

    it('starting should not throw if already started', async () => {
      await pubsub.start()
      await pubsub.start()
      expect(sinonMockRegistrar.handle.calledOnce).to.be.true()
      expect(sinonMockRegistrar.register.calledOnce).to.be.true()

      await pubsub.stop()
      expect(sinonMockRegistrar.unregister.calledOnce).to.be.true()
    })

    it('stopping should not throw if not started', async () => {
      await pubsub.stop()
      expect(sinonMockRegistrar.register.calledOnce).to.be.false()
      expect(sinonMockRegistrar.unregister.calledOnce).to.be.false()
    })
  })

  describe('should be able to register two nodes', () => {
    const protocol = '/pubsub/1.0.0'
    let pubsubA, pubsubB
    let peerIdA, peerIdB
    const registrarRecordA = {}
    const registrarRecordB = {}

    // mount pubsub
    beforeEach(async () => {
      peerIdA = await createPeerId()
      peerIdB = await createPeerId()

      pubsubA = new PubsubImplementation(protocol, {
        peerId: peerIdA,
        registrar: createMockRegistrar(registrarRecordA)
      })
      pubsubB = new PubsubImplementation(protocol, {
        peerId: peerIdB,
        registrar: createMockRegistrar(registrarRecordB)
      })
    })

    // start pubsub
    beforeEach(() => {
      pubsubA.start()
      pubsubB.start()

      expect(Object.keys(registrarRecordA)).to.have.lengthOf(1)
      expect(Object.keys(registrarRecordB)).to.have.lengthOf(1)
    })

    afterEach(() => {
      sinon.restore()

      return Promise.all([
        pubsubA.stop(),
        pubsubB.stop()
      ])
    })

    it('should handle onConnect as expected', async () => {
      const onConnectA = registrarRecordA[protocol].onConnect
      const handlerB = registrarRecordB[protocol].handler

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
      const onConnectA = registrarRecordA[protocol].onConnect
      const handlerB = registrarRecordB[protocol].handler

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

      sinon.spy(pubsubA, '_removePeer')

      sinon.spy(c2, 'newStream')

      await onConnectA(peerIdB, c2)
      expect(c2.newStream).to.have.property('callCount', 1)
      expect(pubsubA._removePeer).to.have.property('callCount', 0)

      // Verify the first stream was closed
      const { stream: firstStream } = await c0.newStream.returnValues[0]
      try {
        await firstStream.sink(['test'])
      } catch (/** @type {any} */ err) {
        expect(err).to.exist()
        return
      }
      expect.fail('original stream should have ended')
    })

    it('should handle newStream errors in onConnect', async () => {
      const onConnectA = registrarRecordA[protocol].onConnect
      const handlerB = registrarRecordB[protocol].handler

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
      const onConnectA = registrarRecordA[protocol].onConnect
      const onDisconnectA = registrarRecordA[protocol].onDisconnect
      const handlerB = registrarRecordB[protocol].handler
      const onDisconnectB = registrarRecordB[protocol].onDisconnect

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
      const onDisconnectA = registrarRecordA[protocol].onDisconnect

      expect(pubsubA.peers.size).to.be.eql(0)

      // Notice peers of disconnect
      onDisconnectA(peerIdB)

      expect(pubsubA.peers.size).to.be.eql(0)
    })
  })
})
