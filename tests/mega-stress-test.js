var streamPair = require('stream-pair')

module.exports.all = function (test, common) {
  test('10000 messages of 10000 streams', function (t) {
    common.setup(test, function (err, muxer) {
      t.ifError(err, 'should not throw')
      var pair = streamPair.create()

      spawnGeneration(t, muxer, pair, pair.other, 10000, 10000)
    })
  })
}

function spawnGeneration (t, muxer, dialerSocket, listenerSocket, nStreams, nMsg, size) {
  t.plan(1 + (5 * nStreams) + (nStreams * nMsg))

  var msg = !size ? 'simple msg' : 'make the msg bigger'

  var listener = muxer(listenerSocket, true)
  var dialer = muxer(dialerSocket, false)

  listener.on('stream', function (stream) {
    t.pass('Incoming stream')

    stream.on('data', function (chunk) {
      t.pass('Received message')
    })

    stream.on('end', function () {
      t.pass('Stream ended on Listener')
      stream.end()
    })
  })

  for (var i = 0; i < nStreams; i++) {
    dialer.newStream(function (err, stream) {
      t.ifError(err, 'Should not throw')
      t.pass('Dialed stream')

      for (var j = 0; j < nMsg; j++) {
        stream.write(msg)
      }

      stream.on('data', function (chunk) {
        t.fail('Should not happen')
      })

      stream.on('end', function () {
        t.pass('Stream ended on Dialer')
      })

      stream.end()
    })
  }
}
