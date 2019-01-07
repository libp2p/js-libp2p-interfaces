interface-content-routing
=====================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a Content Routing module for libp2p.

The primary goal of this module is to enable developers to pick and swap their Content Routing module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and interface-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

# Modules that implement the interface

- [JavaScript libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
- [JavaScript libp2p-delegated-peer-routing](https://github.com/libp2p/js-libp2p-delegated-peer-routing)
- [JavaScript libp2p-kad-routing](https://github.com/libp2p/js-libp2p-kad-routing)

# Badge

Include this badge in your readme if you make a module that is compatible with the interface-content-routing API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/libp2p/interface-content-routing/master/img/badge.png)

# How to use the battery of tests

## Node.js

```javascript
var tape = require('tape')
var tests = require('interface-content-routing/tests')
var yourImpl = require('../src')

var common = {
    setup: function (t, cb) {
      cb(null, yourImpl)
    },
    teardown: function (t, cb) {
      cb()
    }
}

tests(tape, common)
```

## Go

> WIP - The go-libp2p implementation does not have a test suite to be used, yet.

# API

A valid (read: that follows this abstraction) Content Routing module must implement the following API.

### `.findProviders`

- `JavaScript` peerRouting.findProviders

### `.provide`

- `JavaScript` peerRouting.provide
