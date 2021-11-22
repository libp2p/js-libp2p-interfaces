import { expect } from 'aegir/utils/chai.js'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { RPC } from '../src/message/rpc.js'
import {
  signMessage,
  SignPrefix,
  verifySignature
} from '../src/message/sign.js'
import PeerId from 'peer-id'
import { randomSeqno } from '../src/utils.js'
import type { Message } from 'libp2p-interfaces/pubsub'

describe('message signing', () => {
  let peerId: PeerId

  before(async () => {
    peerId = await PeerId.create({
      bits: 1024
    })
  })

  it('should be able to sign and verify a message', async () => {
    const message: Message = {
      from: peerId.toBytes(),
      receivedFrom: peerId.toB58String(),
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
      from: peerId.toBytes()
    })
    expect(verified).to.eql(true)
  })

  it('should be able to extract the public key from an inlined key', async () => {
    const secPeerId = await PeerId.create({ keyType: 'secp256k1' })

    const message: Message = {
      from: secPeerId.toBytes(),
      receivedFrom: secPeerId.toB58String(),
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
      from: secPeerId.toBytes()
    })
    expect(verified).to.eql(true)
  })

  it('should be able to extract the public key from the message', async () => {
    const message: Message = {
      from: peerId.toBytes(),
      receivedFrom: peerId.toB58String(),
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
      from: peerId.toBytes()
    })
    expect(verified).to.eql(true)
  })
})
