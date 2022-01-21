/* eslint-env mocha */
import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { PubsubBaseProtocol } from '../src/index.js'
import {
  createPeerId,
  mockRegistrar
} from './utils/index.js'
import type { PeerId } from 'libp2p-interfaces/peer-id'
import type { Message } from 'libp2p-interfaces/pubsub'

class PubsubProtocol extends PubsubBaseProtocol {
  async _publish (message: Message): Promise<{recipients: number}> {
    throw new Error('Method not implemented')
  }

  async buildMessage (message: Message) {
    return await this._buildMessage(message)
  }
}

describe('pubsub base messages', () => {
  let peerId: PeerId
  let pubsub: PubsubProtocol

  before(async () => {
    peerId = await createPeerId()
    pubsub = new PubsubProtocol({
      debugName: 'pubsub',
      multicodecs: ['/pubsub/1.0.0'],
      libp2p: {
        peerId: peerId,
        registrar: mockRegistrar
      }
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('_buildMessage normalizes and signs messages', async () => {
    const message = {
      from: peerId.toBytes(),
      receivedFrom: peerId.toB58String(),
      data: uint8ArrayFromString('hello'),
      topicIDs: ['test-topic']
    }

    const signedMessage = await pubsub.buildMessage(message)

    await expect(pubsub.validate(signedMessage)).to.eventually.not.be.rejected()
  })

  it('validate with StrictNoSign will reject a message with from, signature, key, seqno present', async () => {
    const message = {
      from: peerId.toBytes(),
      receivedFrom: peerId.toB58String(),
      data: uint8ArrayFromString('hello'),
      topicIDs: ['test-topic']
    }

    sinon.stub(pubsub, 'globalSignaturePolicy').value('StrictSign')

    const signedMessage = await pubsub.buildMessage(message)

    sinon.stub(pubsub, 'globalSignaturePolicy').value('StrictNoSign')
    await expect(pubsub.validate(signedMessage)).to.eventually.be.rejected()
    delete signedMessage.from
    await expect(pubsub.validate(signedMessage)).to.eventually.be.rejected()
    delete signedMessage.signature
    await expect(pubsub.validate(signedMessage)).to.eventually.be.rejected()
    delete signedMessage.key
    await expect(pubsub.validate(signedMessage)).to.eventually.be.rejected()
    delete signedMessage.seqno
    await expect(pubsub.validate(signedMessage)).to.eventually.not.be.rejected()
  })

  it('validate with StrictNoSign will validate a message without a signature, key, and seqno', async () => {
    const message = {
      from: peerId.toBytes(),
      receivedFrom: peerId.toB58String(),
      data: uint8ArrayFromString('hello'),
      topicIDs: ['test-topic']
    }

    sinon.stub(pubsub, 'globalSignaturePolicy').value('StrictNoSign')

    const signedMessage = await pubsub.buildMessage(message)
    await expect(pubsub.validate(signedMessage)).to.eventually.not.be.rejected()
  })

  it('validate with StrictSign requires a signature', async () => {
    const message = {
      from: peerId.toBytes(),
      receivedFrom: peerId.toB58String(),
      data: uint8ArrayFromString('hello'),
      topicIDs: ['test-topic']
    }

    await expect(pubsub.validate(message)).to.be.rejectedWith(Error, 'Signing required and no signature was present')
  })
})
