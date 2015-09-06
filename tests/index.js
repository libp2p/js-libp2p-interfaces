var timed = require('timed-tape')

module.exports = function (test, common) {
  test = timed(test)
  require('./base-test.js').all(test, common)
}
