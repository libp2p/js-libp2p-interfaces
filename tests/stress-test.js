/* knobs - nStreams, nMsg, sizeMsg[low, high] */

var streamPair = require('stream-pair')

module.exports.all = function (test, common) {

  test('Open a stream from the dealer', function (t) {
    common.setup(test, function (err, Muxer) {
      t.plan(4)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = new Muxer()
      var listener = new Muxer()

      var connDialer = dialer.attach(pair)
      var connListener = listener.attach(pair.other)

      connDialer.dialStream(function (err, stream) {
        t.ifError(err, 'Should not throw')
        t.pass('dialed stream')
      })

      connListener.on('stream', function (stream) {
        t.pass('got stream')
      })
    })
  })

}
