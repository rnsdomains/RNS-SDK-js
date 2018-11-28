var assert = require('assert');
var async = require('async');
var fs = require('fs');
var solc = require('solc')
var Web3 = require('web3');
var Resolver = require('./../index.js')
var namehash = require('eth-ens-namehash')
var aHash = "0x89ad40fcd44690fb5aa90e0fa51637c1b2d388f8056d68430d41c8284a6a7d5e";


describe('Resolver', function () {
	var resolver = null;
	var hashForTest = null;
	beforeEach( async () => {
		var web3 = new Web3();
		hashForTest = web3.utils.randomHex(32);
		this.ctx.timeout(20000);
		//web3.setProvider(TestRPC.provider());
		try {
			web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
			accounts = await web3.eth.getAccounts();
			var input = {
				'AbstractRNS.sol' : fs.readFileSync('test/contracts/AbstractRNS.sol').toString(),
				'RNS.sol' : fs.readFileSync('test/contracts/RNS.sol').toString(),
				'ResolverInterface.sol' : fs.readFileSync('test/contracts/ResolverInterface.sol').toString(),
				'PublicResolver.sol' : fs.readFileSync('test/contracts/PublicResolver.sol').toString()
			};
			var compiled = solc.compile({sources:input}, 1);
			assert.equal(compiled.errors, undefined);

			// Deploy the RNS contract
		
			var deployer = compiled.contracts['RNS.sol:RNS'];			
			var deployRNSContract = new web3.eth.Contract(JSON.parse(deployer.interface));
			rnsContract = await deployRNSContract.deploy({
					data: deployer.bytecode
				})
				.send({
					from: accounts[0],
					gas: 6700000,
					gasPrice: 1000000
				});
			if (rnsContract.options.address == undefined) {
				assert.ifError("Contract address is null", contract);
			}
			// Deploy the PublicResolver contract
			deployer = compiled.contracts['PublicResolver.sol:PublicResolver'];
			var resolverABI = fs.readFileSync('json/resolver.json').toString();
			var deployResolverContract = new web3.eth.Contract(JSON.parse(resolverABI));
			resolverContract = await deployResolverContract.deploy({
						data: deployer.bytecode,
						arguments: [rnsContract._address.toString()]
				})
				.send({
					from: accounts[0],
					gas: 6700000,
					gasPrice: 1000000
				});
			resolverAddress = resolverContract.options.address;
			if (resolverAddress == undefined) {
				assert.ifError("Contract address is null", contract);
			}
			var tldHash = web3.utils.sha3('rsk');
			var fooHash = web3.utils.sha3('foo');
			var nodeFooDotRsk = namehash.hash('foo.rsk');
			await rnsContract.methods.setSubnodeOwner(namehash.hash(0), tldHash, accounts[0]).send({from: accounts[0]});
			await rnsContract.methods.setSubnodeOwner(namehash.hash('rsk'), fooHash, accounts[0]).send({from: accounts[0]})
			await rnsContract.methods.setResolver(nodeFooDotRsk, resolverAddress).send({from: accounts[0]});
			await resolverContract.methods.setAddr(nodeFooDotRsk, accounts[0]).send({from: accounts[0]});
			await resolverContract.methods.setContent(nodeFooDotRsk, hashForTest).send({from: accounts[0]});
			resolver = new Resolver(web3.currentProvider, resolverAddress, resolverABI);
		} catch(err) {
			assert.ifError(err);
		}
	});


	it('should implement setAddr', async () => {
		await resolver.setAddr('foo.rsk', accounts[1], accounts[0]);
		result = await resolver.addr('foo.rsk');
		assert.equal(result, accounts[1]);
		
	});
	it('setAddr to not owned address', async () => {
		try {
			await resolver.setAddr('foo.rsk', accounts[1], accounts[0]);
		} catch (ex) {
			const expectedMsg = "VM Exception while processing transaction: revert";
			const msg = typeof ex === "string" ? ex : ex.message;
			assert.ok(msg.indexOf(expectedMsg) != -1);
		}
		
	});
	it('should implement setContent', async () => {
		var testingHash = await resolver.setContent('foo.rsk', aHash, accounts[0]);
		result = await resolver.content('foo.rsk');
		assert.equal(result, aHash);
		
	});
	it('setContent to not owned address', async () => {
		try {
			await resolver.setContent('foo.rsk', aHash, accounts[0]);
		} catch (ex) {
			const expectedMsg = "VM Exception while processing transaction: revert";
			const msg = typeof ex === "string" ? ex : ex.message;
			assert.ok(msg.indexOf(expectedMsg) != -1);
		}
		
	});
	it('should implement has() with addr', async () => {
			result = await resolver.has('foo.rsk', 'addr');
			assert.equal(result, true);
			
	});
	
	it('should implement has() with hash', async () => {
		result = await resolver.has('foo.rsk', 'hash');
		assert.equal(result, true);
		
});
	it('has() with function not implemented', async () => {
		result = await resolver.has('foo.rsk', 'boom');
		assert.equal(result, false);
		
	});

	it('should resolve names', async () => {
		result = await resolver.addr('foo.rsk');
		assert.equal(result, accounts[0]);
	});
	
	it('should resolve content', async () => {
		result = await resolver.content('foo.rsk');
		assert.equal(result, hashForTest);
	});

	it('shouldnt resolve names did not registered', async () => {
		result = await resolver.addr('foo');
		assert.equal(result, 0);
	});
	
	it('should implement supportsInterface', async () => {
		 result = await resolver.supportsInterface("0x3b3b57de");
		 result &= await resolver.supportsInterface("0xd8389dc5");
	 	assert.equal(result, true);
	});
});

