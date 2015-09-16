abstract-connection
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a connection. A connection is understood as something that offers a dial+listen interface

The primary goal of this module is to enable developers to pick and swap their Record Store module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and abstract-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The purpose of this abstraction is not to reinvent any wheels when it comes to dialing and listening to connections, instead, it tries to uniform several transports through a shimmed interface.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

# Modules that implement the interface

- [node-libp2p-tcp](https://github.com/diasdavid/node-libp2p-tcp)

note: for any new given implementation that adds one more option to the multiaddr space that was not expected yet, the respective multiaddr should be added to the PeerInfo objects available on the tests, so that implementation can be properly tested.

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

### Dialing to another Peer

- `Node.js` var stream = conn.dial(multiaddr, [options])

This method dials a connection to the Peer referenced by the peerInfo object.

multiaddr must be of the type [`multiaddr`](http://npmjs.org/multiaddr).

`stream` must implements the [abstract-transport](https://github.com/diasdavid/abstract-transport) interface.

`[options]` are not mandatory fields for all the implementations that might be passed for certain implementations for them to work (e.g. a Signalling Server for a WebRTC transport/connection implementation)

### Listening for incoming connections from other Peers

- `Node.js` var listener = conn.createListener(options, function (stream) {})

This method waits and listens for incoming connections by other peers.

`stream` must be a stream that implements the [abstract-transport](https://github.com/diasdavid/abstract-transport) interface.

Options are the properties this listener must have access in order to properly listen on a given transport/socket

### Start listening

- `Node.js` listener.listen(options, [callback])

This method opens the listener to start listening for incoming connections

### Close an active listener

- `Node.js` listener.close([callback])

This method closes the listener so that no more connections can be open

`callback` is function that gets called when the listener is closed. It is optional

