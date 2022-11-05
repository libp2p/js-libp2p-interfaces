# @libp2p/interface-keychain <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-interfaces.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-interfaces)
[![CI](https://img.shields.io/github/workflow/status/libp2p/js-libp2p-interfaces/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/libp2p/js-libp2p-interfaces/actions/workflows/js-test-and-release.yml)

> Keychain interface for libp2p

## Table of contents <!-- omit in toc -->

- - [Install](#install)
- [Modules that implement the interface](#modules-that-implement-the-interface)
- [Badge](#badge)
- [How to use the battery of tests](#how-to-use-the-battery-of-tests)
  - [Node.js](#nodejs)
- [API](#api)
  - - [findProviders](#findproviders)
    - [provide](#provide)
  - [License](#license)
  - [Contribute](#contribute)

## Install

```console
$ npm i @libp2p/interface-keychain
```

The primary goal of this module is to enable developers to pick and swap their Content Routing module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and interface-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

# Modules that implement the interface

- [JavaScript libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
- [JavaScript libp2p-delegated-content-routing](https://github.com/libp2p/js-libp2p-delegated-content-routing)

# Badge

Include this badge in your readme if you make a module that is compatible with the interface-content-routing API. You can validate this by running the tests.

![](img/badge.png)

# How to use the battery of tests

## Node.js

TBD

# API

A valid (read: that follows this abstraction) Content Routing module must implement the following API.

### findProviders

- `findProviders(cid)`

Find peers in the network that can provide a specific value, given a key.

**Parameters**

- [CID](https://github.com/multiformats/js-cid)

**Returns**

It returns an `AsyncIterable` containing the identification and addresses of the peers providing the given key, as follows:

`AsyncIterable<{ id: PeerId, multiaddrs: Multiaddr[] }>`

### provide

- `provide(cid)`

Announce to the network that we are providing the given value.

**Parameters**

- [CID](https://github.com/multiformats/js-cid)

**Returns**

It returns a promise that is resolved on the success of the operation.

`Promise<void>`

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
