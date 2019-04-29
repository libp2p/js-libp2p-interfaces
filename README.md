interface-transport
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![](https://img.shields.io/travis/libp2p/interface-transport.svg?style=flat-square)](https://travis-ci.com/libp2p/interface-transport)
[![Dependency Status](https://david-dm.org/libp2p/interface-transport.svg?style=flat-square)](https://david-dm.org/libp2p/interface-transport)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> A test suite and interface you can use to implement a libp2p transport. A libp2p transport is understood as something that offers a dial and listen interface.

The primary goal of this module is to enable developers to pick and swap their transport module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store, interface-stream-muxer and others.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The purpose of this interface is not to reinvent any wheels when it comes to dialing and listening to transports. Instead, it tries to provide a uniform API for several transports through a shimmed interface.

The API is presented with both Node.js and Go primitives, however there are no actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

## Lead Maintainer

[Jacob Heun](https://github.com/jacobheun/)

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
    setup () {
      let transport = new YourTransport()

      const addrs = [
        multiaddr('valid-multiaddr-for-your-transport'),
        multiaddr('valid-multiaddr2-for-your-transport')
      ]

      const network = require('my-network-lib')
      const connect = network.connect
      const connector = {
        delay (delayMs) {
          // Add a delay in the connection mechanism for the transport
          // (this is used by the dial tests)
          network.connect = (...args) => setTimeout(() => connect(...args), delayMs)
        },
        restore () {
          // Restore the connection mechanism to normal
          network.connect = connect
        }
      }

      return { transport, addrs, connector }
    },
    teardown () {
      // Clean up any resources created by setup()
    }
  })
})
```

## Go

> WIP

# API

A valid transport (one that follows the interface defined) must implement the following API:

**Table of contents:**

- type: `Transport`
  - `new Transport([options])`
  - `<Promise> transport.dial(multiaddr, [options])`
  - `transport.createListener([options], handlerFunction)`
  - type: `transport.Listener`
    - event: 'listening'
    - event: 'close'
    - event: 'connection'
    - event: 'error'
    - `<Promise> listener.listen(Array<multiaddr>)`
    - `listener.getAddrs()`
    - `<Promise> listener.close([options])`

### Creating a transport instance

- `JavaScript` - `const transport = new Transport([options])`

Creates a new Transport instance. `options` is an optional JavaScript object that should include the necessary parameters for the transport instance.

**Note: Why is it important to instantiate a transport -** Some transports have state that can be shared between the dialing and listening parts. For example with libp2p-webrtc-star, in order to dial a peer, the peer must be part of some signaling network that is shared with the listener.

### Dial to another peer

- `JavaScript` - `const conn = await transport.dial(multiaddr, [options])`

This method uses a transport to dial a Peer listening on `multiaddr`.

`multiaddr` must be of the type [`multiaddr`](https://www.npmjs.com/multiaddr).

`[options]` the options that may be passed to the dial. Must support the `signal` option (see below)

`conn` must implement the [interface-connection](https://github.com/libp2p/interface-connection) interface.

The dial may throw an `Error` instance if there was a problem connecting to the `multiaddr`.

### Canceling a dial

Dials may be cancelled using an `AbortController`:

```Javascript
const AbortController = require('abort-controller')
const { AbortError } = require('interface-transport')
const controller = new AbortController()
try {
  const conn = await mytransport.dial(ma, { signal: controller.signal })
  // Do stuff with conn here ...
} catch (err) {
  if(err.code === AbortError.code) {
    // Dial was aborted, just bail out
    return
  }
  throw err
}

// ----
// In some other part of the code:
  controller.abort()
// ----
```

### Create a listener

- `JavaScript` - `const listener = transport.createListener([options], handlerFunction)`

This method creates a listener on the transport.

`options` is an optional object that contains the properties the listener must have, in order to properly listen on a given transport/socket.

`handlerFunction` is a function called each time a new connection is received. It must follow the following signature: `function (conn) {}`, where `conn` is a connection that follows the [`interface-connection`](https://github.com/diasdavid/interface-connection).

The listener object created may emit the following events:

- `listening` - when the listener is ready for incoming connections
- `close` - when the listener is closed
- `connection` - (`conn`) each time an incoming connection is received
- `error` - (`err`) each time there is an error on the connection

### Start a listener

- `JavaScript` - `await listener.listen(Array<multiaddr>)`

This method puts the listener in `listening` mode, waiting for incoming connections.

`Array<multiaddr>` is an array of the addresses that the listener should bind to.

### Get listener addrs

- `JavaScript` - `listener.getAddrs()`

This method returns the addresses on which this listener is listening. Useful when listening on port 0 or any interface (0.0.0.0).

### Stop a listener

- `JavaScript` - `await listener.close([options])`

This method closes the listener so that no more connections can be opened on this transport instance.

`options` is an optional object that may contain the following properties:

  - `timeout` - A timeout value (in ms) after which all connections on this transport will be destroyed if the transport is not able to close gracefully. (e.g { timeout: 1000 })
