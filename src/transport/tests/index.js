/* eslint-env mocha */
'use strict'

const dial = require('./dial-test')
const listen = require('./listen-test')
const filter = require('./filter-test')

module.exports = (common) => {
  describe('interface-transport', () => {
    dial(common)
    listen(common)
    filter(common)
  })
}

module.exports.AbortError = require('../errors').AbortError
module.exports.Adapter = require('../adapter')
