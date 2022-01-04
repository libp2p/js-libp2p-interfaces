# libp2p-connection <!-- omit in toc -->

> Contains an implementation of the [Connection](https://github.com/libp2p/js-libp2p-interfaces/blob/master/packages/libp2p-interfaces/src/connection/index.ts) interface

## Table of contents <!-- omit in toc -->

- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Usage

```console
npm i libp2p-connection
```

```javascript
import { Connection } from '@libp2p/connection'

const connection = new Connection({ ... })
const stream = connection.newStream([ '/my-protocol/v1.0.0' ])
```

## Contribute

The libp2p implementation in JavaScript is a work in progress. As such, there are a few things you can do right now to help out:

 - Go through the modules and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS/libp2p may be required, as well as the infrastructure behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
 - **Perform code reviews**. More eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
 - **Add tests**. There can never be enough tests.

## License

[Apache-2.0](LICENSE-APACHE) or [MIT](LICENSE-MIT) © Protocol Labs