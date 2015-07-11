module.exports = function (test, common) {
  require('./base-test.js').all(test, common)
  require('./stress-test.js').all(test, common)
}
