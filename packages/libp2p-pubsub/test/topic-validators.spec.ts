import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import pWaitFor from 'p-wait-for'
import errCode from 'err-code'
import PeerIdFactory from 'peer-id'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { PeerStreams } from '../src/peer-streams.js'
import {
  createPeerId,
  mockRegistrar,
  PubsubImplementation
} from './utils/index.js'

const protocol = '/pubsub/1.0.0'

describe('topic validators', () => {
  let pubsub: PubsubImplementation

  beforeEach(async () => {
    const peerId = await createPeerId()

    pubsub = new PubsubImplementation({
      libp2p: {
        peerId: peerId,
        registrar: mockRegistrar
      },
      multicodecs: [protocol],
      globalSignaturePolicy: 'StrictNoSign'
    })

    await pubsub.start()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should filter messages by topic validator', async () => {
    // use _publish.callCount() to see if a message is valid or not
    sinon.spy(pubsub, '_publish')
    // @ts-expect-error not all fields are implemented in return value
    sinon.stub(pubsub.peers, 'get').returns({})
    const filteredTopic = 't'
    const peer = new PeerStreams({ id: await PeerIdFactory.create(), protocol: 'a-protocol' })

    // Set a trivial topic validator
    pubsub.topicValidators.set(filteredTopic, async (topic, message) => {
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
      }],
      toJSON: () => ({})
    }

    // process valid message
    pubsub.subscribe(filteredTopic)
    void pubsub._processRpc(peer.id.toB58String(), peer, validRpc)

    // @ts-expect-error .callCount is a property added by sinon
    await pWaitFor(() => pubsub._publish.callCount === 1)

    // invalid case
    const invalidRpc = {
      subscriptions: [],
      msgs: [{
        data: uint8ArrayFromString('a different message'),
        topicIDs: [filteredTopic]
      }],
      toJSON: () => ({})
    }

    // process invalid message
    void pubsub._processRpc(peer.id.toB58String(), peer, invalidRpc)

    // @ts-expect-error .callCount is a property added by sinon
    expect(pubsub._publish.callCount).to.eql(1)

    // remove topic validator
    pubsub.topicValidators.delete(filteredTopic)

    // another invalid case
    const invalidRpc2 = {
      subscriptions: [],
      msgs: [{
        data: uint8ArrayFromString('a different message'),
        topicIDs: [filteredTopic]
      }],
      toJSON: () => ({})
    }

    // process previously invalid message, now is valid
    void pubsub._processRpc(peer.id.toB58String(), peer, invalidRpc2)
    pubsub.unsubscribe(filteredTopic)

    // @ts-expect-error .callCount is a property added by sinon
    await pWaitFor(() => pubsub._publish.callCount === 2)
  })
})
