/**
 * ZK Circuit Setup Documentation
 * 
 * This file documents the Zero-Knowledge circuit architecture used by Authen Ledger.
 * 
 * CIRCUIT DESIGN:
 * 
 * 1. AgeCheck Circuit (circuits/ageCheck.circom)
 *    - Private inputs: birthYear, birthMonth, birthDay
 *    - Public inputs:  currentYear, currentMonth, currentDay
 *    - Output signal:  isAdult (1 if age >= 18, 0 otherwise)
 *    - Constraint count: ~15 (comparison operations)
 * 
 * 2. PANCheck Circuit (circuits/panCheck.circom)
 *    - Private inputs: pan[10] (ASCII values of each character)
 *    - Output signal:  isValid (1 if format matches [A-Z]{5}[0-9]{4}[A-Z]{1})
 *    - Constraint count: ~30 (range checks per character)
 * 
 * PROOF SYSTEM: Groth16 (pairing-based, bn128 curve)
 * 
 * CURRENT STATUS:
 * The server currently uses a software simulation of the Groth16 proof system.
 * The simulation produces structurally identical proofs to a compiled Circom circuit
 * and performs the same logical assertions (age calculation, PAN regex validation).
 * 
 * FOR PRODUCTION DEPLOYMENT WITH COMPILED CIRCUITS:
 * 
 * Prerequisites:
 *   - Rust toolchain (cargo)
 *   - circom compiler (https://github.com/iden3/circom)
 * 
 * Steps:
 *   1. Install circom:
 *      git clone https://github.com/iden3/circom.git
 *      cd circom && cargo build --release && cargo install --path circom
 * 
 *   2. Download Powers of Tau (Phase 1 trusted setup):
 *      wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O ptau.ptau
 * 
 *   3. Compile circuits:
 *      circom circuits/ageCheck.circom --r1cs --wasm --sym -o server/zk
 *      circom circuits/panCheck.circom --r1cs --wasm --sym -o server/zk
 * 
 *   4. Generate proving keys:
 *      npx snarkjs groth16 setup server/zk/ageCheck.r1cs ptau.ptau server/zk/keys/ageCheck.zkey
 *      npx snarkjs groth16 setup server/zk/panCheck.r1cs ptau.ptau server/zk/keys/panCheck.zkey
 * 
 *   5. Export verification keys:
 *      npx snarkjs zkey export verificationkey server/zk/keys/ageCheck.zkey server/zk/keys/ageCheck_verification_key.json
 *      npx snarkjs zkey export verificationkey server/zk/keys/panCheck.zkey server/zk/keys/panCheck_verification_key.json
 * 
 *   6. Install snarkjs as a runtime dependency:
 *      npm install snarkjs
 * 
 *   7. Update zkProver.ts to use snarkjs.groth16.fullProve() and snarkjs.groth16.verify()
 *      with the compiled .wasm and .zkey files.
 */

export const ZK_SETUP_INFO = {
  proofSystem: "Groth16",
  curve: "bn128",
  circuits: ["ageCheck", "panCheck"],
  status: "simulation",
  description: "ZK proof simulation active — structurally identical to compiled Circom output"
};
