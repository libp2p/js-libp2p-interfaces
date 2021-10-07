interface-value-store
=====================

**WIP: This module is not yet implemented**

> A test suite and interface you can use to implement a Value Store module for libp2p.

A Value Store is a key/value storage interface that may be used to provide libp2p services such as Content Routing, service advertisment, etc.

The primary goal of this module is to enable developers to pick and swap their Value Store module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and interface-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

# Modules that implement the interface

- [JavaScript libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
- [JavaScript libp2p-delegated-content-routing](https://github.com/libp2p/js-libp2p-delegated-content-routing)
  - provided by the `DelegatedValueStore` class

# How to use the battery of tests

## Node.js

TBD

# API

A valid (read: that follows this abstraction) Content Routing module must implement the following API.

### put

- `put(key, value, options)`

Associate a value with the given key.

**Parameters**
- `key`: `Uint8Array` - the key used to identify the value.
- `value`: `Uint8Array` - the value to associate with the key.
- `options`: `object | undefined`
- `options.timeout`: `number` - timeout in ms.

Note that implementations may specify additional options, and must ignore unknown options.

**Returns**

A `Promise<void>` that will resolve with no value on success, or fail with an `Error` if something goes wrong.

### get

- `get(key, options)`

Fetch the value for the given key.

**Parameters**
- `key`: `Uint8Array` - the key used to identify the value.
- `options`: `object | undefined`
- `options.timeout`: `number` - timeout in ms.

Note that implementations may specify additional options, and must ignore unknown options.

**Returns**

A `Promise<GetValueResult>` that resolves with an object of the following shape on success:

```js
{
  from: PeerId,
  val: Uint8Array,
}
```
