abstract-connection
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a connection. A connection is understood as something that offers a dial+listen interface

The primary goal of this module is to enable developers to pick and swap their Record Store module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and abstract-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.


# Modules that implement the interface

- [node-libp2p-tcp](https://github.com/diasdavid/node-libp2p-tcp)

# Badge

Include this badge in your readme if you make a module that is compatible with the abstract-connection API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/diasdavid/abstract-connection/master/img/badge.png)

# How to use the battery of tests

## Node.js

```
var tape = require('tape')
var tests = require('abstract-connection/tests')
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

note: a `stream` should be a stream that implements the [abstract-stream](https://github.com/diasdavid/abstract-stream) interface.


