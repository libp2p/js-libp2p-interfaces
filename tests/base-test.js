module.exports.all = function (test, common) {
  test('see if this works', function (t) {
    common.setup(test, function (err, muxer) {
      t.ifError(err, 'Should not throw')
      // write test here
      t.end()
    })
  })
}
