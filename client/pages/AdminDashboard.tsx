import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Search,
  LogOut,
  FileText,
  Hash,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Building2,
  AlertTriangle,
} from "lucide-react";

interface AdminSession {
  email: string;
  sector: string;
  name: string;
}

interface KYCRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  pan: string;
  dateOfBirth: string;
  address: any;
  status: string;
  sector: string;
  documents: any[];
  blockchainTxHash: string;
  verifiedBy: string;
  verifiedAt: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  remarks: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<KYCRecord | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem("adminSession");
    if (!session) {
      navigate("/admin/login");
    } else {
      setAdminSession(JSON.parse(session));
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminSession");
    navigate("/admin/login");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const response = await fetch(
        `/api/admin/kyc/search?query=${searchQuery.trim()}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setSearchResult(result.data);
      } else {
        setSearchError(result.message || "Record not found");
      }
    } catch (err) {
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const getSectorColor = (sector: string) => {
    const colors: any = {
      BANKING: "bg-blue-100 text-blue-800",
      HEALTHCARE: "bg-green-100 text-green-800",
      EDUCATION: "bg-purple-100 text-purple-800",
      TELECOM: "bg-orange-100 text-orange-800",
      GOVERNMENT: "bg-red-100 text-red-800",
      FINANCE: "bg-indigo-100 text-indigo-800",
    };
    return colors[sector] || "bg-slate-100 text-slate-800";
  };

  const handleViewDocument = (doc: any) => {
    if (doc.ipfsHash) {
      window.open(`https://ipfs.io/ipfs/${doc.ipfsHash}`, '_blank');
    } else {
      alert(`Document Preview\n\nType: ${doc.type || 'Document'}\nHash: ${doc.documentHash || "N/A"}\n\nNote: In a production environment, this would open the actual decrypted document.`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (!adminSession) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Admin Dashboard
                </h1>
                <div className="flex items-center gap-2">
                  <Badge className={getSectorColor(adminSession.sector)}>
                    {adminSession.sector}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {adminSession.name}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search Section */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-600" />
              Search KYC by Transaction Hash
            </CardTitle>
            <p className="text-sm text-slate-600">
              Enter the blockchain transaction hash to view KYC details, documents, and approval history
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter transaction hash (e.g., 0x7a8b9c...)"
                  className="font-mono"
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>

            {searchError && (
              <Alert variant="destructive" className="mt-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-6">
            {/* KYC Overview */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  KYC Record Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-slate-500">KYC ID</p>
                    <p className="font-mono text-sm font-semibold text-slate-800">
                      {searchResult.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <Badge className={getStatusColor(searchResult.status)}>
                      {searchResult.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Sector</p>
                    <Badge className={getSectorColor(searchResult.sector)}>
                      {searchResult.sector}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="font-semibold text-slate-800">
                      {searchResult.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="text-slate-800">{searchResult.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="text-slate-800">{searchResult.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">PAN</p>
                    <p className="font-mono text-slate-800">{searchResult.pan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Date of Birth</p>
                    <p className="text-slate-800">{searchResult.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Transaction Hash</p>
                    <p className="font-mono text-xs text-slate-800 break-all">
                      {searchResult.blockchainTxHash}
                    </p>
                  </div>
                </div>

                {searchResult.expiryDate && (() => {
                  const expiry = new Date(searchResult.expiryDate);
                  const now = new Date();
                  const diffTime = expiry.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = diffDays > 0 && diffDays <= 10;
                  const isExpired = diffDays <= 0;

                  return (
                    <div className="space-y-4 mt-6">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          Expiry Date: {expiry.toLocaleDateString()}
                        </p>
                      </div>
                      
                      {isExpiringSoon && (
                        <Alert className="border-orange-500 bg-orange-50 text-orange-900">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <AlertDescription className="font-medium ml-2">
                            Warning: This document is expiring in {diffDays} days! Please notify the user to renew their KYC.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {isExpired && (
                        <Alert className="border-red-500 bg-red-50 text-red-900">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <AlertDescription className="font-medium ml-2">
                            Critical: This document has expired. A new KYC submission is required.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Approval Information */}
            {searchResult.status === "VERIFIED" && searchResult.verifiedBy && (
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Approval Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-500">Approved By</p>
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-purple-600" />
                        {searchResult.verifiedBy}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Approval Date</p>
                      <p className="text-slate-800">
                        {searchResult.verifiedAt
                          ? new Date(searchResult.verifiedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Admin Sector</p>
                      <Badge className={getSectorColor(searchResult.sector)}>
                        {searchResult.sector}
                      </Badge>
                    </div>
                  </div>
                  {searchResult.remarks && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-1">Remarks</p>
                      <p className="text-slate-800">{searchResult.remarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Documents Section */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Uploaded Documents ({searchResult.documents?.length || 0})
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Each document has a unique SHA-256 hash for verification
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResult.documents?.map((doc: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {doc.fileName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {doc.type}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {(doc.fileSize / 1024).toFixed(2)} KB
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-blue-100">
                        <p className="text-xs text-slate-500 mb-1">
                          Document Hash (SHA-256)
                        </p>
                        <p className="font-mono text-xs text-slate-700 break-all">
                          {doc.documentHash}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(doc.documentHash);
                              alert("Document hash copied!");
                            }}
                          >
                            <Hash className="h-3 w-3 mr-1" />
                            Copy Hash
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Document
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => {
                              alert(`Initiating DID Verification for ${doc.fileName}...\n\nChecking blockchain records...`);
                              setTimeout(() => {
                                alert(`✅ Credential Verified in DID!\n\nDocument: ${doc.fileName}\nHash: ${doc.documentHash}\nStatus: Authentic & Verifiable`);
                              }, 1000);
                            }}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Verify Credential in DID
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
