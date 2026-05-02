# Builder Quantum Den - eKYC & Identity Wallet System

A next-generation **electronic Know Your Customer (eKYC) system** and **Self-Sovereign Identity Wallet** built with React, Vite, Express, Zero-Knowledge Proofs (ZKPs), and a custom Blockchain simulator. This platform allows users to submit their KYC documents, admins to verify them securely, and third-party portals to request data proofs without exposing sensitive user information.

![Architecture](https://img.shields.io/badge/Architecture-Vite%20%2B%20React%20%2B%20Express-blueviolet)
![Security](https://img.shields.io/badge/Security-Zero--Knowledge%20Proofs-success)
![Database](https://img.shields.io/badge/Database-MySQL%20%26%20Supabase-blue)

## 🏗️ Tech Stack

- **Frontend:** React 18, Vite (SPA Mode), TailwindCSS 3, Radix UI (Shadcn/UI components).
- **Backend:** Node.js, Express (Integrated with Vite Dev Server via single-port).
- **Database:** MySQL (Aiven) for Blockchain State Persistence, Supabase for decentralized identifiers (DIDs) and auth.
- **Cryptography:** Zero-Knowledge Proofs (circom/snarkjs) for checking PAN validity and Age without revealing actual values, SHA-256 for Block Hashing.

## 🚀 Quick Start & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd builder-quantum-den
   ```

2. **Install dependencies:**
   This project strictly uses `pnpm`.
   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   Ensure your `.env` file is present in the root directory. It should contain your MySQL (`DB_HOST`, `DB_USER`, etc.) and Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) credentials. 
   *(Note: If MySQL fails to connect, the system automatically falls back to an in-memory storage mode, so the app will still run smoothly for demo purposes!)*

4. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   The application will be available at: **http://localhost:8080**

## 🎬 How to Demo the Project (Workflow)

Follow this exact step-by-step workflow to showcase the full capabilities of the eKYC and ZKP Identity system:

### Step 1: User KYC Submission
1. Navigate to **http://localhost:8080/submit**.
2. Fill out the application form with mock data (Name, valid PAN format like `ABCDE1234F`, DOB, Email).
3. Upload mock documents (JPEG, PNG, or PDF).
4. Click **Submit**. 
5. *What happens:* A unique KYC ID is generated, document hashes are created via SHA-256, and a new block is minted on the blockchain network containing the pending KYC transaction.

### Step 2: View the Blockchain
1. Navigate to **http://localhost:8080/blockchain-explorer**.
2. Show the newly minted blocks. Point out that the data is hashed and the transaction is immutable.

### Step 3: Admin Verification (Banker/Sector Role)
1. Navigate to **http://localhost:8080/admin/login**.
2. Login using the default Banker Admin credentials:
   - **Email:** `bank@admin.com`
   - **Password:** `admin123`
   - **Sector:** Select `Banking`
3. Navigate to the Admin Dashboard. Here you will see the pending KYC request submitted in Step 1.
4. Click to **Approve** the KYC. 
5. *What happens:* A new block is added to the blockchain updating the status to `VERIFIED`.

### Step 4: Identity Wallet & Zero-Knowledge Proofs
1. Go to the Portal Selector at **http://localhost:8080/portal**.
2. Select **User Login** and authenticate (or navigate to `/dashboard/user` / `/my-identity`).
3. Show the **Self-Sovereign Identity Dashboard**. Here the user can view their Decentralized Identifier (DID) and approved KYC data.
4. **Demo the ZKP Feature:** Show how the system can prove the user is over 18 or possesses a valid PAN *without* exposing the actual DOB or PAN string to the requesting party.

### Step 5: Third-Party Sector Portals
1. Go back to the Portal Selector at **http://localhost:8080/portal**.
2. You can access different sector dashboards (Medical, Government, Principal, IT) to demonstrate how different entities interact with the verified data using Zero-Knowledge Proofs, ensuring absolute privacy.

## 📂 Key Project Directories

- `client/pages/`: Contains all the React routes and dashboard views.
- `server/routes/`: Contains Express API logic (`didRoutes.ts`, `zkRoutes.ts`, etc.).
- `server/blockchain/`: Contains the logic for the simulated SHA-256 blockchain and MySQL integration.
- `circuits/`: Contains the `.circom` files used for generating Zero-Knowledge Proof circuits (`ageCheck.circom`, `panCheck.circom`).
- `client/App.tsx`: The main routing file defining all frontend endpoints.

## 🛠️ Available Scripts

- `pnpm dev`: Start the combined Vite + Express dev server.
- `pnpm build`: Create a production bundle for both client and server.
- `pnpm start`: Start the production server from the built files.
- `pnpm typecheck`: Run TypeScript validation.

## 🛡️ Architecture Notes

- **Single-Port Design:** The Express server is integrated directly into the Vite Dev Server. All API calls are prefixed with `/api/` and handled by Express, while Vite handles the frontend SPA routing.
- **Dynamic Fallbacks:** The backend gracefully falls back to `Map()` in-memory objects if the primary Aiven MySQL database is unavailable, making local demos frictionless.

---
*Built with ❤️ by Quantum Den*
