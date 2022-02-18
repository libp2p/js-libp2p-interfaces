import apiTest from './api.js'
import emitSelfTest from './emit-self.js'
import messagesTest from './messages.js'
import connectionHandlersTest from './connection-handlers.js'
import twoNodesTest from './two-nodes.js'
import multipleNodesTest from './multiple-nodes.js'
import type { TestSetup } from '../index.js'
import type { Message, PubSubEvents, PubSubOptions } from '@libp2p/interfaces/pubsub'
import type { PubsubBaseProtocol } from '@libp2p/pubsub'

export interface EventMap extends PubSubEvents {
  'topic': CustomEvent<Message>
  'foo': CustomEvent<Message>
  'test-topic': CustomEvent<Message>
  'reconnect-channel': CustomEvent<Message>
  'Z': CustomEvent<Message>
  'Za': CustomEvent<Message>
  'Zb': CustomEvent<Message>
}

export default (common: TestSetup<PubsubBaseProtocol<EventMap>, PubSubOptions>) => {
  describe('interface-pubsub compliance tests', () => {
    apiTest(common)
    emitSelfTest(common)
    messagesTest(common)
    connectionHandlersTest(common)
    twoNodesTest(common)
    multipleNodesTest(common)
  })
}
