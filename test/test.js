const assert = require('assert');
const fs = require('fs');
const util = require('util');
const solc = require('solc');
const Web3 = require('web3');
const Resolver = require('./../index.js');
const namehash = require('eth-ens-namehash');
const aHash = "0x89ad40fcd44690fb5aa90e0fa51637c1b2d388f8056d68430d41c8284a6a7d5e";

// https://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
process.setMaxListeners(0);

describe('Resolver', function () {
	let resolver = null;
	let hashForTest = null;

	beforeEach(async () => {
		const getCompiler =  util.promisify(f => solc.loadRemoteVersion('v0.4.26+commit.4563c3fc', f));

		const compiler = await getCompiler().catch(err => { throw Error(err) });

		let web3 = new Web3();
		hashForTest = web3.utils.randomHex(32);
		this.ctx.timeout(20000);
		//web3.setProvider(TestRPC.provider());
		try {
			web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
			accounts = await web3.eth.getAccounts();

			var input = {
				language: 'Solidity',
				sources: {
					'AbstractRNS.sol' : { content: fs.readFileSync('test/contracts/AbstractRNS.sol', 'UTF-8').toString() },
					'RNS.sol' : { content: fs.readFileSync('test/contracts/RNS.sol', 'UTF-8').toString() },
					'ResolverInterface.sol' : { content: fs.readFileSync('test/contracts/ResolverInterface.sol', 'UTF-8').toString() },
					'PublicResolver.sol' : { content: fs.readFileSync('test/contracts/PublicResolver.sol', 'UTF-8').toString() }
				},
				settings: {
					outputSelection: {
						'*': {
							'*': ['*']
						}
					}
				}
			};

			var compiled = JSON.parse(compiler.compile(JSON.stringify(input)));
			assert.equal(compiled.errors, undefined);

			// Deploy the RNS contract
			let deployer = compiled.contracts['RNS.sol'];
			const deployRNSContract = new web3.eth.Contract(deployer['RNS'].abi);

			rnsContract = await deployRNSContract.deploy({
					data: deployer['RNS'].evm.bytecode.object
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
			deployer = compiled.contracts['PublicResolver.sol'];
			const resolverABI = deployer['PublicResolver'].abi;
			const deployResolverContract = new web3.eth.Contract(resolverABI);
			const resolverContract = await deployResolverContract.deploy({
						data: deployer['PublicResolver'].evm.bytecode.object,
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
		await resolver.setContent('foo.rsk', aHash, accounts[0]);
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
