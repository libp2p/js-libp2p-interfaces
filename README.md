interface-connection
==================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a connection. A connection is understood as something that offers mechanism for writing and reading data, back pressure, half and full duplex streams. This module and test suite were heavily inspired by abstract-blob-store and interface-stream-muxer.

The primary goal of module is to enable developers to pick, swap or upgrade their connection without loosing the same API expectations and mechanisms such as back pressure and the hability to half close a connection.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

> **IMPORTANT** - Tests are still not finished nor the interface


# Modules that implement the interface

- [node-libp2p-tcp](https://github.com/diasdavid/node-libp2p-tcp)

# Badge

Include this badge in your readme if you make a module that is compatible with the interface-connection API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/diasdavid/interface-connection/master/img/badge.png)

# How to use the battery of tests

## Node.js

```
var tape = require('tape')
var tests = require('interface-connection/tests')
var YourConnectionHandler = require('../src')

var common = {
  setup: function (t, cb) {
    cb(null, YourConnectionHandler)
  },
  teardown: function (t, cb) {
    cb()
  }
}

tests(tape, common)
```

## Go

> WIP

# API

A valid (read: that follows this abstraction) connection, must implement the following API.

notes: 
  - should have backpressure into account
  - should enable half duplex streams (close from one side, but still open for the other)
  - should support full duplex
  - tests should be performed by passing two streams

