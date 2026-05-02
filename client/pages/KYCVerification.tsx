import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  FileText,
  Eye,
  Download,
  Loader2,
  Hash,
  Calendar,
  User,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { KYCRecord, KYCVerificationResponse, ApiResponse } from "@shared/api";

export default function KYCVerification() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("id") || "");
  const [searchType, setSearchType] = useState<"id" | "pan" | "email" | "txhash">("id");
  const [isSearching, setIsSearching] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<KYCVerificationResponse | null>(null);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (searchParams.get("id")) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setVerificationResult(null);

    try {
      let response;
      
      // Search by transaction hash uses different endpoint
      if (searchType === "txhash") {
        response = await fetch(`/api/admin/kyc/search?query=${searchQuery.trim()}`);
        const result: ApiResponse<KYCRecord> = await response.json();
        
        if (result.success && result.data) {
          setVerificationResult({
            success: true,
            record: result.data,
            message: result.message,
            verificationLevel: result.data.verificationLevel,
            blockchainVerified: true,
          });
        } else {
          setSearchError(result.message || "No record found with this transaction hash");
        }
      } else {
        const params = new URLSearchParams({
          [searchType]: searchQuery.trim(),
        });

        response = await fetch(`/api/kyc/verify?${params}`);
        const result: ApiResponse<KYCVerificationResponse> =
          await response.json();

        if (result.success && result.data) {
          setVerificationResult(result.data);
        } else {
          setSearchError(result.message || "Verification failed");
        }
      }
    } catch (error) {
      setSearchError("Network error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-5 w-5" />;
      case "PENDING":
        return <Clock className="h-5 w-5" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5" />;
      case "EXPIRED":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case "L3":
        return "bg-purple-100 text-purple-800";
      case "L2":
        return "bg-blue-100 text-blue-800";
      case "L1":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const handleViewDocument = (doc: any) => {
    if (doc.ipfsHash) {
      window.open(`https://ipfs.io/ipfs/${doc.ipfsHash}`, '_blank');
    } else {
      alert(`Document Preview\n\nType: ${doc.type || 'Document'}\nHash: ${doc.documentHash || "N/A"}\n\nNote: In a production environment, this would open the actual decrypted document.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Authen Ledger
                </h1>
                <p className="text-xs text-slate-500">Verify KYC Status</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Verify KYC Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">
                    Search by KYC ID, PAN, Email, or Transaction Hash
                  </Label>
                  <div className="flex mt-2">
                    <select
                      value={searchType}
                      onChange={(e) =>
                        setSearchType(e.target.value as "id" | "pan" | "email" | "txhash")
                      }
                      className="rounded-l-lg border border-r-0 border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="id">KYC ID</option>
                      <option value="pan">PAN</option>
                      <option value="email">Email</option>
                      <option value="txhash">Transaction Hash</option>
                    </select>
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        searchType === "id" ? "Enter KYC ID" :
                        searchType === "pan" ? "Enter PAN number" :
                        searchType === "email" ? "Enter email address" :
                        "Enter blockchain transaction hash"
                      }
                      className="rounded-l-none"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 md:mt-7"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
              </div>

              {searchError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {searchError}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Verification Results */}
          {verificationResult && (
            <div className="space-y-6">
              {/* Status Overview */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(
                        verificationResult.record?.status || "PENDING",
                      )}
                      Verification Status
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getStatusColor(
                          verificationResult.record?.status || "PENDING",
                        )}
                      >
                        {verificationResult.record?.status}
                      </Badge>
                      {verificationResult.blockchainVerified && (
                        <Badge className="bg-green-100 text-green-800">
                          <Hash className="h-3 w-3 mr-1" />
                          Blockchain Verified
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">
                        Verification Level
                      </p>
                      <Badge
                        className={getVerificationLevelColor(
                          verificationResult.verificationLevel || "L1",
                        )}
                      >
                        {verificationResult.verificationLevel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">
                        Blockchain Status
                      </p>
                      <div className="flex items-center gap-2">
                        {verificationResult.blockchainVerified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Message</p>
                      <p className="text-sm font-medium text-slate-700">
                        {verificationResult.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Information */}
              {verificationResult.record && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <p className="text-sm text-slate-500">Name</p>
                          <p className="font-medium text-slate-800">
                            {verificationResult.record.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Email</p>
                          <p className="font-medium text-slate-800">
                            {verificationResult.record.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Phone</p>
                          <p className="font-medium text-slate-800">
                            {verificationResult.record.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">PAN</p>
                          <p className="font-mono font-medium text-slate-800">
                            {verificationResult.record.pan}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Date of Birth
                          </p>
                          <p className="font-medium text-slate-800">
                            {verificationResult.record.dateOfBirth}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technical Details */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5 text-blue-600" />
                        Technical Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500">KYC ID</p>
                        <p className="font-mono text-sm font-medium text-slate-800 break-all">
                          {verificationResult.record.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Created At</p>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(
                            verificationResult.record.createdAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Last Updated</p>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(
                            verificationResult.record.updatedAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                      {verificationResult.record.verifiedAt && (
                        <div>
                          <p className="text-sm text-slate-500">Verified At</p>
                          <p className="text-sm font-medium text-slate-800">
                            {new Date(
                              verificationResult.record.verifiedAt,
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {verificationResult.record.expiryDate && (() => {
                        const expiry = new Date(verificationResult.record.expiryDate);
                        const now = new Date();
                        const diffTime = expiry.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const isExpiringSoon = diffDays > 0 && diffDays <= 10;
                        const isExpired = diffDays <= 0;

                        return (
                          <div className="col-span-1 md:col-span-2 space-y-3 mt-2">
                            <div>
                              <p className="text-sm text-slate-500">Expiry Date</p>
                              <p className="text-sm font-medium text-slate-800">
                                {expiry.toLocaleDateString()}
                              </p>
                            </div>
                            {isExpiringSoon && (
                              <Alert className="border-orange-500 bg-orange-50 text-orange-900 mt-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="font-medium ml-2 text-xs">
                                  Warning: Expiring in {diffDays} days!
                                </AlertDescription>
                              </Alert>
                            )}
                            {isExpired && (
                              <Alert className="border-red-500 bg-red-50 text-red-900 mt-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="font-medium ml-2 text-xs">
                                  Critical: Document has expired.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        );
                      })()}
                      {verificationResult.record.blockchainTxHash && (
                        <div>
                          <p className="text-sm text-slate-500">
                            Blockchain Transaction
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs text-slate-600 break-all">
                              {verificationResult.record.blockchainTxHash.substring(
                                0,
                                20,
                              )}
                              ...
                            </p>
                            <Button variant="ghost" size="sm" className="p-1">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Address Information */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-800">
                          {verificationResult.record.address.street}
                        </p>
                        <p className="text-sm text-slate-800">
                          {verificationResult.record.address.city},{" "}
                          {verificationResult.record.address.state}
                        </p>
                        <p className="text-sm text-slate-800">
                          {verificationResult.record.address.pincode},{" "}
                          {verificationResult.record.address.country}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Documents ({verificationResult.record.documents.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {verificationResult.record.documents.map(
                          (doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="text-sm font-medium text-slate-700">
                                    {doc.type}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Uploaded:{" "}
                                    {new Date(
                                      doc.uploadedAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => alert(`Downloading ${doc.type}...`)}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to={`/history?id=${verificationResult.record?.id}`}>
                      <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </Link>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => alert("Downloading Verified KYC Certificate...")}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" onClick={() => alert("Generating full KYC report...")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/submit">
                  <Button variant="outline" className="w-full h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Submit New KYC
                  </Button>
                </Link>
                {verificationResult.record?.status === "VERIFIED" && (
                  <Link to={`/submit?update=${verificationResult.record.id}`}>
                    <Button className="w-full h-20 flex-col bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                      <RefreshCw className="h-6 w-6 mb-2" />
                      Update KYC
                    </Button>
                  </Link>
                )}
                <Link to="/history">
                  <Button variant="outline" className="w-full h-20 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    View All History
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full h-20 flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
