import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

class MySQLService {
  private pool: mysql.Pool | null = null;

  isInitialized(): boolean {
    return this.pool !== null;
  }

  async initialize(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "12542"),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
          rejectUnauthorized: false,
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        enableKeepAlive: true,
      });

      const connection = await this.pool.getConnection();
      console.log("✅ MySQL database connected successfully");
      connection.release();

      await this.createTables();
    } catch (error) {
      console.error("❌ MySQL connection error:", error);
      if (this.pool) {
        this.pool.end().catch(() => {});
        this.pool = null;
      }
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.pool) throw new Error("Database not initialized");

    try {
      // Create KYC records table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS kyc_records (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          pan VARCHAR(50) NOT NULL,
          date_of_birth VARCHAR(50) NOT NULL,
          address_street TEXT NOT NULL,
          address_city VARCHAR(255) NOT NULL,
          address_state VARCHAR(255) NOT NULL,
          address_pincode VARCHAR(20) NOT NULL,
          address_country VARCHAR(255) NOT NULL,
          documents JSON,
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
          verification_level VARCHAR(10) DEFAULT 'L1',
          blockchain_tx_hash VARCHAR(255),
          remarks TEXT,
          verified_by VARCHAR(255),
          sector VARCHAR(100) DEFAULT 'GENERAL',
          expiry_date DATETIME NULL,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          verified_at DATETIME NULL,
          INDEX idx_email (email),
          INDEX idx_pan (pan),
          INDEX idx_status (status),
          INDEX idx_blockchain_tx_hash (blockchain_tx_hash),
          INDEX idx_sector (sector)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Create blocks table for blockchain
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS blockchain_blocks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          block_index INT NOT NULL UNIQUE,
          block_hash VARCHAR(255) NOT NULL,
          previous_hash VARCHAR(255) NOT NULL,
          transaction_hash VARCHAR(255) NOT NULL,
          kyc_id VARCHAR(255) NOT NULL,
          timestamp DATETIME NOT NULL,
          nonce INT NOT NULL,
          difficulty INT NOT NULL,
          action VARCHAR(100) NOT NULL,
          merkle_root VARCHAR(255) NOT NULL,
          kyc_data JSON NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_block_hash (block_hash),
          INDEX idx_transaction_hash (transaction_hash),
          INDEX idx_kyc_id (kyc_id),
          INDEX idx_block_index (block_index)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Create admin users table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          sector VARCHAR(100) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
          is_active BOOLEAN DEFAULT true,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME NULL,
          INDEX idx_email (email),
          INDEX idx_sector (sector)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      console.log("✅ Database tables created/verified");
    } catch (error) {
      console.error("❌ Error creating tables:", error);
      throw error;
    }
  }

  async saveKYCRecord(record: any): Promise<void> {
    if (!this.pool) throw new Error("Database not initialized");

    // Convert ISO dates to MySQL datetime format
    const toMySQLDateTime = (date: string) => {
      return new Date(date).toISOString().replace("T", " ").replace("Z", "");
    };

    const query = `
      INSERT INTO kyc_records (
        id, user_id, name, email, phone, pan, date_of_birth,
        address_street, address_city, address_state, address_pincode, address_country,
        documents, status, verification_level, blockchain_tx_hash,
        remarks, verified_by, sector, expiry_date, created_at, updated_at, verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Calculate expiry date (1 year from creation)
    const expiryDate = new Date(record.createdAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const values = [
      record.id,
      record.userId,
      record.name,
      record.email,
      record.phone,
      record.pan,
      record.dateOfBirth,
      record.address.street,
      record.address.city,
      record.address.state,
      record.address.pincode,
      record.address.country,
      JSON.stringify(record.documents || []),
      record.status,
      record.verificationLevel,
      record.blockchainTxHash || null,
      record.remarks || null,
      record.verifiedBy || null,
      record.sector || 'GENERAL',
      expiryDate.toISOString().replace("T", " ").replace("Z", ""),
      toMySQLDateTime(record.createdAt),
      toMySQLDateTime(record.updatedAt),
      record.verifiedAt ? toMySQLDateTime(record.verifiedAt) : null,
    ];

    await this.pool.query(query, values);
  }

  async getKYCRecordById(id: string): Promise<any> {
    if (!this.pool) throw new Error("Database not initialized");

    const [rows] = await this.pool.query(
      "SELECT * FROM kyc_records WHERE id = ?",
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;
    return this.parseRecord(rows[0]);
  }

  async getKYCRecordByTxHash(txHash: string): Promise<any> {
    if (!this.pool) throw new Error("Database not initialized");

    const [rows] = await this.pool.query(
      "SELECT * FROM kyc_records WHERE blockchain_tx_hash = ?",
      [txHash]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;
    return this.parseRecord(rows[0]);
  }

  async getKYCRecordByPAN(pan: string): Promise<any> {
    if (!this.pool) throw new Error("Database not initialized");

    const [rows] = await this.pool.query(
      "SELECT * FROM kyc_records WHERE pan = ?",
      [pan]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;
    return this.parseRecord(rows[0]);
  }

  async getKYCRecordByEmail(email: string): Promise<any> {
    if (!this.pool) throw new Error("Database not initialized");

    const [rows] = await this.pool.query(
      "SELECT * FROM kyc_records WHERE email = ?",
      [email]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;
    return this.parseRecord(rows[0]);
  }

  async getAllKYCRecords(status: string = "all", limit: number = 50, offset: number = 0): Promise<any[]> {
    if (!this.pool) throw new Error("Database not initialized");

    let query = "SELECT * FROM kyc_records";
    const params: any[] = [];

    if (status !== "all") {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await this.pool.query(query, params);
    if (!Array.isArray(rows)) return [];
    return rows.map((row: any) => this.parseRecord(row));
  }

  async updateKYCRecord(id: string, updates: { status?: string; remarks?: string; verifiedBy?: string; verifiedAt?: string | null; updatedAt: string; expiryDate?: string; blockchainTxHash?: string }): Promise<void> {
    if (!this.pool) throw new Error("Database not initialized");

    // Convert ISO dates to MySQL datetime format
    const toMySQLDateTime = (date: string) => {
      return new Date(date).toISOString().replace("T", " ").replace("Z", "");
    };

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) { fields.push("status = ?"); values.push(updates.status); }
    if (updates.remarks !== undefined) { fields.push("remarks = ?"); values.push(updates.remarks); }
    if (updates.verifiedBy !== undefined) { fields.push("verified_by = ?"); values.push(updates.verifiedBy); }
    if (updates.verifiedAt !== undefined) { fields.push("verified_at = ?"); values.push(updates.verifiedAt ? toMySQLDateTime(updates.verifiedAt) : null); }
    if (updates.expiryDate !== undefined) { fields.push("expiry_date = ?"); values.push(updates.expiryDate ? toMySQLDateTime(updates.expiryDate) : null); }
    if (updates.blockchainTxHash !== undefined) { fields.push("blockchain_tx_hash = ?"); values.push(updates.blockchainTxHash); }
    fields.push("updated_at = ?");
    values.push(toMySQLDateTime(updates.updatedAt));
    values.push(id);

    const query = `UPDATE kyc_records SET ${fields.join(", ")} WHERE id = ?`;
    await this.pool.query(query, values);
  }

  async getRecordCount(status: string = "all"): Promise<number> {
    if (!this.pool) throw new Error("Database not initialized");

    let query = "SELECT COUNT(*) as count FROM kyc_records";
    const params: any[] = [];

    if (status !== "all") {
      query += " WHERE status = ?";
      params.push(status);
    }

    const [rows] = await this.pool.query(query, params);
    if (!Array.isArray(rows) || rows.length === 0) return 0;
    return (rows[0] as any).count;
  }

  private parseRecord(row: any): any {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      pan: row.pan,
      dateOfBirth: row.date_of_birth,
      address: {
        street: row.address_street,
        city: row.address_city,
        state: row.address_state,
        pincode: row.address_pincode,
        country: row.address_country,
      },
      documents: typeof row.documents === "string" ? JSON.parse(row.documents) : row.documents,
      status: row.status,
      verificationLevel: row.verification_level,
      blockchainTxHash: row.blockchain_tx_hash,
      remarks: row.remarks,
      verifiedBy: row.verified_by,
      sector: row.sector,
      expiryDate: row.expiry_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      verifiedAt: row.verified_at,
    };
  }

  async saveBlock(block: any): Promise<void> {
    if (!this.pool) throw new Error("Database not initialized");

    const toMySQLDateTime = (date: string) => {
      return new Date(date).toISOString().replace("T", " ").replace("Z", "");
    };

    const query = `
      INSERT INTO blockchain_blocks (
        block_index, block_hash, previous_hash, transaction_hash,
        kyc_id, timestamp, nonce, difficulty, action, merkle_root, kyc_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      block.index,
      block.hash,
      block.previousHash,
      block.transactionHash,
      block.kycId,
      toMySQLDateTime(block.timestamp),
      block.nonce,
      block.difficulty,
      block.action,
      block.merkleRoot,
      JSON.stringify(block.kycData),
    ];

    await this.pool.query(query, values);
  }

  async getBlockByHash(hash: string): Promise<any> {
    if (!this.pool) throw new Error("Database not initialized");

    const [rows] = await this.pool.query(
      "SELECT * FROM blockchain_blocks WHERE block_hash = ?",
      [hash]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0];
  }

  async getBlockByTransactionHash(txHash: string): Promise<any> {
    if (!this.pool) throw new Error("Database not initialized");

    const [rows] = await this.pool.query(
      "SELECT * FROM blockchain_blocks WHERE transaction_hash = ?",
      [txHash]
    );

    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0];
  }

  async getBlocksByKYCId(kycId: string): Promise<any[]> {
    if (!this.pool) throw new Error("Database not initialized");

    const [rows] = await this.pool.query(
      "SELECT * FROM blockchain_blocks WHERE kyc_id = ? ORDER BY block_index ASC",
      [kycId]
    );

    if (!Array.isArray(rows)) return [];
    return rows;
  }

  async getAllBlocks(limit: number = 100, offset: number = 0): Promise<any[]> {
    if (!this.pool) throw new Error("Database not initialized");

    const [rows] = await this.pool.query(
      "SELECT * FROM blockchain_blocks ORDER BY block_index DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    if (!Array.isArray(rows)) return [];
    return rows;
  }

  async getExpiringDocuments(daysUntilExpiry: number): Promise<any[]> {
    if (!this.pool) throw new Error("Database not initialized");

    const query = `
      SELECT * FROM kyc_records 
      WHERE status = 'VERIFIED' 
      AND expiry_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
      ORDER BY expiry_date ASC
    `;

    const [rows] = await this.pool.query(query, [daysUntilExpiry]);
    if (!Array.isArray(rows)) return [];
    return rows;
  }

  async getExpiredDocuments(): Promise<any[]> {
    if (!this.pool) throw new Error("Database not initialized");

    const [rows] = await this.pool.query(
      "SELECT * FROM kyc_records WHERE status = 'VERIFIED' AND expiry_date < NOW()"
    );

    if (!Array.isArray(rows)) return [];
    return rows;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log("🔌 MySQL connection closed");
    }
  }
}

export const mysqlService = new MySQLService();
