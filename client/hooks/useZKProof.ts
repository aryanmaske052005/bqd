import { useState } from "react";

export function useZKProof() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProof, setLastProof] = useState<any>(null);

  const proveAge = async (birthYear: number, birthMonth: number, birthDay: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/zk/prove/age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthYear, birthMonth, birthDay })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate age proof");
      setLastProof(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const provePAN = async (panNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/zk/prove/pan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate PAN proof");
      setLastProof(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyAge = async (proof: any, publicSignals: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/zk/verify/age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof, publicSignals })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify age proof");
      return data.verified;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPAN = async (proof: any, publicSignals: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/zk/verify/pan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof, publicSignals })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify PAN proof");
      return data.verified;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { proveAge, provePAN, verifyAge, verifyPAN, loading, error, lastProof };
}
