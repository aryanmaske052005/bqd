import crypto from "crypto";

export interface BlockData {
  index: number;
  timestamp: string;
  kycId: string;
  transactionHash: string;
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  kycData: any;
  action: string;
  merkleRoot: string;
}

export class Block {
  public index: number;
  public timestamp: string;
  public kycId: string;
  public transactionHash: string;
  public previousHash: string;
  public hash: string;
  public nonce: number;
  public difficulty: number;
  public kycData: any;
  public action: string;
  public merkleRoot: string;

  constructor(
    index: number,
    timestamp: string,
    kycId: string,
    transactionHash: string,
    previousHash: string,
    kycData: any,
    action: string,
    nonce: number = 0,
    difficulty: number = 4
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.kycId = kycId;
    this.transactionHash = transactionHash;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.kycData = kycData;
    this.action = action;
    this.merkleRoot = this.calculateMerkleRoot(kycData);
    this.hash = this.calculateHash();
  }

  public calculateHash(): string {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          this.transactionHash +
          this.kycId +
          this.nonce +
          this.merkleRoot +
          this.action
      )
      .digest("hex");
  }

  private calculateMerkleRoot(data: any): string {
    const dataString = JSON.stringify(data);
    return crypto.createHash("sha256").update(dataString).digest("hex");
  }

  public async mineBlock(difficulty: number): Promise<void> {
    this.difficulty = difficulty;
    const target = Array(difficulty + 1).join("0");

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`⛏️ Block mined: ${this.hash}`);
  }

  public hasValidHash(): boolean {
    const hashTarget = Array(this.difficulty + 1).join("0");
    if (this.hash.substring(0, this.difficulty) !== hashTarget) {
      return false;
    }
    const recalculatedHash = this.calculateHash();
    return this.hash === recalculatedHash;
  }
}

export class Blockchain {
  public chain: Block[];
  public difficulty: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
  }

  private createGenesisBlock(): Block {
    const genesisBlock = new Block(
      0,
      new Date().toISOString(),
      "GENESIS",
      "0",
      "0",
      { message: "Genesis Block - Authen Ledger Blockchain" },
      "GENESIS"
    );
    genesisBlock.hash = genesisBlock.calculateHash();
    return genesisBlock;
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  generateTransactionHash(kycData: any): string {
    const transactionData = JSON.stringify({
      ...kycData,
      timestamp: Date.now(),
      nonce: Math.random(),
      randomBytes: crypto.randomBytes(16).toString("hex"),
      microTime: process.hrtime.bigint().toString(),
    });
    return crypto.createHash("sha256").update(transactionData).digest("hex");
  }

  async addBlock(kycData: any, action: string): Promise<Block> {
    const previousBlock = this.getLatestBlock();
    const transactionHash = this.generateTransactionHash(kycData);

    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      kycData.id || "UNKNOWN",
      transactionHash,
      previousBlock.hash,
      kycData,
      action,
      0,
      this.difficulty
    );

    await newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);

    console.log(
      `✅ New block added: Index ${newBlock.index}, Hash: ${newBlock.hash.substring(0, 16)}...`
    );
    console.log(`🔗 Transaction Hash: ${transactionHash}`);

    return newBlock;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidHash()) {
        console.error(`❌ Block ${currentBlock.index} has invalid hash`);
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(
          `❌ Block ${currentBlock.index} previous hash mismatch`
        );
        return false;
      }

      const recalculatedHash = currentBlock.calculateHash();
      if (currentBlock.hash !== recalculatedHash) {
        console.error(`❌ Block ${currentBlock.index} hash has been tampered`);
        return false;
      }
    }
    return true;
  }

  getBlockByIndex(index: number): Block | null {
    return this.chain.find((block) => block.index === index) || null;
  }

  getBlockByHash(hash: string): Block | null {
    return this.chain.find((block) => block.hash === hash) || null;
  }

  getBlockByTransactionHash(txHash: string): Block | null {
    return this.chain.find((block) => block.transactionHash === txHash) || null;
  }

  getBlockByKYCId(kycId: string): Block[] {
    return this.chain.filter((block) => block.kycId === kycId);
  }

  getKYCHistory(kycId: string): Block[] {
    return this.chain.filter((block) => block.kycId === kycId);
  }

  verifyBlockIntegrity(hash: string): {
    valid: boolean;
    block: Block | null;
    message: string;
  } {
    const block = this.getBlockByHash(hash);

    if (!block) {
      return {
        valid: false,
        block: null,
        message: "Block not found",
      };
    }

    const isValid = block.hasValidHash();
    const chainPosition = this.chain.indexOf(block);

    if (!isValid) {
      return {
        valid: false,
        block,
        message: "Block hash is invalid - possible tampering detected",
      };
    }

    if (chainPosition > 0) {
      const previousBlock = this.chain[chainPosition - 1];
      if (block.previousHash !== previousBlock.hash) {
        return {
          valid: false,
          block,
          message: "Block chain link broken - tampering detected",
        };
      }
    }

    return {
      valid: true,
      block,
      message: "Block integrity verified successfully",
    };
  }

  getBlockchainStats(): {
    totalBlocks: number;
    totalTransactions: number;
    genesisTimestamp: string;
    latestBlockTimestamp: string;
    averageMiningTime: string;
    chainValid: boolean;
  } {
    return {
      totalBlocks: this.chain.length,
      totalTransactions: this.chain.length - 1, // Exclude genesis
      genesisTimestamp: this.chain[0].timestamp,
      latestBlockTimestamp: this.getLatestBlock().timestamp,
      averageMiningTime: "N/A",
      chainValid: this.isChainValid(),
    };
  }
}

// Export singleton instance
export const blockchain = new Blockchain();
