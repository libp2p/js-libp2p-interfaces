'use strict'

module.exports.all = function (test, common) {
  test('test', function (t) {
    common.setup(test, function (err, pr) {
      if (err) {}
      common.teardown()
    })
  })
}
