var streamPair = require('stream-pair')
// var devNull = require('dev-null')
// var bytesStream = require('random-bytes-stream')

module.exports.all = function (test, common) {

  test('1 stream with 1 msg', function (t) {
    common.setup(test, function (err, Muxer) {
      t.ifError(err, 'should not throw')
      var pair = streamPair.create()

      spawnGeneration(t, Muxer, pair, pair.other, 1, 1)
    })
  })
}

function spawnGeneration (t, Muxer, dialerSocket, listenerSocket, nStreams, nMsg, sizeWindow) {
  t.plan(6)

  var msg = 'simple msg'

  var listenerMuxer = new Muxer()
  var dialerMuxer = new Muxer()

  var listenerConn = listenerMuxer.attach(listenerSocket)
  var dialerConn = dialerMuxer.attach(dialerSocket)

  listenerConn.on('stream', function (stream) {
    t.pass('Incoming stream')

    stream.on('data', function (chunk) {

    })

    stream.on('end', function () {
      t.pass('Stream ended on Listener')
      // stream.end()
    })

  })

  for (var i = 0; i < nStreams; i++) {
    dialerConn.dialStream(function (err, stream) {
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

// function randSizeMsg (sizeWindow) {
//   return Math.floor(Math.random() * (sizeWindow[1] - sizeWindow[0] + 1)) + sizeWindow[0]
// }

// tests list:
// SubtestStress1Conn1Stream1Msg
// SubtestStress1Conn1Stream100Msg
// SubtestStress1Conn100Stream100Msg
// SubtestStress1Conn1000Stream10Msg
// SubtestStress1Conn1000Stream100Msg10MB

