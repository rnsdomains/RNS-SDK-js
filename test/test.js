const assert = require('assert');
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const Resolver = require('./../index.js');
const namehash = require('eth-ens-namehash');
const aHash = "0x89ad40fcd44690fb5aa90e0fa51637c1b2d388f8056d68430d41c8284a6a7d5e";


describe('Resolver', function () {
	let resolver = null;
	let hashForTest = null;
	beforeEach( async () => {
		let web3 = new Web3();
		hashForTest = web3.utils.randomHex(32);
		this.ctx.timeout(20000);
		//web3.setProvider(TestRPC.provider());
		try {
			web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
			accounts = await web3.eth.getAccounts();
			const input = {
				'AbstractRNS.sol' : fs.readFileSync('test/contracts/AbstractRNS.sol').toString(),
				'RNS.sol' : fs.readFileSync('test/contracts/RNS.sol').toString(),
				'ResolverInterface.sol' : fs.readFileSync('test/contracts/ResolverInterface.sol').toString(),
				'PublicResolver.sol' : fs.readFileSync('test/contracts/PublicResolver.sol').toString()
			};
			const compiled = solc.compile({sources:input}, 1);
			assert.equal(compiled.errors, undefined);

			// Deploy the RNS contract
		
			let deployer = compiled.contracts['RNS.sol:RNS'];
			const deployRNSContract = new web3.eth.Contract(JSON.parse(deployer.interface));
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
			const resolverABI = JSON.parse(fs.readFileSync('json/resolver.json').toString());
			const deployResolverContract = new web3.eth.Contract(resolverABI);
			const resolverContract = await deployResolverContract.deploy({
						data: deployer.bytecode,
						arguments: [rnsContract._address.toString()]
				})
				.send({
					from: accounts[0],
					gas: 6700000,
					gasPrice: 1000000
				});
			const resolverAddress = resolverContract.options.address;
			if (resolverAddress == undefined) {
				assert.ifError("Contract address is null", contract);
			}
			const tldHash = web3.utils.sha3('rsk');
			const fooHash = web3.utils.sha3('foo');
			const  nodeFooDotRsk = namehash.hash('foo.rsk');
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
		const result = await resolver.addr('foo.rsk');
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
		const testingHash = await resolver.setContent('foo.rsk', aHash, accounts[0]);
		const result = await resolver.content('foo.rsk');
		assert.equal(result, aHash);
		
	});
	it('setContent to not owned address', async () => {
		try {
			await resolver.setContent('foo.rsk', aHash, accounts[0]);
		} catch (ex) {
			const expectedMsg = "VM Exception while processing transaction: revert";
			const msg = typeof ex === "string" ? ex : ex.message;
			assert.ok(msg.indexOf(expectedMsg) !== -1);
		}
		
	});
	it('should implement has() with addr', async () => {
			result = await resolver.has('foo.rsk', 'addr');
			assert.equal(result, true);
			
	});
	
	it('should implement has() with hash', async () => {
		const result = await resolver.has('foo.rsk', 'hash');
		assert.equal(result, true);
		
});
	it('has() with function not implemented', async () => {
		const result = await resolver.has('foo.rsk', 'boom');
		assert.equal(result, false);
		
	});

	it('should resolve names', async () => {
		const result = await resolver.addr('foo.rsk');
		assert.equal(result, accounts[0]);
	});
	
	it('should resolve content', async () => {
		const result = await resolver.content('foo.rsk');
		assert.equal(result, hashForTest);
	});

	it('shouldnt resolve names did not registered', async () => {
		const result = await resolver.addr('foo');
		assert.equal(result, 0);
	});
	
	it('should implement supportsInterface', async () => {
		 let  result = await resolver.supportsInterface("0x3b3b57de");
		 result &= await resolver.supportsInterface("0xd8389dc5");
	 	assert.equal(result, true);
	});
});

