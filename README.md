<p align="middle">
    <img src="https://www.rifos.org/assets/img/logo.svg" alt="logo" height="100" >
</p>
<h3 align="middle"><code>rns-js-resolver</code></h3>
<p align="middle">
    RNS Node.js SDK
</p>
<p align="middle">
    <a href="https://circleci.com/gh/rnsdomains/rns-js-resolver">
        <img src="https://circleci.com/gh/rnsdomains/rns-js-resolver.svg?style=svg" alt="CircleCI" />
    </a>
    <a href="https://badge.fury.io/js/%40rnsdomains%2Frns-sdk-js">
        <img src="https://badge.fury.io/js/%40rnsdomains%2Frns-sdk-js.svg" alt="logo" />
    </a>
</p>

Implementations for local resolvers for the RIF Name Service, available for Node.js.

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
