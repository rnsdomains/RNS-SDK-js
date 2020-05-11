<p align="middle">
    <img src="https://www.rifos.org/assets/img/logo.svg" alt="logo" height="100" >
    <h3><code>rns-sdk-js</code></h3>
    <p>
        Implementations for local resolvers for the RIF Name Service, available for Node.js backends.
    </p>
</p>

[![CircleCI](https://circleci.com/gh/rnsdomains/rns-sdk-js.svg?style=svg)](https://circleci.com/gh/rnsdomains/rns-sdk-js)
[![npm version](https://badge.fury.io/js/%40rnsdomains%2Frns-sdk-js.svg)](https://badge.fury.io/js/%40rnsdomains%2Frns-sdk-js)

```
npm i @rsksmart/rns-js-sdk
```

```javascript
const Resolver = require('@rsksmart/rns-js-sdk');

const resolver = new ResolverContract();
```

## Run tests

1. Install [`ganache-cli`](https://github.com/trufflesuite/ganache-cli) with `npm install -g ganache-cli`
2. Run local node with `ganache-cli`
3. Run tests with `npm test`

## Usage

Functions that require communicating with the node return promises, rather than using callbacks. A promise has a `then` function, which takes a callback and will call it when the promise is fulfilled; `then` returns another promise, so you can chain callbacks.

## Contracts

### RNS.sol

Implementation of the RNS Registry, the central contract used to look up resolvers and owners for domains.

### PublicResolver.sol

Simple resolver implementation that allows the owner of any domain to configure how its name should resolve. One deployment of this contract allows any number of people to use it, by setting it as their resolver in the registry.

## Documentation

For more information, [read the docs](https://developers.rsk.co/rif/rns).
