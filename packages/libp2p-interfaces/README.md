# libp2p-interfaces <!-- omit in toc -->

> Contains interfaces you can use to implement the various components of libp2p

## Table of contents <!-- omit in toc -->

- [Interfaces](#interfaces)
- [Origin Repositories](#origin-repositories)
- [Contribute](#contribute)
- [License](#license)

## Interfaces

- [Connection](./src/connection)
- [Content Routing](./src/content-routing)
- [Crypto](./src/crypto)
- [Peer Discovery](./src/peer-discovery)
- [Peer Routing](./src/peer-routing)
- [Pubsub](./src/pubsub)
- [Record](./src/record)
- [Stream Muxer](./src/stream-muxer)
- [Topology](./src/topology)
- [Transport](./src/transport)

## Origin Repositories

For posterity, here are links to the original repositories for each of the interfaces (if they had one).

- [Connection](https://github.com/libp2p/interface-connection)
- [Content Routing](https://github.com/libp2p/interface-content-routing)
- [Peer Discovery](https://github.com/libp2p/interface-peer-discovery)
- [Peer Routing](https://github.com/libp2p/interface-peer-routing)
- [Pubsub](https://github.com/libp2p/js-libp2p-pubsub)
- [Stream Muxer](https://github.com/libp2p/interface-stream-muxer)
- [Transport](https://github.com/libp2p/interface-transport)

## Contribute

The libp2p implementation in JavaScript is a work in progress. As such, there are a few things you can do right now to help out:

 - Go through the modules and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS/libp2p may be required, as well as the infrastructure behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
 - **Perform code reviews**. More eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
 - **Add tests**. There can never be enough tests.

## License

[Apache-2.0](LICENSE-APACHE) or [MIT](LICENSE-MIT) © Protocol Labs
