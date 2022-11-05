# @libp2p/interfaces <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-interfaces.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-interfaces)
[![CI](https://img.shields.io/github/workflow/status/libp2p/js-libp2p-interfaces/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/libp2p/js-libp2p-interfaces/actions/workflows/js-test-and-release.yml)

> Common code shared by the various libp2p interfaces

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [AbortError](#aborterror)
  - [Events](#events)
  - [AbortOptions](#abortoptions)
  - [Startable](#startable)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i @libp2p/interfaces
```

## Usage

### AbortError

Throw an error with a `.code` property of `'ABORT_ERR'`:

```js
import { AbortError } from '@libp2p/interfaces/errors'

throw new AbortError()
```

### Events

Typed events:

```js
import { EventEmitter, CustomEvent } from '@libp2p/interfaces/events'

export interface MyEmitterEvents {
  'some-event': CustomEvent<number>;
}

class MyEmitter extends EventEmitter<MyEmitterEvents> {

}

// later
const myEmitter = new MyEmitter()
myEmitter.addEventListener('some-event', (evt) => {
  const num = evt.detail // <-- inferred as number
})
```

### AbortOptions

```js
import type { AbortOptions } from '@libp2p/interfaces'
```

### Startable

Lifecycles for components

```js
import { start, stop, isStartable } from '@libp2p/interfaces/startable'
import type { Startable } from '@libp2p/interfaces/startable'

class MyStartable implements Startable {
  // .. implementation methods
}

const myStartable = new MyStartable()

isStartable(myStartable) // returns true

await start(myStartable)
await stop(myStartable)
```

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
