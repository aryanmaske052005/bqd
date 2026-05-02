/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * eKYC System API Types
 */

// KYC Document Types
export interface KYCDocument {
  id: string;
  type: "PAN" | "AADHAAR" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID";
  documentHash: string;
  ipfsHash?: string;
  uploadedAt: string;
}

// KYC Record Structure
export interface KYCRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  pan: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  documents: KYCDocument[];
  status: "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
  verificationLevel: "L1" | "L2" | "L3";
  blockchainTxHash?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  remarks?: string;
  sector?: string;
  expiryDate?: string;
}

// KYC Submission Request
export interface KYCSubmissionRequest {
  name: string;
  email: string;
  phone: string;
  pan: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  documents: File[];
}

// KYC Verification Request
export interface KYCVerificationRequest {
  kycId?: string;
  pan?: string;
  email?: string;
}

// KYC Verification Response
export interface KYCVerificationResponse {
  success: boolean;
  record?: KYCRecord;
  message: string;
  verificationLevel?: "L1" | "L2" | "L3";
  blockchainVerified: boolean;
}

// KYC History Entry
export interface KYCHistoryEntry {
  id: string;
  kycId: string;
  action: "CREATED" | "UPDATED" | "VERIFIED" | "REJECTED" | "RESUBMITTED";
  performedBy: string;
  performedAt: string;
  blockchainTxHash: string;
  details: Record<string, any>;
  remarks?: string;
}

// KYC Dashboard Stats
export interface KYCStats {
  totalSubmissions: number;
  pendingVerifications: number;
  verifiedRecords: number;
  rejectedRecords: number;
  averageProcessingTime: number; // in hours
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "VERIFIER" | "ADMIN";
  isVerified: boolean;
  kycStatus?: "PENDING" | "VERIFIED" | "REJECTED";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: "USER" | "VERIFIER";
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message: string;
}

// Blockchain Transaction Response
export interface BlockchainTxResponse {
  success: boolean;
  txHash: string;
  blockNumber?: number;
  gasUsed?: number;
  message: string;
}

// IPFS Upload Response
export interface IPFSUploadResponse {
  success: boolean;
  hash: string;
  url: string;
  size: number;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  timestamp: string;
}

// Blockchain Types
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

export interface BlockchainStats {
  totalBlocks: number;
  totalTransactions: number;
  genesisTimestamp: string;
  latestBlockTimestamp: string;
  averageMiningTime: string;
  chainValid: boolean;
}

export interface BlockchainStatus {
  algorithm: string;
  difficulty: number;
  totalBlocks: number;
  totalTransactions: number;
  chainValid: boolean;
  latestBlock: BlockData;
  genesisTimestamp: string;
}

export interface ExpiryNotification {
  kycId: string;
  name: string;
  email: string;
  expiryDate: string;
  daysUntilExpiry: number;
  notificationType: "WARNING" | "CRITICAL" | "EXPIRED";
  message: string;
}

export interface ExpiryStats {
  total: number;
  expiringIn7Days: number;
  expiringIn30Days: number;
  expired: number;
  valid: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  sector: string;
  role: string;
  isActive: boolean;
}
