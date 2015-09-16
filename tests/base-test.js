module.exports.all = function (test, common) {
  test('a test', function (t) {
    common.setup(test, function (err, conn) {
      t.ifError(err)
      t.end()
    })
  })
}
