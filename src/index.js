/* eslint-env mocha */
'use strict'

const baseTest = require('./base-test')
const stressTest = require('./stress-test')
const megaStressTest = require('./mega-stress-test')

module.exports = (common) => {
  describe('interface-stream-muxer', () => {
    baseTest(common)
    stressTest(common)
    megaStressTest(common)
  })
}
