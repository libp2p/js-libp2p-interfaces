interface-topology
========================

> Implementation of the topology interface used by the `js-libp2p` registrar.

This interface has two main purposes. It uniforms the registration of libp2p protocols and enables a smarter connection management.

## Table of Contents

- [Implementations](#implementations)
- [Install](#install)
- [Modules using the interface](#modulesUsingTheInterface)
- [Usage](#usage)
- [Api](#api)

## Implementations

### Topology

A libp2p topology with a group of common peers.

### Multicodec Topology

A libp2p topology with a group of peers that support the same protocol.

## Install

```sh
$ npm install libp2p-interfaces
```

## Modules using the interface

TBA

## Usage

###  Topology

```js
const Topology = require('libp2p-interfaces/src/topology')

const toplogy = new Topology({
  min: 0,
  max: 50
})
```

### Multicodec Topology

```js
const MulticodecTopology = require('libp2p-interfaces/src/topology/multicodec-topology')

const toplogy = new MulticodecTopology({
  min: 0,
  max: 50,
  multicodecs: ['/echo/1.0.0'],
  handlers: {
    onConnect: (peerInfo, conn) => {},
    onDisconnect: (peerInfo) => {}
  }
})

// Needs to set registrar in order to listen for peer changes
topology.registrar = registrar
```

## API

The `MulticodecTopology` extends the `Topology`, which makes the `Topology` API a subset of the `MulticodecTopology` API.

###  Topology

- `Topology`
  - `peers.set<function(id, PeerInfo)>`: Sets a peer in the topology.
  - `disconnect<function(PeerInfo)>`: Disconnects a peer from the topology.

#### Constructor

```js
const toplogy = new Topology({
  min: 0,
  max: 50,
  handlers: {
    onConnect: (peerInfo, conn) => {},
    onDisconnect: (peerInfo) => {}
  }
})
```

**Parameters**
- `properties` is an `Object` containing the properties of the topology.
  - `min` is a `number` with the minimum needed connections (default: 0)
  - `max` is a `number` with the maximum needed connections (default: Infinity)
  - `handlers` is an optional `Object` containing the handler called when a peer is connected or disconnected.
    - `onConnect` is a `function` called everytime a peer is connected in the topology context.
    - `onDisconnect` is a `function` called everytime a peer is disconnected in the topology context.

#### Set a peer

- `topology.peers.set(id, peerInfo)`

Add a peer to the topology.

**Parameters**
- `id` is the `b58string` that identifies the peer to add.
- `peerInfo` is the [PeerInfo][peer-info] of the peer to add.

#### Notify about a peer disconnected event

- `topology.disconnect(peerInfo)`

**Parameters**
- `peerInfo` is the [PeerInfo][peer-info] of the peer disconnected.

###  Multicodec Topology

- `MulticodecTopology`
  - `registrar<Registrar>`: Sets the registrar in the topology.
  - `peers.set<function(id, PeerInfo)>`: Sets a peer in the topology.
  - `disconnect<function(PeerInfo)>`: Disconnects a peer from the topology.

#### Constructor

```js
const toplogy = new MulticodecTopology({
  min: 0,
  max: 50,
  multicodecs: ['/echo/1.0.0'],
  handlers: {
    onConnect: (peerInfo, conn) => {},
    onDisconnect: (peerInfo) => {}
  }
})
```

**Parameters**
- `properties` is an `Object` containing the properties of the topology.
  - `min` is a `number` with the minimum needed connections (default: 0)
  - `max` is a `number` with the maximum needed connections (default: Infinity)
  - `multicodecs` is a `Array<String>` with the multicodecs associated with the topology.
  - `handlers` is an optional `Object` containing the handler called when a peer is connected or disconnected.
    - `onConnect` is a `function` called everytime a peer is connected in the topology context.
    - `onDisconnect` is a `function` called everytime a peer is disconnected in the topology context.

#### Set the registrar

- `topology.registrar = registrar`

Set the registrar the topology, which will be used to gather information on peers being connected and disconnected, as well as their modifications in terms of supported protocols.
