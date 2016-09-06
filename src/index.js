/* eslint-env mocha */
'use strict'

const baseTest = require('./base-test')
const closeTest = require('./close-test')
const stressTest = require('./stress-test')
const megaStressTest = require('./mega-stress-test')

module.exports = (common) => {
  describe('interface-stream-muxer', () => {
    baseTest(common)
    closeTest(common)
    stressTest(common)
    megaStressTest(common)
  })
}
