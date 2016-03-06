var timed = require('timed-tape')

module.exports = function (test, common, mega) {
  test = timed(test)
  require('./base-test.js').all(test, common)
  require('./stress-test.js').all(test, common)
  // require('./mega-stress-test.js').all(test, common)
}
