module.exports.all = function (test, common) {
  test('a test', function (t) {
    common.setup(test, function (err, Connection) {
      t.ifError(err)
      t.pass('woot!')
      t.end()
    })
  })
}
