import apiTest from './api.js'
import emitSelfTest from './emit-self.js'
import messagesTest from './messages.js'
import connectionHandlersTest from './connection-handlers.js'
import twoNodesTest from './two-nodes.js'
import multipleNodesTest from './multiple-nodes.js'
import type { TestSetup } from '../index.js'
import type { Message, PubSubEvents, PubSubInit } from '@libp2p/interfaces/pubsub'
import type { PubSubBaseProtocol } from '@libp2p/pubsub'
import type { Components } from '@libp2p/interfaces/components'

export interface EventMap extends PubSubEvents {
  'topic': CustomEvent<Message>
  'foo': CustomEvent<Message>
  'test-topic': CustomEvent<Message>
  'reconnect-channel': CustomEvent<Message>
  'Z': CustomEvent<Message>
  'Za': CustomEvent<Message>
  'Zb': CustomEvent<Message>
}

export interface PubSubArgs {
  components: Components
  init: PubSubInit
}

export default (common: TestSetup<PubSubBaseProtocol<EventMap>, PubSubArgs>) => {
  describe('interface-pubsub compliance tests', () => {
    apiTest(common)
    emitSelfTest(common)
    messagesTest(common)
    connectionHandlersTest(common)
    twoNodesTest(common)
    multipleNodesTest(common)
  })
}
