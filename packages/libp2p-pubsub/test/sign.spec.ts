import { expect } from 'aegir/utils/chai.js'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { RPC } from './message/rpc.js'
import {
  signMessage,
  SignPrefix,
  verifySignature
} from '../src/sign.js'
import * as PeerIdFactory from '@libp2p/peer-id-factory'
import { randomSeqno, toRpcMessage } from '../src/utils.js'
import { keys } from '@libp2p/crypto'
import type { Message, PubSubRPCMessage } from '@libp2p/interfaces/pubsub'
import type { PeerId } from '@libp2p/interfaces/peer-id'

function encodeMessage (message: PubSubRPCMessage) {
  return RPC.Message.encode(message).finish()
}

describe('message signing', () => {
  let peerId: PeerId

  before(async () => {
    peerId = await PeerIdFactory.createRSAPeerId({
      bits: 1024
    })
  })

  it('should be able to sign and verify a message', async () => {
    const message: Message = {
      from: peerId,
      data: uint8ArrayFromString('hello'),
      sequenceNumber: randomSeqno(),
      topic: 'test-topic'
    }

    const bytesToSign = uint8ArrayConcat([SignPrefix, RPC.Message.encode(toRpcMessage(message)).finish()])

    if (peerId.privateKey == null) {
      throw new Error('No private key found on PeerId')
    }

    const privateKey = await keys.unmarshalPrivateKey(peerId.privateKey)
    const expectedSignature = await privateKey.sign(bytesToSign)

    const signedMessage = await signMessage(peerId, message, encodeMessage)

    // Check the signature and public key
    expect(signedMessage.signature).to.equalBytes(expectedSignature)
    expect(signedMessage.key).to.equalBytes(peerId.publicKey)

    // Verify the signature
    const verified = await verifySignature({
      ...signedMessage,
      from: peerId
    }, encodeMessage)
    expect(verified).to.eql(true)
  })

  it('should be able to extract the public key from an inlined key', async () => {
    const secPeerId = await PeerIdFactory.createSecp256k1PeerId()

    const message: Message = {
      from: secPeerId,
      data: uint8ArrayFromString('hello'),
      sequenceNumber: randomSeqno(),
      topic: 'test-topic'
    }

    const bytesToSign = uint8ArrayConcat([SignPrefix, RPC.Message.encode(toRpcMessage(message)).finish()])

    if (secPeerId.privateKey == null) {
      throw new Error('No private key found on PeerId')
    }

    const privateKey = await keys.unmarshalPrivateKey(secPeerId.privateKey)
    const expectedSignature = await privateKey.sign(bytesToSign)

    const signedMessage = await signMessage(secPeerId, message, encodeMessage)

    // Check the signature and public key
    expect(signedMessage.signature).to.eql(expectedSignature)
    signedMessage.key = undefined

    // Verify the signature
    const verified = await verifySignature({
      ...signedMessage,
      from: secPeerId
    }, encodeMessage)
    expect(verified).to.eql(true)
  })

  it('should be able to extract the public key from the message', async () => {
    const message: Message = {
      from: peerId,
      data: uint8ArrayFromString('hello'),
      sequenceNumber: randomSeqno(),
      topic: 'test-topic'
    }

    const bytesToSign = uint8ArrayConcat([SignPrefix, RPC.Message.encode(toRpcMessage(message)).finish()])

    if (peerId.privateKey == null) {
      throw new Error('No private key found on PeerId')
    }

    const privateKey = await keys.unmarshalPrivateKey(peerId.privateKey)
    const expectedSignature = await privateKey.sign(bytesToSign)

    const signedMessage = await signMessage(peerId, message, encodeMessage)

    // Check the signature and public key
    expect(signedMessage.signature).to.equalBytes(expectedSignature)
    expect(signedMessage.key).to.equalBytes(peerId.publicKey)

    // Verify the signature
    const verified = await verifySignature({
      ...signedMessage,
      from: peerId
    }, encodeMessage)
    expect(verified).to.eql(true)
  })
})
