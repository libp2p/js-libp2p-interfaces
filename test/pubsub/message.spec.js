/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')

const PubsubBaseImpl = require('../../src/pubsub')
const { randomSeqno } = require('../../src/pubsub/utils')
const {
  createPeerId,
  mockRegistrar
} = require('./utils')

describe('pubsub base messages', () => {
  let peerId
  let pubsub

  before(async () => {
    peerId = await createPeerId()
    pubsub = new PubsubBaseImpl({
      debugName: 'pubsub',
      multicodecs: '/pubsub/1.0.0',
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
      receivedFrom: peerId.id,
      from: peerId.id,
      data: 'hello',
      seqno: randomSeqno(),
      topicIDs: ['test-topic']
    }

    const signedMessage = await pubsub._buildMessage(message)
    expect(pubsub.validate(signedMessage)).to.not.be.rejected()
  })

  it('validate with strict signing off will validate a present signature', async () => {
    const message = {
      receivedFrom: peerId.id,
      from: peerId.id,
      data: 'hello',
      seqno: randomSeqno(),
      topicIDs: ['test-topic']
    }

    sinon.stub(pubsub, 'strictSigning').value(false)

    const signedMessage = await pubsub._buildMessage(message)
    expect(pubsub.validate(signedMessage)).to.not.be.rejected()
  })

  it('validate with strict signing requires a signature', async () => {
    const message = {
      receivedFrom: peerId.id,
      from: peerId.id,
      data: 'hello',
      seqno: randomSeqno(),
      topicIDs: ['test-topic']
    }

    await expect(pubsub.validate(message)).to.be.rejectedWith(Error, 'Signing required and no signature was present')
  })
})
