import { useState } from "react";
import { useZKProof } from "../hooks/useZKProof";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, ShieldAlert, Fingerprint, Lock } from "lucide-react";

interface ZKProps {
  onProofGenerated: (type: string, hash: string, isValid: boolean) => void;
}

export function ZKProofVerifier({ onProofGenerated }: ZKProps) {
  const { proveAge, provePAN, verifyAge, verifyPAN, loading } = useZKProof();
  
  const [dob, setDob] = useState("");
  const [pan, setPan] = useState("");
  
  const [ageProof, setAgeProof] = useState<any>(null);
  const [panProof, setPanProof] = useState<any>(null);
  
  const [verifying, setVerifying] = useState(false);
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null);
  const [panVerified, setPanVerified] = useState<boolean | null>(null);

  const handleProveAge = async () => {
    if (!dob) return;
    const [year, month, day] = dob.split("-").map(Number);
    const result = await proveAge(year, month, day);
    setAgeProof(result);
    onProofGenerated("age", result.proofHash, result.isAdult);
  };

  const handleProvePAN = async () => {
    if (!pan || pan.length !== 10) return;
    const result = await provePAN(pan);
    setPanProof(result);
    onProofGenerated("pan", result.proofHash, result.isValid);
  };

  const handleVerifyAge = async () => {
    if (!ageProof) return;
    setVerifying(true);
    const isValid = await verifyAge(ageProof.proof, ageProof.publicSignals);
    setAgeVerified(isValid);
    setVerifying(false);
  };

  const handleVerifyPAN = async () => {
    if (!panProof) return;
    setVerifying(true);
    const isValid = await verifyPAN(panProof.proof, panProof.publicSignals);
    setPanVerified(isValid);
    setVerifying(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-indigo-600" />
          Zero-Knowledge Verification
        </CardTitle>
        <CardDescription>
          Generate cryptographic proofs of your identity without revealing the underlying sensitive data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Lock className="h-5 w-5 text-indigo-600 mt-0.5" />
          <p className="text-sm text-indigo-900">
            <strong>No personal data is shared.</strong> Only the cryptographic proof is transmitted and verified by the server. Your raw DOB and PAN remain strictly on your device.
          </p>
        </div>

        <Tabs defaultValue="age" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="age">Age Verification</TabsTrigger>
            <TabsTrigger value="pan">PAN Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="age" className="space-y-4 pt-4">
            {!ageProof ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                </div>
                <Button onClick={handleProveAge} disabled={!dob || loading} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Computing zero-knowledge proof..." : "Generate Proof"}
                </Button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Assertion</p>
                    <p className="font-semibold text-slate-900">User is over 18 years old</p>
                  </div>
                  {ageProof.isAdult ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">TRUE</span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">FALSE</span>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-500 mb-1">Proof Hash (SHA-256)</p>
                  <p className="font-mono text-xs break-all bg-slate-200 p-2 rounded">{ageProof.proofHash}</p>
                </div>

                <details className="text-sm">
                  <summary className="cursor-pointer text-indigo-600 font-medium">View Raw Groth16 Proof JSON</summary>
                  <pre className="mt-2 p-3 bg-slate-900 text-slate-300 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(ageProof.proof, null, 2)}
                  </pre>
                </details>

                <Button variant="outline" onClick={handleVerifyAge} disabled={verifying} className="w-full">
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify This Proof
                </Button>

                {ageVerified !== null && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 border ${ageVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {ageVerified ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    <span className="text-sm font-semibold">
                      {ageVerified ? "Cryptographic verification successful!" : "Invalid proof detected."}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="pan" className="space-y-4 pt-4">
            {!panProof ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input 
                    type="text" 
                    value={pan} 
                    onChange={e => setPan(e.target.value.toUpperCase())} 
                    maxLength={10} 
                    placeholder="ABCDE1234F"
                    className="uppercase"
                  />
                </div>
                <Button onClick={handleProvePAN} disabled={pan.length !== 10 || loading} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Computing zero-knowledge proof..." : "Generate Proof"}
                </Button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Assertion</p>
                    <p className="font-semibold text-slate-900">PAN format is valid</p>
                  </div>
                  {panProof.isValid ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">TRUE</span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">FALSE</span>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-500 mb-1">Proof Hash (SHA-256)</p>
                  <p className="font-mono text-xs break-all bg-slate-200 p-2 rounded">{panProof.proofHash}</p>
                </div>

                <details className="text-sm">
                  <summary className="cursor-pointer text-indigo-600 font-medium">View Raw Groth16 Proof JSON</summary>
                  <pre className="mt-2 p-3 bg-slate-900 text-slate-300 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(panProof.proof, null, 2)}
                  </pre>
                </details>

                <Button variant="outline" onClick={handleVerifyPAN} disabled={verifying} className="w-full">
                  {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify This Proof
                </Button>

                {panVerified !== null && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 border ${panVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {panVerified ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    <span className="text-sm font-semibold">
                      {panVerified ? "Cryptographic verification successful!" : "Invalid proof detected."}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
