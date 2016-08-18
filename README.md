interface-stream-muxer
=====================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Travis CI](https://travis-ci.org/ipfs/interface-stream-muxer.svg?branch=master)](https://travis-ci.org/ipfs/interface-stream-muxer)
[![Dependency Status](https://david-dm.org/ipfs/interface-stream-muxer.svg?style=flat-square)](https://david-dm.org/ipfs/interface-stream-muxer) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> A test suite and interface you can use to implement a stream muxer. "A one stop shop for all your muxing needs"

The primary goal of this module is to enable developers to pick and swap their stream muxing module as they see fit for their application, without having to go through shims or compatibility issues. This module and test suite was heavily inspired by [abstract-blob-store](https://github.com/maxogden/abstract-blob-store).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

## Modules that implement the interface

- [JavaScript libp2p-spdy](https://github.com/libp2p/js-libp2p-spdy)
- [Go spdy, muxado, yamux and multiplex](https://github.com/jbenet/go-stream-muxer)

Send a PR to add a new one if you happen to find or write one.

## Badge

Include this badge in your readme if you make a new module that uses interface-stream-muxer API.

![](/img/badge.png)

## Usage

### Node.js

Install `interface-stream-muxer` as one of the dependencies of your project and as a test file. Then, using `mocha` (for Node.js) or a test runner with compatible API, do:

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

### Attach muxer to a transport

- `Node.js` muxedConn = muxer(transport, isListener)
- `Go` muxedConn, err := muxer.Attach(transport, isListener)

This method attaches our stream muxer to the desired transport (UDP, TCP) and returns/callbacks with the `err, conn`(error, connection).

If `err` is passed, no operation should be made in `conn`.

`isListener` is a bool that tells the side of the socket we are, `isListener = true` for listener/server and `isListener = false` for dialer/client side.

`muxedConn` interfaces our established Connection with the other endpoint, it must offer an interface to open a stream inside this connection and to receive incomming stream requests.

### Dial(open/create) a new stream


- `Node.js` stream = muxedConn.newStream([function (err, stream)])
- `Go` stream, err := muxedConn.newStream()

This method negotiates and opens a new stream with the other endpoint.

If `err` is passed, no operation should be made in `stream`.

`stream` interface our established Stream with the other endpoint, it must implement the [Duplex Stream interface](https://nodejs.org/api/stream.html#stream_class_stream_duplex) in Node.js or the [ReadWriteCloser](http://golang.org/pkg/io/#ReadWriteCloser) in Go.

In the Node.js case, if no callback is passed, stream will emit an 'ready' event when it is prepared or a 'error' event if it fails to establish the connection, until then, it will buffer the 'write' calls.

### Listen(wait/accept) a new incoming stream

- `Node.js` muxedConn.on('stream', function (stream) {})
- `Go` stream := muxedConn.Accept()

Each time a dialing peer initiates the new stream handshake, a new stream is created on the listening side.

In Node.js, the Event Emitter pattern is expected to be used in order to receive new incoming streams, while in Go, it expects to wait when Accept is called.
