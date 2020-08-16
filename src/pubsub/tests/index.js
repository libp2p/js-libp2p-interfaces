/* eslint-env mocha */
'use strict'

const apiTest = require('./api-test')
const twoNodesTest = require('./two-nodes-test')
const multipleNodesTest = require('./multiple-nodes-test')

module.exports = (common) => {
  describe('interface-pubsub', () => {
    apiTest(common)
    twoNodesTest(common)
    multipleNodesTest(common)
  })
}
