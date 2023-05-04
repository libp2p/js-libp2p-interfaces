# js-libp2p-interfaces <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-interfaces.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-interfaces)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-interfaces/js-test-and-release.yml?branch=master\&style=flat-square)](https://github.com/libp2p/js-libp2p-interfaces/actions/workflows/js-test-and-release.yml?query=branch%3Amaster)

> Contains test suites and interfaces you can use to implement the various components of libp2p

## Table of contents <!-- omit in toc -->

- [Structure](#structure)
- [API Docs](#api-docs)
- [License](#license)
- [Contribution](#contribution)

## Structure

- [`/packages/interface-address-manager`](./packages/interface-address-manager) Address Manager interface for libp2p
- [`/packages/interface-compliance-tests`](./packages/interface-compliance-tests) Compliance tests for JS libp2p interfaces
- [`/packages/interface-connection`](./packages/interface-connection) Connection interface for libp2p
- [`/packages/interface-connection-compliance-tests`](./packages/interface-connection-compliance-tests) Compliance tests for implementations of the libp2p Connection interface
- [`/packages/interface-connection-encrypter`](./packages/interface-connection-encrypter) Connection Encrypter interface for libp2p
- [`/packages/interface-connection-encrypter-compliance-tests`](./packages/interface-connection-encrypter-compliance-tests) Compliance tests for implementations of the libp2p Connection Encrypter interface
- [`/packages/interface-connection-gater`](./packages/interface-connection-gater) Connection gater interface for libp2p
- [`/packages/interface-connection-manager`](./packages/interface-connection-manager) Connection Manager interface for libp2p
- [`/packages/interface-content-routing`](./packages/interface-content-routing) Content routing interface for libp2p
- [`/packages/interface-dht`](./packages/interface-dht) DHT interface for libp2p
- [`/packages/interface-keychain`](./packages/interface-keychain) Keychain interface for libp2p
- [`/packages/interface-keys`](./packages/interface-keys) Keys interface for libp2p
- [`/packages/interface-libp2p`](./packages/interface-libp2p) The interface implemented by a libp2p node
- [`/packages/interface-metrics`](./packages/interface-metrics) Metrics interface for libp2p
- [`/packages/interface-mocks`](./packages/interface-mocks) Mock implementations of several libp2p interfaces
- [`/packages/interface-peer-discovery`](./packages/interface-peer-discovery) Peer Discovery interface for libp2p
- [`/packages/interface-peer-discovery-compliance-tests`](./packages/interface-peer-discovery-compliance-tests) Compliance tests for implementations of the libp2p Peer Discovery interface
- [`/packages/interface-peer-id`](./packages/interface-peer-id) Peer Identifier interface for libp2p
- [`/packages/interface-peer-info`](./packages/interface-peer-info) Peer Info interface for libp2p
- [`/packages/interface-peer-routing`](./packages/interface-peer-routing) Peer Routing interface for libp2p
- [`/packages/interface-peer-store`](./packages/interface-peer-store) Peer Store interface for libp2p
- [`/packages/interface-pubsub`](./packages/interface-pubsub) PubSub interface for libp2p
- [`/packages/interface-pubsub-compliance-tests`](./packages/interface-pubsub-compliance-tests) Compliance tests for implementations of the libp2p PubSub interface
- [`/packages/interface-record`](./packages/interface-record) Record interface for libp2p
- [`/packages/interface-record-compliance-tests`](./packages/interface-record-compliance-tests) Compliance tests for implementations of the libp2p Record interface
- [`/packages/interface-registrar`](./packages/interface-registrar) Registrar interface for libp2p
- [`/packages/interface-stream-muxer`](./packages/interface-stream-muxer) Stream Muxer interface for libp2p
- [`/packages/interface-stream-muxer-compliance-tests`](./packages/interface-stream-muxer-compliance-tests) Compliance tests for implementations of the libp2p Stream Muxer interface
- [`/packages/interface-transport`](./packages/interface-transport) Transport interface for libp2p
- [`/packages/interface-transport-compliance-tests`](./packages/interface-transport-compliance-tests) Compliance tests for implementations of the libp2p Transport interface
- [`/packages/interfaces`](./packages/interfaces) Common code shared by the various libp2p interfaces

## API Docs

- <https://libp2p.github.io/js-libp2p-interfaces>

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
