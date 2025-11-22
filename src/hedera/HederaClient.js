/**
 * HederaClient - Quantum-resistant integration with Hedera Hashgraph
 * Implements HTS (Token Service), HCS (Consensus), and Smart Contracts
 */

import {
  Client,
  AccountId,
  PrivateKey,
  PublicKey,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TokenTransferTransaction,
  TokenType,
  TokenSupplyType,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractCallQuery,
  Hbar,
  FileCreateTransaction,
  FileAppendTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  TokenInfoQuery,
  TopicInfoQuery
} from '@hashgraph/sdk';
import { QuantumCryptoManager } from '../quantum-crypto/index.js';
import dotenv from 'dotenv';

dotenv.config();

export class HederaClient {
  constructor(config = {}) {
    this.network = config.network || process.env.HEDERA_NETWORK || 'testnet';
    this.operatorId = config.operatorId || process.env.HEDERA_OPERATOR_ID;
    this.operatorKey = config.operatorKey || process.env.HEDERA_OPERATOR_KEY;
    
    // Initialize Hedera client
    this.client = this.network === 'mainnet' 
      ? Client.forMainnet()
      : Client.forTestnet();
    
    if (this.operatorId && this.operatorKey) {
      this.client.setOperator(
        AccountId.fromString(this.operatorId),
        PrivateKey.fromString(this.operatorKey)
      );
    }
    
    // Initialize quantum crypto manager
    this.quantumCrypto = new QuantumCryptoManager({
      mldsaLevel: 'ML-DSA-65',
      mlkemLevel: 'ML-KEM-768',
      useAWS: config.useAWS || false
    });
    
    // Storage for created resources
    this.resources = {
      tokens: new Map(),
      topics: new Map(),
      contracts: new Map(),
      accounts: new Map()
    };
    
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║            HEDERA QUANTUM CLIENT INITIALIZED                 ║
╠═══════════════════════════════════════════════════════════════╣
║  Network: ${this.network.padEnd(51)} ║
║  Operator: ${(this.operatorId || 'Not configured').padEnd(50)} ║
║  Quantum Security: ML-DSA-65 + ML-KEM-768                    ║
║  Status: ✅ Ready                                            ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  }
  
