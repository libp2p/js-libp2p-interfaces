/* eslint-env mocha */
'use strict'

// const chai = require('chai')
// const { expect } = chai
const sinon = require('sinon')

module.exports = (common) => {
  describe('pubsub with multiple nodes', () => {
    let pubsub

    // Create pubsub router
    beforeEach(async () => {
      pubsub = await common.setup(2)
    })

    afterEach(async () => {
      sinon.restore()
      // TODO: array
      await pubsub && pubsub.stop()
      await common.teardown()
    })
  })
}
