abstract-stream-muxer
=====================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a stream muxer.

The primary goal of this module is to enable developers to pick and swap their stream muxing module as they see fit for their application, without having to go through shims or compatibility issues. This module and test suite was heavily inspired by [abstract-blog-store](https://github.com/maxogden/abstract-blob-store).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

# Modules that implement the interface

- 

Send a PR to add a new one if you happen to find or write one.

# Badge

![](/img/badge.png)

# How to use


# API

A valid (read: that follows this abstraction) stream muxer, must implement the following API.

### Attach muxer to a transport

- `Node.js` muxer.attach(transport, function (err, conn)) 
- `Go` conn, err := muxer.attach(transport)


### Dial(open/create) a new stream

- `Node.js` conn.dialStream(function (err, stream))
- `Go` stream, err := conn.dialStream()


### Listen(wait/receive) a new incoming stream

- `Node.js` conn.on('stream', function (stream)) 
- `Go` stream := conn.listen()