  /**
   * Create quantum-resistant NFT collection
   */
  async createQuantumNFTCollection(config) {
    console.log('\n🎨 Creating Quantum-Resistant NFT Collection...');
    
    // Generate quantum identity for the collection
    const collectionIdentity = await this.quantumCrypto.generateQuantumIdentity(
      config.name || 'QuantumNFT'
    );
    
    // Create NFT token on Hedera
    const tokenTx = new TokenCreateTransaction()
      .setTokenName(config.name)
      .setTokenSymbol(config.symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setSupplyType(TokenSupplyType.Infinite)
      .setMaxSupply(config.maxSupply || 10000)
      .setTreasuryAccountId(this.client.operatorAccountId)
      .setAutoRenewAccountId(this.client.operatorAccountId);
    
    // Add custom fees if specified
    if (config.royaltyFee) {
      tokenTx.setCustomFees([{
        feeCollectorAccountId: this.client.operatorAccountId,
        royaltyFee: {
          numerator: config.royaltyFee.numerator || 5,
          denominator: config.royaltyFee.denominator || 100,
          fallbackFee: new Hbar(1)
        }
      }]);
    }
    
    // Execute transaction
    const tokenResponse = await tokenTx.execute(this.client);
    const tokenReceipt = await tokenResponse.getReceipt(this.client);
    const tokenId = tokenReceipt.tokenId;
    
    console.log(`✅ NFT Collection created: ${tokenId}`);
    
    // Create quantum signature for the collection
    const collectionData = {
      tokenId: tokenId.toString(),
      name: config.name,
      symbol: config.symbol,
      maxSupply: config.maxSupply || 10000,
      created: new Date().toISOString(),
      quantumSecured: true
    };
    
    const signature = await this.quantumCrypto.signData(
      collectionIdentity.identityId,
      JSON.stringify(collectionData)
    );
    
    // Store collection info
    const collection = {
      tokenId: tokenId,
      name: config.name,
      symbol: config.symbol,
      quantumIdentity: collectionIdentity,
      quantumSignature: signature,
      metadata: collectionData
    };
    
    this.resources.tokens.set(tokenId.toString(), collection);
    
    // Submit quantum proof to HCS
    await this.submitQuantumProof({
      type: 'NFT_COLLECTION_CREATED',
      tokenId: tokenId.toString(),
      signature: signature.signature,
      publicKey: signature.publicKey
    });
    
    return collection;
  }
  
  /**
   * Mint quantum-secured NFT
   */
  async mintQuantumNFT(tokenId, metadata) {
    console.log(`\n🖼️ Minting Quantum NFT for token ${tokenId}...`);
    
    // Get collection info
    const collection = this.resources.tokens.get(tokenId.toString());
    if (!collection) {
      throw new Error(`Collection ${tokenId} not found`);
    }
    
    // Create quantum signature for NFT metadata
    const nftData = {
      tokenId: tokenId.toString(),
      metadata: metadata,
      minted: new Date().toISOString()
    };
    
    const nftSignature = await this.quantumCrypto.signData(
      collection.quantumIdentity.identityId,
      JSON.stringify(nftData)
    );
    
    // Prepare metadata with quantum signature
    const quantumMetadata = {
      ...metadata,
      quantumSignature: nftSignature.signature.signatureHex,
      quantumPublicKey: nftSignature.publicKey,
      quantumAlgorithm: 'ML-DSA-65',
      quantumSecured: true
    };
    
    // Mint NFT on Hedera
    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([Buffer.from(JSON.stringify(quantumMetadata))]);
    
    const mintResponse = await mintTx.execute(this.client);
    const mintReceipt = await mintResponse.getReceipt(this.client);
    const serialNumbers = mintReceipt.serials;
    
    console.log(`✅ NFT minted with serial: ${serialNumbers[0]}`);
    
    // Submit quantum proof to HCS
    await this.submitQuantumProof({
      type: 'NFT_MINTED',
      tokenId: tokenId.toString(),
      serialNumber: serialNumbers[0].toString(),
      signature: nftSignature.signature,
      metadata: quantumMetadata
    });
    
    return {
      tokenId: tokenId,
      serialNumber: serialNumbers[0],
      metadata: quantumMetadata,
      quantumSignature: nftSignature,
      transactionId: mintResponse.transactionId.toString()
    };
  }
  
  /**
   * Create quantum-secured topic on HCS
   */
  async createQuantumTopic(config) {
    console.log('\n📝 Creating Quantum-Secured Topic...');
    
    // Generate quantum identity for the topic
    const topicIdentity = await this.quantumCrypto.generateQuantumIdentity(
      config.memo || 'QuantumTopic'
    );
    
    // Create topic on Hedera
    const topicTx = new TopicCreateTransaction()
      .setTopicMemo(config.memo || 'QuantumShield Topic')
      .setAdminKey(this.client.operatorPublicKey);
    
    if (config.submitKey) {
      topicTx.setSubmitKey(this.client.operatorPublicKey);
    }
    
    const topicResponse = await topicTx.execute(this.client);
    const topicReceipt = await topicResponse.getReceipt(this.client);
    const topicId = topicReceipt.topicId;
    
    console.log(`✅ Topic created: ${topicId}`);
    
    // Create quantum signature for topic
    const topicData = {
      topicId: topicId.toString(),
      memo: config.memo || 'QuantumShield Topic',
      created: new Date().toISOString(),
      quantumSecured: true
    };
    
    const signature = await this.quantumCrypto.signData(
      topicIdentity.identityId,
      JSON.stringify(topicData)
    );
    
    // Store topic info
    const topic = {
      topicId: topicId,
      memo: config.memo,
      quantumIdentity: topicIdentity,
      quantumSignature: signature,
      metadata: topicData
    };
    
    this.resources.topics.set(topicId.toString(), topic);
    
    return topic;
  }
  
  /**
   * Submit quantum proof to HCS
   */
  async submitQuantumProof(proofData) {
    console.log('\n🔐 Submitting Quantum Proof to HCS...');
    
    // Get or create quantum proof topic
    let proofTopic = this.resources.topics.get('quantum-proofs');
    if (!proofTopic) {
      proofTopic = await this.createQuantumTopic({
        memo: 'QuantumShield Proof Topic',
        submitKey: false
      });
      this.resources.topics.set('quantum-proofs', proofTopic);
    }
    
    // Prepare proof message
    const proofMessage = {
      timestamp: new Date().toISOString(),
      data: proofData,
      algorithm: 'ML-DSA-65',
      nistCompliant: true
    };
    
    // Submit to HCS
    const messageTx = new TopicMessageSubmitTransaction()
      .setTopicId(proofTopic.topicId)
      .setMessage(JSON.stringify(proofMessage));
    
    const messageResponse = await messageTx.execute(this.client);
    const messageReceipt = await messageResponse.getReceipt(this.client);
    
    console.log(`✅ Quantum proof submitted: ${messageResponse.transactionId}`);
    
    return {
      topicId: proofTopic.topicId.toString(),
      transactionId: messageResponse.transactionId.toString(),
      sequenceNumber: messageReceipt.topicSequenceNumber,
      proofData: proofMessage
    };
  }
  
  /**
   * Deploy quantum-resistant smart contract
   */
  async deployQuantumContract(config) {
    console.log('\n📜 Deploying Quantum-Resistant Smart Contract...');
    
    // Generate quantum identity for the contract
    const contractIdentity = await this.quantumCrypto.generateQuantumIdentity(
      config.name || 'QuantumContract'
    );
    
    // Create file containing contract bytecode
    const fileCreateTx = new FileCreateTransaction()
      .setContents(config.bytecode)
      .setKeys([this.client.operatorPublicKey]);
    
    const fileResponse = await fileCreateTx.execute(this.client);
    const fileReceipt = await fileResponse.getReceipt(this.client);
    const bytecodeFileId = fileReceipt.fileId;
    
    console.log(`✅ Bytecode file created: ${bytecodeFileId}`);
    
    // Deploy contract
    const contractTx = new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId)
      .setGas(config.gas || 100000)
      .setConstructorParameters(config.constructorParams || '');
    
    if (config.initialBalance) {
      contractTx.setInitialBalance(new Hbar(config.initialBalance));
    }
    
    const contractResponse = await contractTx.execute(this.client);
    const contractReceipt = await contractResponse.getReceipt(this.client);
    const contractId = contractReceipt.contractId;
    
    console.log(`✅ Contract deployed: ${contractId}`);
    
    // Create quantum signature for contract
    const contractData = {
      contractId: contractId.toString(),
      name: config.name,
      bytecodeFileId: bytecodeFileId.toString(),
      deployed: new Date().toISOString(),
      quantumSecured: true
    };
    
    const signature = await this.quantumCrypto.signData(
      contractIdentity.identityId,
      JSON.stringify(contractData)
    );
    
    // Store contract info
    const contract = {
      contractId: contractId,
      name: config.name,
      bytecodeFileId: bytecodeFileId,
      quantumIdentity: contractIdentity,
      quantumSignature: signature,
      metadata: contractData
    };
    
    this.resources.contracts.set(contractId.toString(), contract);
    
    // Submit quantum proof to HCS
    await this.submitQuantumProof({
      type: 'CONTRACT_DEPLOYED',
      contractId: contractId.toString(),
      signature: signature.signature,
      publicKey: signature.publicKey
    });
    
    return contract;
  }
  
