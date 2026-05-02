import { Router } from "express";
import crypto from "crypto";
import { generateAgeProof, generatePANProof, verifyAgeProof, verifyPANProof } from "../zk/zkProver";

export const zkRouter = Router();

zkRouter.post("/prove/age", async (req, res) => {
  try {
    const { birthYear, birthMonth, birthDay } = req.body;
    if (!birthYear || !birthMonth || !birthDay) {
      return res.status(400).json({ error: "Missing birth date parameters." });
    }

    const { proof, publicSignals, isAdult } = await generateAgeProof(birthYear, birthMonth, birthDay);
    
    // Hash the proof JSON to return a proofHash
    const proofHash = crypto.createHash("sha256").update(JSON.stringify(proof)).digest("hex");

    res.json({ proof, publicSignals, isAdult, proofHash });
  } catch (error: any) {
    console.error("ZK Prove Age Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate age proof" });
  }
});

zkRouter.post("/prove/pan", async (req, res) => {
  try {
    const { panNumber } = req.body;
    if (!panNumber) {
      return res.status(400).json({ error: "Missing PAN number." });
    }

    const { proof, publicSignals, isValid } = await generatePANProof(panNumber);
    
    const proofHash = crypto.createHash("sha256").update(JSON.stringify(proof)).digest("hex");

    res.json({ proof, publicSignals, isValid, proofHash });
  } catch (error: any) {
    console.error("ZK Prove PAN Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate PAN proof" });
  }
});

zkRouter.post("/verify/age", async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;
    if (!proof || !publicSignals) {
      return res.status(400).json({ error: "Missing proof or public signals." });
    }

    const verified = await verifyAgeProof(proof, publicSignals);
    res.json({ verified });
  } catch (error: any) {
    console.error("ZK Verify Age Error:", error);
    res.status(500).json({ error: error.message || "Failed to verify age proof" });
  }
});

zkRouter.post("/verify/pan", async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;
    if (!proof || !publicSignals) {
      return res.status(400).json({ error: "Missing proof or public signals." });
    }

    const verified = await verifyPANProof(proof, publicSignals);
    res.json({ verified });
  } catch (error: any) {
    console.error("ZK Verify PAN Error:", error);
    res.status(500).json({ error: error.message || "Failed to verify PAN proof" });
  }
});
