module.exports.all = function (test, common) {
  test('a test', function (t) {
    common.setup(test, function (err, Connection) {
      t.ifError(err)
      t.pass('woot!')
      t.end()
    })
  })

  // test for:
  // 1. dial and listen
  // 2. close
}