  /**
   * Execute quantum-verified contract function
   */
  async executeQuantumContract(contractId, functionName, params, config = {}) {
    console.log(`\n⚡ Executing Quantum Contract Function: ${functionName}...`);
    
    // Get contract info
    const contract = this.resources.contracts.get(contractId.toString());
    if (!contract) {
      throw new Error(`Contract ${contractId} not found`);
    }
    
    // Create quantum signature for the execution
    const executionData = {
      contractId: contractId.toString(),
      functionName: functionName,
      params: params,
      timestamp: new Date().toISOString()
    };
    
    const signature = await this.quantumCrypto.signData(
      contract.quantumIdentity.identityId,
      JSON.stringify(executionData)
    );
    
    // Execute contract function
    const contractExecuteTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunction(functionName, params)
      .setGas(config.gas || 100000);
    
    if (config.payableAmount) {
      contractExecuteTx.setPayableAmount(new Hbar(config.payableAmount));
    }
    
    const contractResponse = await contractExecuteTx.execute(this.client);
    const contractReceipt = await contractResponse.getReceipt(this.client);
    
    console.log(`✅ Contract function executed: ${contractResponse.transactionId}`);
    
    // Submit quantum proof to HCS
    await this.submitQuantumProof({
      type: 'CONTRACT_EXECUTION',
      contractId: contractId.toString(),
      functionName: functionName,
      signature: signature.signature,
      transactionId: contractResponse.transactionId.toString()
    });
    
    return {
      transactionId: contractResponse.transactionId.toString(),
      contractId: contractId.toString(),
      functionName: functionName,
      quantumSignature: signature,
      receipt: contractReceipt
    };
  }
  
  /**
   * Create DeFi staking pool with quantum security
   */
  async createQuantumStakingPool(config) {
    console.log('\n💰 Creating Quantum-Secured Staking Pool...');
    
    // Create fungible token for rewards
    const rewardToken = await this.createQuantumToken({
      name: config.rewardTokenName || 'Quantum Rewards',
      symbol: config.rewardTokenSymbol || 'QR',
      initialSupply: config.rewardSupply || 1000000,
      decimals: 8
    });
    
    // Create staking pool topic for consensus
    const poolTopic = await this.createQuantumTopic({
      memo: `Staking Pool: ${config.name}`,
      submitKey: true
    });
    
    return {
      poolName: config.name,
      rewardToken: rewardToken,
      poolTopic: poolTopic,
      apr: config.apr || 10,
      minStake: config.minStake || 100,
      lockPeriod: config.lockPeriod || 30, // days
      quantumSecured: true
    };
  }
  
