var Id = require('peer-id')

module.exports.all = function (test, common) {
  test('Simple findPeers test', function (t) {
    common.setup(test, function (err, pr) {
      t.plan(3)
      t.ifError(err)
      pr.findPeers(Id.create().toBytes(), function (err, peerQueue) {
        t.ifError(err)
        t.equal(peerQueue.length >= 1, true)
        common.teardown()
      })
    })
  })
}
