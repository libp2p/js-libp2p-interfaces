interface-peer-routing
=====================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> A test suite and interface you can use to implement a Peer Routing module for libp2p.

The primary goal of this module is to enable developers to pick and swap their Peer Routing module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and interface-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

# Modules that implement the interface

- [JavaScript libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
- [JavaScript libp2p-delegated-peer-routing](https://github.com/libp2p/js-libp2p-delegated-peer-routing)
- [JavaScript libp2p-kad-routing](https://github.com/libp2p/js-libp2p-kad-routing)

# Badge

Include this badge in your readme if you make a module that is compatible with the interface-record-store API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/libp2p/interface-peer-routing/master/img/badge.png)

# How to use the battery of tests

## Node.js

```javascript
var tape = require('tape')
var tests = require('interface-peer-routing/tests')
var YourPeerRouter = require('../src')

var common = {
    setup: function (t, cb) {
      cb(null, YourPeerRouter)
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

A valid (read: that follows this abstraction) Peer Routing module must implement the following API.

### `.findPeers` - Find peers 'responsible' or 'closest' to a given key

- `Node.js` peerRouting.findPeers(key, function (err, peersPriorityQueue) {})

In a peer to peer context, the concept of 'responsability' or 'closeness' for a given key translates to having a way to find deterministically or that at least there is a significant overlap between searches, the same group of peers when searching for the same given key.

This method will query the network (route it) and return a Priority Queue datastructe with a list of PeerInfo objects, ordered by 'closeness'.

key is a multihash
