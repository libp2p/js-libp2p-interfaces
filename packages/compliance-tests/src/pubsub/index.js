// @ts-nocheck interface tests
/* eslint-env mocha */
'use strict'

const apiTest = require('./api')
const emitSelfTest = require('./emit-self')
const messagesTest = require('./messages')
const connectionHandlersTest = require('./connection-handlers')
const twoNodesTest = require('./two-nodes')
const multipleNodesTest = require('./multiple-nodes')

module.exports = (common) => {
  describe('interface-pubsub compliance tests', () => {
    apiTest(common)
    emitSelfTest(common)
    messagesTest(common)
    connectionHandlersTest(common)
    twoNodesTest(common)
    multipleNodesTest(common)
  })
}
