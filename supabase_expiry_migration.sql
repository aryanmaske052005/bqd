-- ============================================================
-- Migration: Add expiry_date to kyc_documents
-- Paste ALL of this into Supabase SQL Editor and click Run
-- ============================================================

ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS expiry_date date NULL;

CREATE INDEX IF NOT EXISTS idx_kyc_documents_expiry_date ON kyc_documents (expiry_date) WHERE expiry_date IS NOT NULL;
