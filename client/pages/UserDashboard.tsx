import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, CheckCircle, Clock, XCircle, History, Activity, Fingerprint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('aadhaar');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('submitted_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);

      // Fetch audit logs
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('target_user', user?.id)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;
      setAuditLogs(logsData || []);
    } catch (error: any) {
      toast.error('Error fetching data', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const filePath = `${user.id}/${docType}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL (or signed URL if bucket is private)
      const { data: urlData } = supabase.storage.from('kyc-documents').getPublicUrl(filePath);
      const fileUrl = urlData.publicUrl;

      // 2. Insert into kyc_documents
      const { data: docRecord, error: docError } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: user.id,
          doc_type: docType,
          file_url: fileUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (docError) throw docError;

      // 3. Trigger existing /api/kyc/submit endpoint to hash via blockchain
      // We send a mock payload matching the schema to trigger the blockchain part
      const formData = new FormData();
      formData.append('documents', file);
      formData.append('data', JSON.stringify({
        name: profile?.full_name || 'User',
        email: profile?.email || user.email || 'user@example.com',
        phone: '0000000000',
        pan: 'ABCDE1234F',
        dateOfBirth: '2000-01-01',
        address: { street: 'NA', city: 'NA', state: 'NA', pincode: '000000', country: 'NA' }
      }));

      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        // Update document with blockchain hash
        if (responseData.success && responseData.data?.blockchainTxHash) {
           await supabase
             .from('kyc_documents')
             .update({ blockchain_tx_hash: responseData.data.blockchainTxHash })
             .eq('id', docRecord.id);
        }
      }

      // 4. Create Audit Log
      await supabase.from('audit_logs').insert({
        action: 'DOCUMENT_UPLOADED',
        target_user: user.id,
        document_id: docRecord.id,
        metadata: { doc_type: docType, file_name: file.name }
      });

      toast.success('Document uploaded successfully');
      setFile(null);
      fetchData();
    } catch (error: any) {
      toast.error('Upload failed', { description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  return (
    <DashboardLayout title="User Portal">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Identity Wallet Link */}
        <Card className="lg:col-span-3 shadow-md border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-indigo-900 flex items-center">
              <Fingerprint className="h-5 w-5 mr-2 text-indigo-600" /> 
              Self-Sovereign Identity Wallet
            </CardTitle>
            <CardDescription className="text-indigo-700">
              Access your W3C Decentralized Identifier (DID) and securely store your Verifiable Credentials (VCs).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/my-identity">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Open My Identity Wallet
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Upload Document</CardTitle>
            <CardDescription>Submit a new document for KYC verification</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docType">Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="pan">PAN Card</SelectItem>
                    <SelectItem value="marksheet">Marksheet / Degree</SelectItem>
                    <SelectItem value="medical">Medical Certificate</SelectItem>
                    <SelectItem value="bank_doc">Bank Statement</SelectItem>
                    <SelectItem value="government_doc">Other Govt ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isUploading || !file}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Document
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">My Documents</CardTitle>
            <CardDescription>View your submitted documents and their verification status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No documents submitted yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Blockchain TX</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium capitalize">{doc.doc_type.replace('_', ' ')}</TableCell>
                        <TableCell>{new Date(doc.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-500 max-w-[150px] truncate">
                          {doc.blockchain_tx_hash || 'Pending...'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card className="lg:col-span-3 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><History className="mr-2 h-5 w-5" /> Audit Trail</CardTitle>
            <CardDescription>Immutable record of all actions on your account</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-4 text-slate-500">No activity recorded yet</div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0 border-slate-100">
                    <div className="bg-slate-100 p-2 rounded-full">
                      <Activity className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {log.action.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleString()} 
                        {log.metadata?.doc_type && ` • Document: ${log.metadata.doc_type.replace('_', ' ')}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
