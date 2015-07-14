var streamPair = require('stream-pair')

module.exports.all = function (test, common) {

  test('Open a stream from the dealer', function (t) {
    common.setup(test, function (err, Muxer) {
      t.plan(4)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = new Muxer()
      var listener = new Muxer()

      var connDialer = dialer.attach(pair, false)
      var connListener = listener.attach(pair.other, true)

      connDialer.dialStream(function (err, stream) {
        t.ifError(err, 'Should not throw')
        t.pass('dialed stream')
      })

      connListener.on('stream', function (stream) {
        t.pass('got stream')
      })
    })
  })

  test('Open a stream from the listener', function (t) {
    common.setup(test, function (err, Muxer) {
      t.plan(4)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = new Muxer()
      var listener = new Muxer()

      var connDialer = dialer.attach(pair, false)
      var connListener = listener.attach(pair.other, true)

      connListener.dialStream(function (err, stream) {
        t.ifError(err, 'Should not throw')
        t.pass('dialed stream')
      })

      connDialer.on('stream', function (stream) {
        t.pass('got stream')
      })
    })
  })

  test('Open a stream using the net.connect pattern', function (t) {
    common.setup(test, function (err, Muxer) {
      t.plan(3)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = new Muxer()
      var listener = new Muxer()

      var connDialer = dialer.attach(pair, false)
      var connListener = listener.attach(pair.other, true)

      var stream = connListener.dialStream()

      stream.on('ready', function () {
        t.pass('dialed stream')
      })

      stream.on('error', function (err) {
        t.ifError(err, 'Should not throw')
      })

      connDialer.on('stream', function (stream) {
        t.pass('got stream')
      })
    })
  })

  test('Buffer writes Open a stream using the net.connect pattern', function (t) {
    common.setup(test, function (err, Muxer) {
      t.plan(4)
      t.ifError(err, 'Should not throw')

      var pair = streamPair.create()
      var dialer = new Muxer()
      var listener = new Muxer()

      var connDialer = dialer.attach(pair, false)
      var connListener = listener.attach(pair.other, true)

      var stream = connListener.dialStream()

      stream.write('buffer this')

      stream.on('ready', function () {
        t.pass('dialed stream')
      })

      stream.on('error', function (err) {
        t.ifError(err, 'Should not throw')
      })

      connDialer.on('stream', function (stream) {
        t.pass('got stream')

        stream.on('data', function (chunk) {
          t.equal(chunk.toString(), 'buffer this')
        })
      })
    })
  })

}
