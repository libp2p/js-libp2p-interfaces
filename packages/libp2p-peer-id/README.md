# libp2p-peer-id <!-- omit in toc -->

> peer-ids in JavaScript

## Table of Contents <!-- omit in toc -->

- [Description](#description)
- [Example](#example)
- [Installation](#installation)
  - [License](#license)
    - [Contribution](#contribution)

# Description

A basic implementation of a peer id

# Example

```JavaScript
import { PeerId } from '@libp2p/peer-id'

const id = new PeerId(...)

console.log(id.toCid())
```

# Installation

```console
$ npm i libp2p-peer-id
```

## License

Licensed under either of

 * Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / http://www.apache.org/licenses/LICENSE-2.0)
 * MIT ([LICENSE-MIT](LICENSE-MIT) / http://opensource.org/licenses/MIT)

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
