var Web3 = require('web3');
var namehash = require('eth-ens-namehash')
const defaultAbi = require('./json/resolver.json');
const defaultNode = "https://public-node.testnet.rsk.co";
const defaultResolverAddress = "0x59313581e7d735793962e16b8d0b10636bf53ae7"
	
/**
 * @class
 *
 * @description Provides an easy-to-use interface to the RSK Name Service.
 *
 * Example usage:
 *
 *     var Resolver = require('rns-sdk-js')
 *	   resolver = new Resolver(web3.currentProvider, resolverAddress, resolverABI);
 *
 * Functions that require communicating with the node return promises, rather than
 * using callbacks. A promise has a `then` function, which takes a callback and will
 * call it when the promise is fulfilled; `then` returns another promise, so you can
 * chain callbacks.
 *
 * Functions that create transactions also take an optional 'options' argument;
 * this has the same parameters as web3.
 */


class ResolverContract {

	/**
     * Constructor.
     * @param {string} nodeProvider A web3 provider to use to communicate with the blockchain. Defaults to the public RSK node.
	 * @param {string} resolverAddress The address of the RNS Resolver. Defaults to the public RNS Resolver.
	 * @param {string} resolverAbi The abi of the RNS Resolver. Defaults to the public RNS Resolver's abi.
	 * @returns {ResolverContract} 
     */

	constructor(nodeProvider = defaultNode, resolverAddress = defaultResolverAddress, resolverAbi = defaultAbi){
		this.web3 = new Web3(nodeProvider);
		this.address = resolverAddress;	
		this.abi = resolverAbi;
		this.resolverContract = new this.web3.eth.Contract(JSON.parse(this.abi), this.address);
	}

	/**
	 * Returns the address associated with an RNS node.
	 * or 0x00 if address is not set.
	 * @param {string} nameDomain 
	 * @returns {object} A promise for the contract instance.
	 */

	addr(nameDomain) {
		return this.resolverContract.methods.addr(this.getNode(nameDomain)).call();
	}

	/**
	 * Returns true if the specified node has the specified record type.
	 * @param {string} nameDomain The RNS' name domain to query.
     * @param {string} kind The record type name, as specified in RNSIP01.
     * @return {bool} True if this resolver has a record of the provided type on the
     *         provided node.
	 */

	has(nameDomain, kind) {
		return this.resolverContract.methods.has(this.getNode(nameDomain), this.web3.utils.asciiToHex(kind)).call();
	}

	/**
     * Returns true if the resolver implements the interface specified by the provided interfaceID (hash).
     * @param {string} interfaceID The ID (hash) of the interface to check for.
     * @return {bool} True if the contract implements the requested interface.
     */

	supportsInterface(interfaceID) {
		return this.resolverContract.methods.supportsInterface(interfaceID).call();
	}

	/**
     * Sets the address associated with an RNS domain.
     * May only be called by the owner of that node in the RNS registry.
     * @param {string} nameDomain The domain to update.
     * @param {address} addr The address to set.
     * @param fromAccount The spender address
     */

	setAddr(nameDomain, addr, fromAccount){
		return this.resolverContract.methods.setAddr(this.getNode(nameDomain), addr).send({from: fromAccount})
	}

	/**
     * Sets the hash associated with an RNS domain.
     * May only be called by the owner of that node in the RNS registry.
     * @param {string} nameDomain The domain to update.
     * @param hash The address to set.
     * @param {address} fromAccount The spender address
     */

	setContent(nameDomain, hash, fromAccount){
		return this.resolverContract.methods.setContent(this.getNode(nameDomain), hash).send({from: fromAccount})
	}

	/**
	 * Returns the hash associated with an RNS domain.
	 * or 0x00 if hash is not set.
	 * @param {string} nameDomain 
	 * @returns {object} A promise for the contract instance.
	 */
	
	content(nameDomain){
		return this.resolverContract.methods.content(this.getNode(nameDomain)).call();
	}

	/**
	 * Returns the namehash of an RNS domain computed by the Namehash algorithm.
	 * @param {string} nameDomain 
	 * @returns {hash} The name hash
	 */

	getNode (nameDomain) {
		return namehash.hash(nameDomain);
	}
}

module.exports = ResolverContract;