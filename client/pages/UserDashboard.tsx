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
import { Loader2, Upload, FileText, CheckCircle, Clock, XCircle, History, Activity, Fingerprint, CalendarDays, AlertTriangle, Bell, BellRing } from 'lucide-react';
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

  // ── Expiry notifications derived from documents ──────────────
  const expiryAlerts = documents.filter(doc => {
    if (!doc.expiry_date) return false;
    const daysLeft = Math.ceil((new Date(doc.expiry_date).getTime() - Date.now()) / 86400000);
    return daysLeft <= 10; // within 10 days (including already expired)
  }).sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: docsData, error: docsError } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('submitted_at', { ascending: false });
      if (docsError) throw docsError;
      setDocuments(docsData || []);

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
      const filePath = `${user.id}/${docType}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('kyc-documents').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('kyc-documents').getPublicUrl(filePath);
      const { data: docRecord, error: docError } = await supabase
        .from('kyc_documents')
        .insert({ user_id: user.id, doc_type: docType, file_url: urlData.publicUrl, status: 'pending' })
        .select().single();
      if (docError) throw docError;
      const formData = new FormData();
      formData.append('documents', file);
      formData.append('data', JSON.stringify({ name: profile?.full_name || 'User', email: profile?.email || user.email || 'user@example.com', phone: '0000000000', pan: 'ABCDE1234F', dateOfBirth: '2000-01-01', address: { street: 'NA', city: 'NA', state: 'NA', pincode: '000000', country: 'NA' } }));
      const response = await fetch('/api/kyc/submit', { method: 'POST', body: formData });
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success && responseData.data?.blockchainTxHash) {
          await supabase.from('kyc_documents').update({ blockchain_tx_hash: responseData.data.blockchainTxHash }).eq('id', docRecord.id);
        }
      }
      await supabase.from('audit_logs').insert({ action: 'DOCUMENT_UPLOADED', target_user: user.id, document_id: docRecord.id, metadata: { doc_type: docType, file_name: file.name } });
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
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getExpiryBadge = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return <span className="text-xs text-slate-400">—</span>;
    const daysLeft = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
    const formatted = new Date(expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    if (daysLeft < 0) return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5"><AlertTriangle className="h-3 w-3" />Expired · {formatted}</span>;
    if (daysLeft <= 30) return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"><CalendarDays className="h-3 w-3" />{formatted} · {daysLeft}d left</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5"><CalendarDays className="h-3 w-3" />{formatted}</span>;
  };

  return (
    <DashboardLayout title="User Portal">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Expiry Notifications Panel ─────────────────── */}
        {expiryAlerts.length > 0 && (
          <Card className="lg:col-span-3 border-0 shadow-md bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-900 flex items-center gap-2">
                <div className="relative">
                  <BellRing className="h-5 w-5 text-red-600 animate-bounce" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{expiryAlerts.length}</span>
                </div>
                Document Expiry Alerts
              </CardTitle>
              <CardDescription className="text-red-700">
                {expiryAlerts.length} document{expiryAlerts.length > 1 ? 's are' : ' is'} expiring soon or already expired. Please renew to stay compliant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expiryAlerts.map((doc) => {
                  const daysLeft = Math.ceil((new Date(doc.expiry_date).getTime() - Date.now()) / 86400000);
                  const isExpired = daysLeft < 0;
                  const formatted = new Date(doc.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  return (
                    <div key={doc.id} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${isExpired ? 'bg-red-100 border-red-200' : 'bg-amber-100 border-amber-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isExpired ? 'bg-red-200' : 'bg-amber-200'}`}>
                          <AlertTriangle className={`h-4 w-4 ${isExpired ? 'text-red-700' : 'text-amber-700'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm capitalize ${isExpired ? 'text-red-900' : 'text-amber-900'}`}>
                            {doc.doc_type.replace(/_/g, ' ')}
                          </p>
                          <p className={`text-xs ${isExpired ? 'text-red-700' : 'text-amber-700'}`}>
                            {isExpired ? `Expired on ${formatted}` : `Expires on ${formatted} · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-xs font-semibold ${isExpired ? 'bg-red-600 hover:bg-red-600 text-white' : 'bg-amber-600 hover:bg-amber-600 text-white'}`}>
                        {isExpired ? 'Expired' : `${daysLeft}d left`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Identity Wallet Link ────────────────────────── */}
        <Card className="lg:col-span-3 shadow-md border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-indigo-900 flex items-center">
              <Fingerprint className="h-5 w-5 mr-2 text-indigo-600" />Self-Sovereign Identity Wallet
            </CardTitle>
            <CardDescription className="text-indigo-700">
              Access your W3C Decentralized Identifier (DID) and securely store your Verifiable Credentials (VCs).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/my-identity">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Open My Identity Wallet</Button>
            </Link>
          </CardContent>
        </Card>

        {/* ── Upload Form ─────────────────────────────────── */}
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
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
                <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isUploading || !file}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Document
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Documents List ──────────────────────────────── */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              My Documents
              {expiryAlerts.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
                  <Bell className="h-3 w-3" />{expiryAlerts.length} expiring
                </span>
              )}
            </CardTitle>
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
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Blockchain TX</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} className={doc.expiry_date && Math.ceil((new Date(doc.expiry_date).getTime() - Date.now()) / 86400000) <= 10 ? 'bg-red-50/50' : ''}>
                        <TableCell className="font-medium capitalize">{doc.doc_type.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-sm text-slate-600">{new Date(doc.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>{getExpiryBadge(doc.expiry_date)}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-500 max-w-[150px] truncate">{doc.blockchain_tx_hash || 'Pending...'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Audit Log ───────────────────────────────────── */}
        <Card className="lg:col-span-3 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><History className="mr-2 h-5 w-5" />Audit Trail</CardTitle>
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
                    <div className="bg-slate-100 p-2 rounded-full"><Activity className="h-4 w-4 text-slate-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                        {log.metadata?.doc_type && ` · Document: ${log.metadata.doc_type.replace(/_/g, ' ')}`}
                        {log.metadata?.expiry_date && ` · Expires: ${new Date(log.metadata.expiry_date).toLocaleDateString()}`}
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
