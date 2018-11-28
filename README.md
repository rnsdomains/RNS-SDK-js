# RNS-SDK-js


Implementations for local resolvers for the RSK Name Service, available for Node.js backends.



## Testing

To run unit tests, clone this repository.

Install ``Ganache-cli`` for a local blockchain

	$ npm install -g ganache-cli
	$ ganache-cli

Finally opan another terminal and run

    $ npm install
    $ npm test


## Usage and Getting Started
In a Javascript project:

	$ npm install rns-sdk-js

In a JavaScript file:

```
// import RNS's Resolver SDK object.
var Resolver = require('rns-sdk-js');
resolver = new Resolver(web3.currentProvider, resolverAddress, resolverABI);
```

Functions that require communicating with the node return promises, rather than using callbacks. A promise has a `then` function, which takes a callback and will call it when the promise is fulfilled; `then` returns another promise, so you can chain callbacks.

## Contracts

### RNS.sol
Implementation of the RNS Registry, the central contract used to look up resolvers and owners for domains.

### PublicResolver.sol
Simple resolver implementation that allows the owner of any domain to configure how its name should resolve. One deployment of this contract allows any number of people to use it, by setting it as their resolver in the registry.


## Documentation

For more information, see [RNS Docs](https://docs.rns.rsk.co).

# Contributors

- [@m-picco](https://github.com/m-picco)
- [@ajlopez](https://github.com/ajlopez)
- [@julianlen](https://github.com/julianlen)
- [@ilanolkies](https://github.com/ilanolkies)
- [@alebanzas](https://github.com/alebanzas)
