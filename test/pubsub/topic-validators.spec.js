/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')
const pWaitFor = require('p-wait-for')
const errCode = require('err-code')

const PeerId = require('peer-id')
const uint8ArrayEquals = require('uint8arrays/equals')
const uint8ArrayFromString = require('uint8arrays/from-string')

const { utils } = require('../../src/pubsub')
const PeerStreams = require('../../src/pubsub/peer-streams')
const { SignaturePolicy } = require('../../src/pubsub/signature-policy')

const {
  createPeerId,
  mockRegistrar,
  PubsubImplementation
} = require('./utils')

const protocol = '/pubsub/1.0.0'

describe('topic validators', () => {
  let pubsub

  beforeEach(async () => {
    const peerId = await createPeerId()

    pubsub = new PubsubImplementation(protocol, {
      peerId: peerId,
      registrar: mockRegistrar
    }, {
      globalSignaturePolicy: SignaturePolicy.StrictNoSign
    })

    pubsub.start()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should filter messages by topic validator', async () => {
    // use _publish.callCount() to see if a message is valid or not
    sinon.spy(pubsub, '_publish')
    sinon.stub(pubsub.peers, 'get').returns({})
    const filteredTopic = 't'
    const peer = new PeerStreams({ id: await PeerId.create() })

    // Set a trivial topic validator
    pubsub.topicValidators.set(filteredTopic, (topic, message) => {
      if (!uint8ArrayEquals(message.data, uint8ArrayFromString('a message'))) {
        throw errCode(new Error(), 'ERR_TOPIC_VALIDATOR_REJECT')
      }
    })

    // valid case
    const validRpc = {
      subscriptions: [],
      msgs: [{
        data: uint8ArrayFromString('a message'),
        topicIDs: [filteredTopic]
      }]
    }

    // process valid message
    pubsub.subscribe(filteredTopic)
    pubsub._processRpc(peer.id.toB58String(), peer, validRpc)

    await pWaitFor(() => pubsub._publish.callCount === 1)

    // invalid case
    const invalidRpc = {
      subscriptions: [],
      msgs: [{
        data: uint8ArrayFromString('a different message'),
        topicIDs: [filteredTopic]
      }]
    }

    // process invalid message
    pubsub._processRpc(peer.id.toB58String(), peer, invalidRpc)
    expect(pubsub._publish.callCount).to.eql(1)

    // remove topic validator
    pubsub.topicValidators.delete(filteredTopic)

    // another invalid case
    const invalidRpc2 = {
      subscriptions: [],
      msgs: [{
        data: uint8ArrayFromString('a different message'),
        topicIDs: [filteredTopic]
      }]
    }

    // process previously invalid message, now is valid
    pubsub._processRpc(peer.id.toB58String(), peer, invalidRpc2)
    pubsub.unsubscribe(filteredTopic)

    await pWaitFor(() => pubsub._publish.callCount === 2)
  })
})
