interface-peer-discovery
========================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> A test suite and interface you can use to implement a Peer Discovery module for libp2p.

The primary goal of this module is to enable developers to pick and/or swap their Peer Discovery modules as they see fit for their application, without having to go through shims or compatibility issues. This module and test suite was heavily inspired by [abstract-blob-store](https://github.com/maxogden/abstract-blob-store).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

## Modules that implement the interface

- [JavaScript libp2p-mdns](https://github.com/libp2p/js-libp2p-mdns)
- [JavaScript libp2p-railing](https://github.com/libp2p/js-libp2p-railing)
- [JavaScript libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
- [JavaScript libp2p-webrtc-star](https://github.com/libp2p/js-libp2p-webrtc-star)
- [JavaScript libp2p-websocket-star](https://github.com/libp2p/js-libp2p-websocket-star)

Send a PR to add a new one if you happen to find or write one.

## Badge

Include this badge in your readme if you make a new module that uses interface-peer-discovery API.

![](/img/badge.png)

## Usage

### Node.js

Install `interface-peer-discovery` as one of the dependencies of your project and as a test file. Then, using `mocha` (for JavaScript) or a test runner with compatible API, do:

```js
const test = require('interface-peer-discovery')

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

> WIP - go-libp2p does not have a test suite available for Peer Discovery yet.

## API

A valid (read: that follows this abstraction) Peer Discovery module must implement the following API:

### `start` the service

- `JavaScript` discovery.start(callback)
- `Go` NA

### `stop` the service

- `JavaScript` discovery.stop(callback)
- `Go` NA

### discoverying peers

- `JavaScript` discovery.on('peer', function (peerInfo) {})
- `Go` NA
