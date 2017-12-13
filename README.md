interface-transport
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a libp2p transport. A libp2p transport is understood as something that offers a dial and listen interface.

The primary goal of this module is to enable developers to pick and swap their transport module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store, interface-stream-muxer and others.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The purpose of this interface is not to reinvent any wheels when it comes to dialing and listening to transports. Instead, it tries to uniform several transports through a shimmed interface.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

# Modules that implement the interface

- [js-libp2p-tcp](https://github.com/libp2p/js-libp2p-tcp)
- [js-libp2p-webrtc-star](https://github.com/libp2p/js-libp2p-webrtc-star)
- [js-libp2p-webrtc-direct](https://github.com/libp2p/js-libp2p-webrtc-direct)
- [js-libp2p-websocket-star](https://github.com/libp2p/js-libp2p-websocket-star)
- [js-libp2p-websockets](https://github.com/libp2p/js-libp2p-websockets)
- [js-libp2p-utp](https://github.com/libp2p/js-libp2p-utp)
- [webrtc-explorer](https://github.com/diasdavid/webrtc-explorer)

# Badge

Include this badge in your readme if you make a module that is compatible with the interface-transport API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/diasdavid/interface-transport/master/img/badge.png)

# How to use the battery of tests

## Node.js

```js
/* eslint-env mocha */
'use strict'

const tests = require('interface-transport')
const multiaddr = require('multiaddr')
const YourTransport = require('../src')

describe('compliance', () => {
  tests({
    setup (cb) {
      let t = new YourTransport()
      const addrs = [
        multiaddr('valid-multiaddr-for-your-transport'),
        multiaddr('valid-multiaddr2-for-your-transport')
      ]
      cb(null, t, addrs)
    },
    teardown (cb) {
      cb()
    }
  })
})
```

## Go

> WIP

# API

A valid (read: that follows the interface defined) transport, must implement the following API.

**Table of contents:**

- type: `Transport`
  - `new Transport([options])`
  - `transport.dial(multiaddr, [options, callback])`
  - `transport.createListener([options], handlerFunction)`
  - type: `transport.Listener`
    - event: 'listening'
    - event: 'close'
    - event: 'connection'
    - event: 'error'
    - `listener.listen(multiaddr, [callback])`
    - `listener.getAddrs(callback)`
    - `listener.close([options])`

### Creating a transport instance

- `JavaScript` - `var transport = new Transport([options])`

Creates a new Transport instance. `options` is a optional JavaScript object, might include the necessary parameters for the transport instance.

**Note: Why is it important to instantiate a transport -** Some transports have state that can be shared between the dialing and listening parts. One example is a libp2p-webrtc-star (or pretty much any other WebRTC flavour transport), where that, in order to dial, a peer needs to be part of some signalling network that is shared also with the listener.

### Dial to another peer

- `JavaScript` - `var conn = transport.dial(multiaddr, [options, callback])`

This method dials a transport to the Peer listening on `multiaddr`.

`multiaddr` must be of the type [`multiaddr`](https://www.npmjs.com/multiaddr).

`stream` must implements the [interface-connection](https://github.com/libp2p/interface-connection) interface.

`[options]` is an optional argument, which can be used by some implementations

`callback` should follow the `function (err)` signature.

`err` is an `Error` instance to signal that the dial was unsuccessful, this error can be a 'timeout' or simply 'error'.

### Create a listener

- `JavaScript` - `var listener = transport.createListener([options], handlerFunction)`

This method creates a listener on the transport.

`options` is an optional object that contains the properties the listener must have, in order to properly listen on a given transport/socket.

`handlerFunction` is a function called each time a new connection is received. It must follow the following signature: `function (conn) {}`, where `conn` is a connection that follows the [`interface-connection`](https://github.com/diasdavid/interface-connection).

The listener object created, can emit the following events:

- `listening` -
- `close` -
- `connection` -
- `error` -

### Start a listener

- `JavaScript` - `listener.listen(multiaddr, [callback])`

This method puts the listener in `listening` mode, waiting for incoming connections.

`multiaddr` is the address where the listener should bind to.

`callback` is a function called once the listener is ready.

### Get listener addrs

- `JavaScript` - `listener.getAddrs(callback)`

This method retrieves the addresses in which this listener is listening. Useful for when listening on port 0 or any interface (0.0.0.0).

### Stop a listener

- `JavaScript` - `listener.close([options, callback])`

This method closes the listener so that no more connections can be open on this transport instance.

`options` is an optional object that might contain the following properties:

  - `timeout` - A timeout value (in ms) that fires and destroys all the connections on this transport if the transport is not able to close graciously. (e.g { timeout: 1000 })

`callback` is function that gets called when the listener is closed. It is optional.
