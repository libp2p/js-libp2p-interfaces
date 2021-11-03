# interface-keys <!-- omit in toc -->

> Interfaces for libp2p keys

## Table of Contents <!-- omit in toc -->
- [Using the Test Suite](#using-the-test-suite)

## Using the Test Suite

You can also check out the [internal test suite](../../test/crypto/compliance.spec.js) to see the setup in action.

```js
const tests = require('libp2p-interfaces-compliance-tests/src/keys')
const yourKeys = require('./your-keys')

tests({
  setup () {
    // Set up your keys if needed, then return it
    return yourKeys
  },
  teardown () {
    // Clean up your keys if needed
  }
})
```
