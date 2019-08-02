<img src="/logo.png" alt="logo" height="200" />

# `RNS-SDK-js`

<!-- NPM Version -->
<a href="https://www.npmjs.com/package/@rnsdomains/rns-sdk-js">
	<img src="http://img.shields.io/npm/v/@rnsdomains/rns-sdk-js.svg"
alt="NPM version" />
</a>

Implementations for local resolvers for the RIF Name Service, available for Node.js backends.

## Testing

To run unit tests, clone this repository.

Install ``Ganache-cli`` for a local blockchain

	$ npm install -g ganache-cli
	$ ganache-cli

Finally opan another terminal and run

    $ yarn install
    $ yarn test


## Usage and Getting Started
In a Javascript project:

	$ yarn install @rnsdomains/rns-sdk-js

In a JavaScript file:

```
// import RNS's Resolver SDK object.
var Resolver = require('@rnsdomains/rns-sdk-js');
resolver = new Resolver(web3.currentProvider, resolverAddress, resolverABI);
```

Functions that require communicating with the node return promises, rather than using callbacks. A promise has a `then` function, which takes a callback and will call it when the promise is fulfilled; `then` returns another promise, so you can chain callbacks.

## Contracts

### RNS.sol
Implementation of the RNS Registry, the central contract used to look up resolvers and owners for domains.

### PublicResolver.sol
Simple resolver implementation that allows the owner of any domain to configure how its name should resolve. One deployment of this contract allows any number of people to use it, by setting it as their resolver in the registry.


## Documentation

For more information, see [RNS Docs](https://docs.rns.rifos.org).

# Contributors

- [@m-picco](https://github.com/m-picco)
- [@ajlopez](https://github.com/ajlopez)
- [@julianlen](https://github.com/julianlen)
- [@ilanolkies](https://github.com/ilanolkies)
- [@alebanzas](https://github.com/alebanzas)

---

## Related links

- [RSK](https://rsk.co)
    - [Docs](https://docs.rsk.co)
- [RIF](https://rifos.org)
    - [Docs](https://www.rifos.org/documentation/)
    - [Whitepaper](https://docs.rifos.org/rif-whitepaper-en.pdf)
    - [Testnet faucet](https://faucet.rifos.org)
- RNS
    - [Docs](https://docs.rns.rifos.org)
    - [Manager](https://rns.rifos.org)
    - [Testnet registrar](https://testnet.rns.rifos.org)
