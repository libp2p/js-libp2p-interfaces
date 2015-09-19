module.exports.all = function (test, common) {
  test('a test', function (t) {
    common.setup(test, function (err, pr) {
      t.plan(1)
      t.ifError(err)
    })
  })
}
