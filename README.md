interface-stream-muxer
=====================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![](https://img.shields.io/travis/libp2p/interface-stream-muxer.svg?style=flat-square)](https://travis-ci.com/libp2p/interface-stream-muxer)
[![Dependency Status](https://david-dm.org/libp2p/interface-stream-muxer.svg?style=flat-square)](https://david-dm.org/libp2p/interface-stream-muxer)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> A test suite and interface you can use to implement a stream muxer. "A one stop shop for all your muxing needs"

The primary goal of this module is to enable developers to pick and swap their stream muxing module as they see fit for their application, without having to go through shims or compatibility issues. This module and test suite was heavily inspired by [abstract-blob-store](https://github.com/maxogden/abstract-blob-store).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

## Lead Maintainer

[Jacob Heun](https://github.com/jacobheun/)

## Modules that implement the interface

- [JavaScript libp2p-spdy](https://github.com/libp2p/js-libp2p-spdy)
- [JavaScript libp2p-mplex](https://github.com/libp2p/js-libp2p-mplex)
- [Go spdy, muxado, yamux and multiplex](https://github.com/jbenet/go-stream-muxer)

Send a PR to add a new one if you happen to find or write one.

## Badge

Include this badge in your readme if you make a new module that uses interface-stream-muxer API.

![](/img/badge.png)

## Usage

### Node.js

Install `interface-stream-muxer` as one of the dependencies of your project and as a test file. Then, using `mocha` (for JavaScript) or a test runner with compatible API, do:

```js
const test = require('interface-stream-muxer')

const common = {
  setup (cb) {
    cb(null, yourMuxer)
  },
  teardown (cb) {
    cb()
  }
}

// use all of the test suits
test(common)
```

### Go

> WIP

## API

A valid (read: that follows this abstraction) stream muxer, must implement the following API.

### Attach muxer to a Connection

- `JavaScript` muxedConn = muxer(conn, isListener)
- `Go` muxedConn, err := muxer.Attach(conn, isListener)

This method attaches our stream muxer to an instance of [Connection](https://github.com/libp2p/interface-connection/blob/master/src/connection.js) defined by [interface-connection](https://github.com/libp2p/interface-connection).

If `err` is passed, no operation should be made in `conn`.

`isListener` is a bool that tells the side of the socket we are, `isListener = true` for listener/server and `isListener = false` for dialer/client side.

`muxedConn` interfaces our established Connection with the other endpoint, it must offer an interface to open a stream inside this connection and to receive incomming stream requests.

### Dial(open/create) a new stream

- `JavaScript` stream = muxedConn.newStream([function (err, stream)])
- `Go` stream, err := muxedConn.newStream()

This method negotiates and opens a new stream with the other endpoint.

If `err` is passed, no operation should be made in `stream`.

`stream` interface our established Stream with the other endpoint, it must implement the [Duplex pull-stream interface](https://pull-stream.github.io) in JavaScript or the [ReadWriteCloser](http://golang.org/pkg/io/#ReadWriteCloser) in Go.

### Listen(wait/accept) a new incoming stream

- `JavaScript` muxedConn.on('stream', function (stream) {})
- `Go` stream := muxedConn.Accept()

Each time a dialing peer initiates the new stream handshake, a new stream is created on the listening side.

In JavaScript, the Event Emitter pattern is expected to be used in order to receive new incoming streams, while in Go, it expects to wait when Accept is called.
