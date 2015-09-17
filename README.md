abstract-transport
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a transport. A transport is understood as something that offers a dial+listen interface

The primary goal of this module is to enable developers to pick and swap their Record Store module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and abstract-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The purpose of this abstraction is not to reinvent any wheels when it comes to dialing and listening to transports, instead, it tries to uniform several transports through a shimmed interface.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

# Modules that implement the interface

- [node-libp2p-tcp](https://github.com/diasdavid/node-libp2p-tcp)

note: for any new given implementation that adds one more option to the multiaddr space that was not expected yet, the respective multiaddr should be added to the PeerInfo objects available on the tests, so that implementation can be properly tested.

# Badge

Include this badge in your readme if you make a module that is compatible with the abstract-transport API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/diasdavid/abstract-transport/master/img/badge.png)

# How to use the battery of tests

## Node.js

```
var tape = require('tape')
var tests = require('abstract-transport/tests')
var YourTransportHandler = require('../src')

var common = {
  setup: function (t, cb) {
    cb(null, YourTransportHandler)
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

A valid (read: that follows this abstraction) transport, must implement the following API.

### Dialing to another Peer

- `Node.js` var stream = transport.dial(multiaddr, [options])

This method dials a transport to the Peer referenced by the peerInfo object.

multiaddr must be of the type [`multiaddr`](http://npmjs.org/multiaddr).

`stream` must implements the [abstract-connection](https://github.com/diasdavid/abstract-connection) interface.

`[options]` are not mandatory fields for all the implementations that might be passed for certain implementations for them to work (e.g. a Signalling Server for a WebRTC transport implementation)

### Listening for incoming transports from other Peers

- `Node.js` var listener = transport.createListener(options, function (stream) {})

This method waits and listens for incoming transports by other peers.

`stream` must be a stream that implements the [abstract-connection](https://github.com/diasdavid/abstract-connection) interface.

Options are the properties this listener must have access in order to properly listen on a given transport/socket

### Start listening

- `Node.js` listener.listen(options, [callback])

This method opens the listener to start listening for incoming transports

### Close an active listener

- `Node.js` listener.close([callback])

This method closes the listener so that no more connections can be open on this transport instance

`callback` is function that gets called when the listener is closed. It is optional

