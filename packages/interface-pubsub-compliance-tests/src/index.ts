import apiTest from './api.js'
import emitSelfTest from './emit-self.js'
import messagesTest from './messages.js'
import connectionHandlersTest from './connection-handlers.js'
import twoNodesTest from './two-nodes.js'
import multipleNodesTest from './multiple-nodes.js'
import type { TestSetup } from '@libp2p/interface-compliance-tests'
import type { PubSub, PubSubInit } from '@libp2p/interface-pubsub'
import type { Components } from '@libp2p/components'

export interface PubSubArgs {
  components: Components
  init: PubSubInit
}

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('interface-pubsub compliance tests', () => {
    apiTest(common)
    emitSelfTest(common)
    messagesTest(common)
    connectionHandlersTest(common)
    twoNodesTest(common)
    multipleNodesTest(common)
  })
}