  /**
   * Create fungible token with quantum signatures
   */
  async createQuantumToken(config) {
    console.log(`\n🪙 Creating Quantum Token: ${config.name}...`);
    
    // Generate quantum identity for the token
    const tokenIdentity = await this.quantumCrypto.generateQuantumIdentity(
      config.name
    );
    
    // Create fungible token
    const tokenTx = new TokenCreateTransaction()
      .setTokenName(config.name)
      .setTokenSymbol(config.symbol)
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(config.decimals || 8)
      .setInitialSupply(config.initialSupply || 1000000)
      .setTreasuryAccountId(this.client.operatorAccountId)
      .setAutoRenewAccountId(this.client.operatorAccountId);
    
    const tokenResponse = await tokenTx.execute(this.client);
    const tokenReceipt = await tokenResponse.getReceipt(this.client);
    const tokenId = tokenReceipt.tokenId;
    
    console.log(`✅ Token created: ${tokenId}`);
    
    // Create quantum signature
    const tokenData = {
      tokenId: tokenId.toString(),
      name: config.name,
      symbol: config.symbol,
      supply: config.initialSupply || 1000000,
      created: new Date().toISOString()
    };
    
    const signature = await this.quantumCrypto.signData(
      tokenIdentity.identityId,
      JSON.stringify(tokenData)
    );
    
    const token = {
      tokenId: tokenId,
      name: config.name,
      symbol: config.symbol,
      quantumIdentity: tokenIdentity,
      quantumSignature: signature,
      metadata: tokenData
    };
    
    this.resources.tokens.set(tokenId.toString(), token);
    
    return token;
  }
  
  /**
   * Get account balance
   */
  async getAccountBalance(accountId = null) {
    const targetAccount = accountId || this.client.operatorAccountId;
    const balance = await new AccountBalanceQuery()
      .setAccountId(targetAccount)
      .execute(this.client);
    
    return {
      accountId: targetAccount.toString(),
      hbar: balance.hbars.toString(),
      tokens: balance.tokens ? Object.fromEntries(balance.tokens) : {}
    };
  }
  
  /**
   * Get token info
   */
  async getTokenInfo(tokenId) {
    const tokenInfo = await new TokenInfoQuery()
      .setTokenId(tokenId)
      .execute(this.client);
    
    return {
      tokenId: tokenId.toString(),
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      totalSupply: tokenInfo.totalSupply.toString(),
      decimals: tokenInfo.decimals,
      treasury: tokenInfo.treasuryAccountId.toString()
    };
  }
  
  /**
   * Transfer quantum-signed tokens
   */
  async transferQuantumTokens(tokenId, toAccount, amount) {
    console.log(`\n💸 Transferring Quantum Tokens...`);
    
    // Get token info
    const token = this.resources.tokens.get(tokenId.toString());
    if (!token) {
      throw new Error(`Token ${tokenId} not found`);
    }
    
    // Create quantum signature for transfer
    const transferData = {
      tokenId: tokenId.toString(),
      from: this.client.operatorAccountId.toString(),
      to: toAccount.toString(),
      amount: amount,
      timestamp: new Date().toISOString()
    };
    
    const signature = await this.quantumCrypto.signData(
      token.quantumIdentity.identityId,
      JSON.stringify(transferData)
    );
    
    // Execute transfer
    const transferTx = new TransferTransaction()
      .addTokenTransfer(tokenId, this.client.operatorAccountId, -amount)
      .addTokenTransfer(tokenId, toAccount, amount);
    
    const transferResponse = await transferTx.execute(this.client);
    const transferReceipt = await transferResponse.getReceipt(this.client);
    
    console.log(`✅ Tokens transferred: ${transferResponse.transactionId}`);
    
    // Submit quantum proof to HCS
    await this.submitQuantumProof({
      type: 'TOKEN_TRANSFER',
      tokenId: tokenId.toString(),
      from: this.client.operatorAccountId.toString(),
      to: toAccount.toString(),
      amount: amount,
      signature: signature.signature,
      transactionId: transferResponse.transactionId.toString()
    });
    
    return {
      transactionId: transferResponse.transactionId.toString(),
      tokenId: tokenId.toString(),
      from: this.client.operatorAccountId.toString(),
      to: toAccount.toString(),
      amount: amount,
      quantumSignature: signature
    };
  }
  
  /**
   * Check network connectivity
   */
  async checkConnection() {
    try {
      const balance = await this.getAccountBalance();
      console.log(`✅ Connected to Hedera ${this.network}`);
      console.log(`   Account: ${balance.accountId}`);
      console.log(`   Balance: ${balance.hbar} HBAR`);
      return true;
    } catch (error) {
      console.error(`❌ Connection failed: ${error.message}`);
      return false;
    }
  }
}

export default HederaClient;
