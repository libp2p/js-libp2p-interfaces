module.exports = function (test, common, mega) {
  require('./base-test.js').all(test, common)
  require('./stress-test.js').all(test, common)
  if (mega) {
    require('./mega-stress-test.js').all(test, common)
  }
}
