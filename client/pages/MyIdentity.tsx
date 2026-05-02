import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Fingerprint, RefreshCw } from "lucide-react";
import { useDID } from "../hooks/useDID";
import { DIDCard } from "../components/DIDCard";

export default function MyIdentity() {
  const { myDID, myVCs, loading, generateDID, refresh } = useDID();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Your Decentralized Identity</h1>
                <p className="text-xs text-slate-500">Self-Sovereign Identity Wallet</p>
              </div>
            </div>
            <Link to="/dashboard/user">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">What is a Decentralized Identity?</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              A Decentralized Identifier (DID) is a new type of internet identifier that you own and control. 
              Instead of relying on a central authority (like a tech company or government) to verify who you are, 
              your DID uses cryptography to prove your identity. When your KYC is approved, authorities issue 
              <strong> Verifiable Credentials</strong> (digital certificates) directly to your DID wallet.
            </p>
          </div>

          {!myDID ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Shield className="h-16 w-16 text-indigo-200 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Your Identity Wallet</h2>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Generate your secure, cryptographic Decentralized Identifier to start receiving Verifiable Credentials.
              </p>
              <Button onClick={generateDID} disabled={loading} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                {loading ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <Fingerprint className="h-5 w-5 mr-2" />}
                {loading ? "Generating Keys..." : "Generate My DID"}
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={refresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Wallet
                </Button>
              </div>
              <DIDCard didData={myDID} vcs={myVCs} />
            </div>
          )}

          <div className="flex justify-center mt-12">
            <Link to="/blockchain-explorer">
              <Button variant="link" className="text-indigo-600">
                View Your On-Chain Records
              </Button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
