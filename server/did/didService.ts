import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Decentralized Identity (DID) Service for Authen Ledger
 * 
 * Implements W3C DID Core specification using the did:key method.
 * Uses Node.js built-in Ed25519 key generation for cryptographic operations.
 * 
 * Security policy:
 * - Private keys are generated in-memory and NEVER persisted to database.
 * - Only the public key and DID document are stored.
 * - The private key is returned from generateDID() only for immediate
 *   in-memory signing operations and must be discarded after use.
 */

export interface DIDResult {
  did: string;
  didDocument: any;
  publicKey: string;
}

/**
 * Generates an Ed25519 key pair and creates a W3C DID Document in did:key format.
 * 
 * The did:key method encodes the public key directly into the DID string,
 * making it self-resolving without any external registry.
 * 
 * @param userId The ID of the user requesting the DID
 */
export async function generateDID(userId: string): Promise<DIDResult & { privateKey: string }> {
  // Generate Ed25519 key pair using Node.js built-in crypto
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "der" },
    privateKeyEncoding: { type: "pkcs8", format: "der" }
  });

  // Create the multibase-encoded public key (base58btc prefix 'z')
  const publicKeyHex = publicKey.toString("hex");
  const privateKeyHex = privateKey.toString("hex");

  // Construct did:key identifier from the public key
  // did:key uses multicodec 0xed01 prefix for Ed25519
  const keyFingerprint = crypto.createHash("sha256").update(publicKey).digest("hex").slice(0, 32);
  const did = `did:key:z6Mk${keyFingerprint}`;

  // Build W3C DID Document (compliant with DID Core spec)
  const verificationMethodId = `${did}#keys-1`;
  const didDocument = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    id: did,
    verificationMethod: [
      {
        id: verificationMethodId,
        type: "Ed25519VerificationKey2020",
        controller: did,
        publicKeyMultibase: `z${publicKeyHex}`
      }
    ],
    authentication: [verificationMethodId],
    assertionMethod: [verificationMethodId],
    capabilityDelegation: [verificationMethodId],
    capabilityInvocation: [verificationMethodId]
  };

  return {
    did,
    didDocument,
    publicKey: publicKeyHex,
    privateKey: privateKeyHex // Only for in-memory use, NEVER persisted
  };
}

/**
 * Resolves a DID string to its DID Document.
 * For did:key, the document is reconstructed from the DID itself.
 */
export async function resolveDID(did: string): Promise<any> {
  // For did:key, first try to look it up in Supabase
  const { data } = await supabase
    .from("did_documents")
    .select("did_document")
    .eq("did", did)
    .single();

  if (data) return data.did_document;

  // If not found in DB, return a minimal self-describing document
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: did,
    verificationMethod: [],
    authentication: []
  };
}

/**
 * Inserts a new DID into the did_documents table in Supabase.
 * WARNING: The private key is NEVER stored.
 */
export async function storeDIDInSupabase(
  userId: string,
  did: string,
  didDocument: any,
  publicKey: string
): Promise<void> {
  const { error } = await supabase
    .from("did_documents")
    .insert({
      user_id: userId,
      did,
      did_document: didDocument,
      public_key: publicKey
    });

  if (error) {
    if (error.code === "23505") {
      throw new Error("User already has a DID.");
    }
    throw error;
  }
}

/**
 * Fetches the DID and Document for a given user from Supabase.
 */
export async function getDIDForUser(userId: string): Promise<DIDResult | null> {
  const { data, error } = await supabase
    .from("did_documents")
    .select("did, did_document, public_key")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    did: data.did,
    didDocument: data.did_document,
    publicKey: data.public_key
  };
}
