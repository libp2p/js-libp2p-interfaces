## [@libp2p/interface-connection-v3.0.2](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-connection-v3.0.1...@libp2p/interface-connection-v3.0.2) (2022-09-21)


### Dependencies

* update @multiformats/multiaddr to 11.0.0 ([#288](https://github.com/libp2p/js-libp2p-interfaces/issues/288)) ([57b2ad8](https://github.com/libp2p/js-libp2p-interfaces/commit/57b2ad88edfc7807311143791bc49270b1a81eaf))

## [@libp2p/interface-connection-v3.0.1](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-connection-v3.0.0...@libp2p/interface-connection-v3.0.1) (2022-08-10)


### Bug Fixes

* revert connection encryption change to accept Uint8ArrayLists ([#280](https://github.com/libp2p/js-libp2p-interfaces/issues/280)) ([03d763c](https://github.com/libp2p/js-libp2p-interfaces/commit/03d763c1a6b168bba001783a1fb59af3f7d4e205))

## [@libp2p/interface-connection-v3.0.0](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-connection-v2.1.1...@libp2p/interface-connection-v3.0.0) (2022-08-07)


### ⚠ BREAKING CHANGES

* change stream muxer interface (#279)
* change connection encryption interface to uint8arraylist (#278)

### Features

* change connection encryption interface to uint8arraylist ([#278](https://github.com/libp2p/js-libp2p-interfaces/issues/278)) ([1fa580c](https://github.com/libp2p/js-libp2p-interfaces/commit/1fa580c5a45325dc9384738e9a78a238eabb81c3))
* change stream muxer interface ([#279](https://github.com/libp2p/js-libp2p-interfaces/issues/279)) ([1ebe269](https://github.com/libp2p/js-libp2p-interfaces/commit/1ebe26988b6a286f36a4fc5177f502cfb60368a1))


### Trivial Changes

* update project config ([#271](https://github.com/libp2p/js-libp2p-interfaces/issues/271)) ([59c0bf5](https://github.com/libp2p/js-libp2p-interfaces/commit/59c0bf5e0b05496fca2e4902632b61bb41fad9e9))

## [@libp2p/interface-connection-v2.1.1](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-connection-v2.1.0...@libp2p/interface-connection-v2.1.1) (2022-06-27)


### Trivial Changes

* update deps ([#262](https://github.com/libp2p/js-libp2p-interfaces/issues/262)) ([51edf7d](https://github.com/libp2p/js-libp2p-interfaces/commit/51edf7d9b3765a6f75c915b1483ea345d0133a41))

## [@libp2p/interface-connection-v2.1.0](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-connection-v2.0.0...@libp2p/interface-connection-v2.1.0) (2022-06-21)


### Features

* add direction to StreamMuxerInit ([#253](https://github.com/libp2p/js-libp2p-interfaces/issues/253)) ([6d34d75](https://github.com/libp2p/js-libp2p-interfaces/commit/6d34d755ff4e798d52945f1f099052bdd6a83f2b))

## [@libp2p/interface-connection-v2.0.0](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-connection-v1.0.1...@libp2p/interface-connection-v2.0.0) (2022-06-16)


### ⚠ BREAKING CHANGES

* The Connection and Stream APIs have been updated

### Features

* store stream data on the stream, track the stream direction ([#245](https://github.com/libp2p/js-libp2p-interfaces/issues/245)) ([6d74d2f](https://github.com/libp2p/js-libp2p-interfaces/commit/6d74d2f9f344fb4d6741ba0d35263ebe351a4c65))

## [@libp2p/interface-connection-v1.0.1](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-connection-v1.0.0...@libp2p/interface-connection-v1.0.1) (2022-06-14)


### Trivial Changes

* **release:** 1.0.0 [skip ci] ([0005492](https://github.com/libp2p/js-libp2p-interfaces/commit/0005492cc5958d261017f6db5fe1073b83b46265)), closes [#226](https://github.com/libp2p/js-libp2p-interfaces/issues/226) [#234](https://github.com/libp2p/js-libp2p-interfaces/issues/234) [#233](https://github.com/libp2p/js-libp2p-interfaces/issues/233)

## @libp2p/interface-connection-v1.0.0 (2022-06-14)


### ⚠ BREAKING CHANGES

* most modules have been split out of the `@libp2p/interfaces` and `@libp2p/interface-compliance-tests` packages

### Trivial Changes

* break modules apart ([#232](https://github.com/libp2p/js-libp2p-interfaces/issues/232)) ([385614e](https://github.com/libp2p/js-libp2p-interfaces/commit/385614e772329052ab17415c8bd421f65b01a61b)), closes [#226](https://github.com/libp2p/js-libp2p-interfaces/issues/226)
* release [skip ci] ([357286d](https://github.com/libp2p/js-libp2p-interfaces/commit/357286df899899cf7a94348aeb8dd7387f7acad5))
* update aegir ([#234](https://github.com/libp2p/js-libp2p-interfaces/issues/234)) ([3e03895](https://github.com/libp2p/js-libp2p-interfaces/commit/3e038959ecab6cfa3585df9ee179c0af7a61eda5))
* update readmes ([#233](https://github.com/libp2p/js-libp2p-interfaces/issues/233)) ([ee7da38](https://github.com/libp2p/js-libp2p-interfaces/commit/ee7da38dccc08160d26c8436df8739ce7e0b340e))
