/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 5] */
'use strict'

const { expect } = require('aegir/utils/chai')
const uint8ArrayConcat = require('uint8arrays/concat')
const uint8ArrayFromString = require('uint8arrays/from-string')

const { RPC } = require('../../src/pubsub/message/rpc')
const {
  signMessage,
  SignPrefix,
  verifySignature
} = require('../../src/pubsub/message/sign')
const PeerId = require('peer-id')
const { randomSeqno } = require('../../src/pubsub/utils')

describe('message signing', () => {
  /** @type {PeerId} */
  let peerId
  before(async () => {
    peerId = await PeerId.create({
      bits: 1024
    })
  })

  it('should be able to sign and verify a message', async () => {
    const message = {
      from: peerId.toBytes(),
      data: uint8ArrayFromString('hello'),
      seqno: randomSeqno(),
      topicIDs: ['test-topic']
    }

    const bytesToSign = uint8ArrayConcat([SignPrefix, RPC.Message.encode(message).finish()])
    const expectedSignature = await peerId.privKey.sign(bytesToSign)

    const signedMessage = await signMessage(peerId, message)

    // Check the signature and public key
    expect(signedMessage.signature).to.eql(expectedSignature)
    expect(signedMessage.key).to.eql(peerId.pubKey.bytes)

    // Verify the signature
    const verified = await verifySignature({
      ...signedMessage,
      from: peerId.toB58String()
    })
    expect(verified).to.eql(true)
  })

  it('should be able to extract the public key from an inlined key', async () => {
    const secPeerId = await PeerId.create({ keyType: 'secp256k1' })

    const message = {
      from: secPeerId.toBytes(),
      data: uint8ArrayFromString('hello'),
      seqno: randomSeqno(),
      topicIDs: ['test-topic']
    }

    const bytesToSign = uint8ArrayConcat([SignPrefix, RPC.Message.encode(message).finish()])
    const expectedSignature = await secPeerId.privKey.sign(bytesToSign)

    const signedMessage = await signMessage(secPeerId, message)

    // Check the signature and public key
    expect(signedMessage.signature).to.eql(expectedSignature)
    signedMessage.key = undefined

    // Verify the signature
    const verified = await verifySignature({
      ...signedMessage,
      from: secPeerId.toB58String()
    })
    expect(verified).to.eql(true)
  })

  it('should be able to extract the public key from the message', async () => {
    const message = {
      from: peerId.toBytes(),
      data: uint8ArrayFromString('hello'),
      seqno: randomSeqno(),
      topicIDs: ['test-topic']
    }

    const bytesToSign = uint8ArrayConcat([SignPrefix, RPC.Message.encode(message).finish()])
    const expectedSignature = await peerId.privKey.sign(bytesToSign)

    const signedMessage = await signMessage(peerId, message)

    // Check the signature and public key
    expect(signedMessage.signature).to.eql(expectedSignature)
    expect(signedMessage.key).to.eql(peerId.pubKey.bytes)

    // Verify the signature
    const verified = await verifySignature({
      ...signedMessage,
      from: peerId.toB58String()
    })
    expect(verified).to.eql(true)
  })
})
