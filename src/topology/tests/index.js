/* eslint-env mocha */

'use strict'

const topologySuite = require('./topology')

module.exports = (test) => {
  topologySuite(test)
}
