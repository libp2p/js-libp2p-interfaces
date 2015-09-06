module.exports.all = function (test, common) {

  test('Store a valid record', function (t) {
    common.setup(test, function (err, recordStore) {
      t.ifError(err, 'Should not throw')
      t.pass('woo')
    })
  })

  test('Store an unvalid record')
  test('Store and retrieve a valid record')
  test('Store a bunch of valid and unvalid records and check what gets retrieved')
  test('Store a bunch of records with variable validity, wait for some to expire, check what gets retrieved')

}
