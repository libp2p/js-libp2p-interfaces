interface-pubsub
==================

The `interface-pubsub` contains the base implementation for a libp2p pubsub router implementation. This interface should be used to implement a pubsub router compatible with libp2p. It includes a test suite that pubsub routers should run, in order to ensure compatibility with libp2p.

## Implementations using this base protocol

You can use the following implementations as examples for building your own pubsub router.

- [libp2p/js-libp2p-floodsub](https://github.com/libp2p/js-libp2p-floodsub)
- [ChainSafe/js-libp2p-gossipsub](https://github.com/ChainSafe/js-libp2p-gossipsub)

## Interface usage

`interface-pubsub` abstracts the implementation protocol registration within `libp2p` and takes care of all the protocol connections. This way, a pubsub implementation can focus on its routing algorithm, instead of also needing to create the setup for it.

A pubsub router implementation should start by extending the `interface-pubsub` class and **MUST** override the `_processMessages`, `publish`, `subscribe`, `unsubscribe` and `getTopics` functions, according to the router algorithms.

Other functions, such as `_onPeerConnected`, `_onPeerDisconnected`, `_addPeer`, `_removePeer`, `start` and `stop` may be overwritten if the pubsub implementation needs to customize their logic. Implementations overriding  `start` and `stop` **MUST** call `super`. The `start` function is responsible for registering the pubsub protocol with libp2p, while the `stop` function is responsible for unregistering the pubsub protocol and closing pubsub connections.

All the remaining functions **MUST NOT** be overwritten.

The following example aims to show how to create your pubsub implementation extending this base protocol. The pubsub implementation will handle the subscriptions logic.

```JavaScript
const Pubsub = require('libp2p-pubsub')

class PubsubImplementation extends Pubsub {
  constructor({ peerId, registrar, ...options })
    super({
      debugName: 'libp2p:pubsub',
      multicodecs: '/pubsub-implementation/1.0.0',
      peerId: peerId,
      registrar: registrar,
      signMessages: options.signMessages,
      strictSigning: options.strictSigning
    })
  }

  _processMessages(idB58Str, conn, peer) {
    // Required to be implemented by the subclass
    // Process each message accordingly
  }

  publish() {
    // Required to be implemented by the subclass
  }

  subscribe() {
    // Required to be implemented by the subclass
  }

  unsubscribe() {
    // Required to be implemented by the subclass
  }

  getTopics() {
    // Required to be implemented by the subclass
  }
}
```

## API

The interface aims to specify a common interface that all pubsub router implementation should follow.

### Start

Starts the pubsub subsystem. The protocol will be registered to `libp2p`, which will result in pubsub being notified when peers who support the protocol connect/disconnect to `libp2p`.

#### `pubsub.start()`

##### Returns

| Type | Description |
|------|-------------|
| `Promise<void>` | resolves once pubsub starts |

### Stop

Stops the pubsub subsystem. The protocol will be unregistered from `libp2p`, which will remove all listeners for the protocol and the established connections will be closed.

#### `pubsub.stop()`

##### Returns

| Type | Description |
|------|-------------|
| `Promise<void>` | resolves once pubsub stops |

### Publish

Publish data message to pubsub topics.

#### `pubsub.publish(topics, message)`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| topics | `Array<string>|string` | set of pubsub topics |
| message | `Uint8Array` | message to publish |

##### Returns

| Type | Description |
|------|-------------|
| `Promise<void>` | resolves once the message is published to the network |

### Subscribe

Subscribe to the given topic(s).

#### `pubsub.subscribe(topics, [handler])`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| topics | `Array<string>|string` | set of pubsub topics |
| [handler] | `function (msg)` | handler for messages received in the given topics |

### Unsubscribe

Unsubscribe from the given topic(s).

#### `pubsub.unsubscribe(topics, [handler])`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| topics | `Array<string>|string` | set of pubsub topics |
| [handler] | `function (msg)` | handler for messages received in the given topics |

If **NO** `handler` is provided, all registered handlers to the given topics will be removed.

### Get Topics

Get the list of topics which the peer is subscribed to.

#### `pubsub.getTopics()`

##### Returns

| Type | Description |
|------|-------------|
| `Array<String>` | Array of subscribed topics |

### Get Peers Subscribed to a topic

Get a list of the [PeerId](https://github.com/libp2p/js-peer-id) strings that are subscribed to one topic.

#### `pubsub.getSubscribers(topic)`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| topic | `string` | pubsub topic |

##### Returns

| Type | Description |
|------|-------------|
| `Array<string>` | Array of base-58 PeerId's |

### Validate

Validates the signature of a message.

#### `pubsub.validate(message)`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| message | `Message` | a pubsub message |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<void>` | resolves if the message is valid |

## Test suite usage

```js
'use strict'

const tests = require('libp2p-interfaces/src/pubsub/tests')
const YourPubsubRouter = require('../src')

describe('compliance', () => {
  let peers
  let pubsubNodes = []

  tests({
    async setup (number = 1, options = {}) {
      // Create number pubsub nodes with libp2p
      peers = await createPeers({ number })

      peers.forEach((peer) => {
        const ps = new YourPubsubRouter(peer, options)

        pubsubNodes.push(ps)
      })

      return pubsubNodes
    },
    async teardown () {
      // Clean up any resources created by setup()
      await Promise.all(pubsubNodes.map(ps => ps.stop()))
      peers.length && await Promise.all(peers.map(peer => peer.stop()))
    }
  })
})
```
