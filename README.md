abstract-stream-muxer
=====================

> **STILL WIP**

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a stream muxer.

The primary goal of this module is to enable developers to pick and swap their stream muxing module as they see fit for their application, without having to go through shims or compatibility issues. This module and test suite was heavily inspired by [abstract-blog-store](https://github.com/maxogden/abstract-blob-store).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

# Modules that implement the interface

- [https://github.com/diasdavid/node-spdy-stream-muxer](Node.js spdy-stream-muxer) - stream-muxer abstraction on top of [spdy-transport](https://github.com/indutny/spdy-transport)

Send a PR to add a new one if you happen to find or write one.

# Badge

Include this badge in your readme if you make a new module that uses abstract-stream-muxer API.

![](/img/badge.png)

# How to use


# API

A valid (read: that follows this abstraction) stream muxer, must implement the following API.

### Attach muxer to a transport

- `Node.js` muxer.attach(transport, isListener, function (err, conn))
- `Go` conn, err := muxer.Attach(transport, isListener)

This method attaches our stream muxer to the desired transport (UDP, TCP) and returns/callbacks with the `err, conn`(error, connection).

If `err` is passed, no operation should be made in `conn`.

`isListener` is a bool that tells the side of the socket we are, `isListener = true` for listener/server and `isListener = false` for dialer/client side.

`conn` abstracts our established Connection with the other endpoint, it must offer an interface to open a stream inside this connection and to receive incomming stream requests.

### Dial(open/create) a new stream

- `Node.js` conn.dialStream(function (err, stream))
- `Go` stream, err := conn.DialStream()

This method negotiates and opens a new stream with the other endpoint.

If `err` is passed, no operation should be made in `stream`.

`stream` abstract our established Stream with the other endpoint, it must implement the [Duplex Stream interface](https://nodejs.org/api/stream.html#stream_class_stream_duplex) in Node.js or the [ReadWriteCloser](http://golang.org/pkg/io/#ReadWriteCloser) in Go.

### Listen(wait/accept) a new incoming stream

- `Node.js` conn.on('stream', function (stream)) 
- `Go` stream := conn.Accept()

Each time a dialing peer initiates the new stream handshake, a new stream is created on the listening side.

In Node.js, the Event Emitter pattern is expected to be used in order to receive new incoming streams, while in Go, it expects to wait when Accept is called.
