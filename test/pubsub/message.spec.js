/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')

const PubsubBaseImpl = require('../../src/pubsub')
const { SignaturePolicy } = require('../../src/pubsub/signature-policy')
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
      data: 'hello',
      topicIDs: ['test-topic']
    }

    const signedMessage = await pubsub._buildMessage(message)
    expect(pubsub.validate(signedMessage)).to.not.be.rejected()
  })

  it('validate with StrictNoSign will reject a message with from, signature, key, seqno present', async () => {
    const message = {
      receivedFrom: peerId.id,
      data: 'hello',
      topicIDs: ['test-topic']
    }

    sinon.stub(pubsub, 'globalSignaturePolicy').value(SignaturePolicy.StrictSign)

    const signedMessage = await pubsub._buildMessage(message)

    sinon.stub(pubsub, 'globalSignaturePolicy').value(SignaturePolicy.StrictNoSign)
    await expect(pubsub.validate(signedMessage)).to.be.rejected()
    delete signedMessage.from
    await expect(pubsub.validate(signedMessage)).to.be.rejected()
    delete signedMessage.signature
    await expect(pubsub.validate(signedMessage)).to.be.rejected()
    delete signedMessage.key
    await expect(pubsub.validate(signedMessage)).to.be.rejected()
    delete signedMessage.seqno
    await expect(pubsub.validate(signedMessage)).to.not.be.rejected()
  })

  it('validate with StrictNoSign will validate a message without a signature, key, and seqno', async () => {
    const message = {
      receivedFrom: peerId.id,
      data: 'hello',
      topicIDs: ['test-topic']
    }

    sinon.stub(pubsub, 'globalSignaturePolicy').value(SignaturePolicy.StrictNoSign)

    const signedMessage = await pubsub._buildMessage(message)
    expect(pubsub.validate(signedMessage)).to.not.be.rejected()
  })

  it('validate with StrictSign requires a signature', async () => {
    const message = {
      receivedFrom: peerId.id,
      data: 'hello',
      topicIDs: ['test-topic']
    }

    await expect(pubsub.validate(message)).to.be.rejectedWith(Error, 'Signing required and no signature was present')
  })
})
