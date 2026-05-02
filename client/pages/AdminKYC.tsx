import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search,
  Link2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { KYCRecord, ApiResponse, BlockData } from "@shared/api";

export default function AdminKYC() {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchedRecord, setSearchedRecord] = useState<KYCRecord | null>(null);
  const [blockchainHistory, setBlockchainHistory] = useState<BlockData[]>([]);

  const [filterSector, setFilterSector] = useState("all");
  const [expiryDate, setExpiryDate] = useState("");
  const sectors = ["GENERAL", "BANKING", "TELECOM", "HEALTHCARE", "FINANCE", "GOVERNMENT"];

  const handleViewDocument = (doc: any) => {
    if (doc.ipfsHash) {
      window.open(`https://ipfs.io/ipfs/${doc.ipfsHash}`, '_blank');
    } else {
      alert(`Document Preview\n\nType: ${doc.type}\nHash: ${doc.documentHash || "N/A"}\n\nNote: In a production environment, this would open the actual decrypted document.`);
    }
  };

  useEffect(() => {
    fetchKYCRecords();
  }, [filterStatus, filterSector]);

  const fetchBlockchainHistory = async (kycId: string) => {
    try {
      const response = await fetch(`/api/blockchain/kyc/${kycId}`);
      if (response.ok) {
        const result = await response.json();
        setBlockchainHistory(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching blockchain history:", error);
    }
  };

  const fetchKYCRecords = async () => {
    setIsLoading(true);
    setError("");
    setSearchedRecord(null);

    try {
      const params = new URLSearchParams({
        status: filterStatus,
        limit: "50",
        offset: "0",
      });

      if (filterSector !== "all") {
        params.append("sector", filterSector);
      }

      const response = await fetch(`/api/admin/kyc/all?${params}`);
      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setRecords(result.data.records || []);
      } else {
        setError(result.message || "Failed to fetch records");
      }                                                                                                                                 
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const searchKYCRecord = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a KYC ID or transaction hash");
      return;
    }

    setIsSearching(true);
    setError("");
    setSearchedRecord(null);

    try {
      const params = new URLSearchParams({
        query: searchQuery.trim(),
      });

      const response = await fetch(`/api/admin/kyc/search?${params}`);
      const result: ApiResponse<KYCRecord> = await response.json();

      if (result.success && result.data) {
        setSearchedRecord(result.data);
        setSelectedRecord(result.data);
      } else {
        setError(result.message || "Record not found");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchedRecord(null);
    setError("");
    fetchKYCRecords();
  };

  const updateKYCStatus = async (
    recordId: string,
    status: string,
    customRemarks?: string,
  ) => {
    // For VERIFIED status, require expiry date
    if (status === "VERIFIED" && !expiryDate) {
      alert("⚠️ Please set an expiry date before approving this KYC");
      return;
    }

    // Confirmation dialog
    const confirmMessage =
      status === "VERIFIED"
        ? `✅ APPROVE this KYC application? This will mark the user as VERIFIED until ${new Date(expiryDate).toLocaleDateString()}.`
        : "❌ REJECT this KYC application? This will require the user to resubmit.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsUpdating(true);
    console.log(`🔄 LIVE UPDATE: ${status} KYC ID: ${recordId}`);

    try {
      const finalRemarks =
        customRemarks ||
        remarks ||
        (status === "VERIFIED"
          ? `KYC approved by admin - valid until ${new Date(expiryDate).toLocaleDateString()} ✅`
          : "KYC rejected - please resubmit with correct documents ❌");

      const response = await fetch(`/api/admin/kyc/${recordId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          remarks: finalRemarks,
          verifiedBy: "admin@ekyc.com",
          expiryDate: status === "VERIFIED" ? expiryDate : undefined,
        }),
      });

      const result: ApiResponse<KYCRecord> = await response.json();

      if (result.success && result.data) {
        console.log(`✅ LIVE UPDATE SUCCESS: Status changed to ${status}`);

        // Update the record in the list with live data
        setRecords((prev) =>
          prev.map((record) =>
            record.id === recordId ? result.data! : record,
          ),
        );
        setSelectedRecord(null);
        setRemarks("");
        setExpiryDate("");

        // Show success message with live update confirmation
        const successMessage =
          status === "VERIFIED"
            ? `✅ APPROVED! KYC for ${result.data.name} is now VERIFIED until ${new Date(expiryDate).toLocaleDateString()}`
            : `❌ REJECTED! KYC for ${result.data.name} has been rejected`;

        alert(successMessage);

        // Auto-refresh to show live updates
        setTimeout(() => {
          fetchKYCRecords();
        }, 1000);
      } else {
        console.error("❌ UPDATE FAILED:", result.message);
        alert(`❌ Update failed: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ NETWORK ERROR:", error);
      alert("❌ Network error. Please check connection and try again.");
    } finally {
      setIsUpdating(false);
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
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Authen Ledger - Admin Panel
                </h1>
                <p className="text-xs text-slate-500">
                  KYC Verification Dashboard
                </p>
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
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  KYC Records Management
                  <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium ml-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    LIVE UPDATES
                  </span>
                </span>
                <Button
                  onClick={fetchKYCRecords}
                  disabled={isLoading}
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Section */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-slate-500" />
                    Search by KYC ID or Transaction Hash
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter KYC ID or blockchain transaction hash..."
                      onKeyPress={(e) => e.key === "Enter" && searchKYCRecord()}
                      className="flex-1"
                    />
                    <Button
                      onClick={searchKYCRecord}
                      disabled={isSearching}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                    {searchedRecord && (
                      <Button variant="outline" onClick={clearSearch}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Section */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <Label htmlFor="status-filter">Filter by Status:</Label>
                </div>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <div className="flex items-center gap-2 ml-4">
                  <Shield className="h-4 w-4 text-slate-500" />
                  <Label htmlFor="sector-filter">Filter by Sector:</Label>
                </div>
                <select
                  id="sector-filter"
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="all">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>

                <Link to="/blockchain-explorer" className="ml-auto">
                  <Button variant="outline" size="sm">
                    <Link2 className="h-4 w-4 mr-2" />
                    Blockchain Explorer
                  </Button>
                </Link>
              </div>

            </CardContent>
          </Card>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Records List */}
          {isLoading ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <RefreshCw className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-600">Loading KYC records...</p>
              </CardContent>
            </Card>
          ) : searchedRecord ? (
            <div className="space-y-4">
              <Card className={`border-2 shadow-lg ${
                searchedRecord.status === "VERIFIED" 
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300" 
                  : searchedRecord.status === "PENDING"
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300"
                  : "bg-gradient-to-r from-red-50 to-rose-50 border-red-300"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {searchedRecord.status === "VERIFIED" ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : searchedRecord.status === "PENDING" ? (
                        <Clock className="h-6 w-6 text-yellow-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          ✅ KYC Record Found & Verified
                        </p>
                        <p className="text-xs text-gray-600">
                          Matched by {searchedRecord.id === searchQuery ? "KYC ID" : "Transaction Hash"} • Status: {searchedRecord.status}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearSearch}>
                      View All Records
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Basic Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <span className="font-medium text-slate-700">
                            {searchedRecord.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {searchedRecord.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {searchedRecord.phone}
                          </span>
                        </div>
                      </div>

                      {/* KYC Details */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">KYC ID</p>
                        <p className="font-mono text-xs font-medium text-slate-700 break-all">
                          {searchedRecord.id}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 mb-1">
                          PAN
                        </p>
                        <p className="font-mono text-xs font-medium text-slate-700">
                          {searchedRecord.pan}
                        </p>
                      </div>

                      {/* Status & Timing */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(searchedRecord.status)}
                          <Badge className={getStatusColor(searchedRecord.status)}>
                            {searchedRecord.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">Submitted</p>
                        <p className="text-xs text-slate-600">
                          {new Date(searchedRecord.createdAt).toLocaleDateString()}
                        </p>
                        {searchedRecord.verifiedAt && (
                          <>
                            <p className="text-xs text-slate-500 mt-1">
                              Verified
                            </p>
                            <p className="text-xs text-slate-600">
                              {new Date(
                                searchedRecord.verifiedAt,
                              ).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Documents */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Documents ({searchedRecord.documents?.length || 0})
                        </p>
                        <div className="space-y-1">
                          {searchedRecord.documents?.slice(0, 2).map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3 text-blue-600" />
                              <span className="text-xs text-slate-600">
                                {doc.type}
                              </span>
                            </div>
                          )) || []}
                          {(searchedRecord.documents?.length || 0) > 2 && (
                            <span className="text-xs text-slate-500">
                              +{(searchedRecord.documents?.length || 0) - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecord(searchedRecord)}
                        className="whitespace-nowrap"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                      {searchedRecord.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              updateKYCStatus(
                                searchedRecord.id,
                                "VERIFIED",
                                `✅ APPROVED: All documents verified for ${searchedRecord.name}`,
                              )
                            }
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {isUpdating ? "Approving..." : "✅ Approve"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              updateKYCStatus(
                                searchedRecord.id,
                                "REJECTED",
                                `❌ REJECTED: Please resubmit documents for ${searchedRecord.name}`,
                              )
                            }
                            disabled={isUpdating}
                            className="whitespace-nowrap"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            {isUpdating ? "Rejecting..." : "❌ Reject"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {searchedRecord.remarks && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">
                        Admin Remarks
                      </p>
                      <p className="text-sm text-slate-700">
                        {searchedRecord.remarks}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : records.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  No Records Found
                </h3>
                <p className="text-slate-500">
                  No KYC records match the selected criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Card
                  key={record.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Basic Info */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-slate-500" />
                            <span className="font-medium text-slate-700">
                              {record.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {record.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {record.phone}
                            </span>
                          </div>
                        </div>

                        {/* KYC Details */}
                        <div>
                          <p className="text-xs text-slate-500 mb-1">KYC ID</p>
                          <p className="font-mono text-xs font-medium text-slate-700 break-all">
                            {record.id}
                          </p>
                          <p className="text-xs text-slate-500 mt-2 mb-1">
                            PAN
                          </p>
                          <p className="font-mono text-xs font-medium text-slate-700">
                            {record.pan}
                          </p>
                        </div>

                        {/* Status & Timing */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(record.status)}
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">Submitted</p>
                          <p className="text-xs text-slate-600">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </p>
                          {record.verifiedAt && (
                            <>
                              <p className="text-xs text-slate-500 mt-1">
                                Verified
                              </p>
                              <p className="text-xs text-slate-600">
                                {new Date(
                                  record.verifiedAt,
                                ).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Documents */}
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            Documents ({record.documents?.length || 0})
                          </p>
                          <div className="space-y-1">
                            {record.documents?.slice(0, 2).map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3 text-blue-600" />
                                <span className="text-xs text-slate-600">
                                  {doc.type}
                                </span>
                              </div>
                            )) || []}
                            {(record.documents?.length || 0) > 2 && (
                              <span className="text-xs text-slate-500">
                                +{(record.documents?.length || 0) - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                          className="whitespace-nowrap"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                        {record.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateKYCStatus(
                                  record.id,
                                  "VERIFIED",
                                  `✅ APPROVED: All documents verified for ${record.name}`,
                                )
                              }
                              disabled={isUpdating}
                              className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {isUpdating ? "Approving..." : "✅ Approve"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                updateKYCStatus(
                                  record.id,
                                  "REJECTED",
                                  `❌ REJECTED: Please resubmit documents for ${record.name}`,
                                )
                              }
                              disabled={isUpdating}
                              className="whitespace-nowrap"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              {isUpdating ? "Rejecting..." : "❌ Reject"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {record.remarks && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">
                          Admin Remarks
                        </p>
                        <p className="text-sm text-slate-700">
                          {record.remarks}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Record Detail Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>KYC Record Details</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRecord(null)}
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Complete record details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">
                        Personal Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-slate-500">Name:</span>{" "}
                          {selectedRecord.name}
                        </p>
                        <p>
                          <span className="text-slate-500">Email:</span>{" "}
                          {selectedRecord.email}
                        </p>
                        <p>
                          <span className="text-slate-500">Phone:</span>{" "}
                          {selectedRecord.phone}
                        </p>
                        <p>
                          <span className="text-slate-500">PAN:</span>{" "}
                          {selectedRecord.pan}
                        </p>
                        <p>
                          <span className="text-slate-500">DOB:</span>{" "}
                          {selectedRecord.dateOfBirth}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">
                        Address
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-slate-500">Street:</span>{" "}
                          {selectedRecord.address.street}
                        </p>
                        <p>
                          <span className="text-slate-500">City:</span>{" "}
                          {selectedRecord.address.city}
                        </p>
                        <p>
                          <span className="text-slate-500">State:</span>{" "}
                          {selectedRecord.address.state}
                        </p>
                        <p>
                          <span className="text-slate-500">PIN:</span>{" "}
                          {selectedRecord.address.pincode}
                        </p>
                        <p>
                          <span className="text-slate-500">Country:</span>{" "}
                          {selectedRecord.address.country}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-blue-600" />
                      Blockchain Verification
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500 mb-1">Transaction Hash</p>
                        <p className="font-mono text-slate-700 break-all">
                          {selectedRecord.blockchainTxHash || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">KYC ID</p>
                        <p className="font-mono text-slate-700">
                          {selectedRecord.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Sector</p>
                        <Badge variant="outline">{selectedRecord.sector || 'GENERAL'}</Badge>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Expiry Date</p>
                        <p className="text-slate-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {selectedRecord.expiryDate ? new Date(selectedRecord.expiryDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => fetchBlockchainHistory(selectedRecord.id)}
                    >
                      <Link2 className="h-3 w-3 mr-2" />
                      View Blockchain History
                    </Button>
                  </div>

                  {/* Blockchain History */}
                  {blockchainHistory.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">
                        Blockchain History ({blockchainHistory.length} blocks)
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {blockchainHistory.map((block, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <Badge>{block.action}</Badge>
                              <span className="text-slate-500">
                                {new Date(block.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-slate-500">Block Hash</p>
                                <p className="font-mono text-slate-700">{block.hash.substring(0, 32)}...</p>
                              </div>
                              <div>
                                <p className="text-slate-500">TX Hash</p>
                                <p className="font-mono text-slate-700">{block.transactionHash.substring(0, 32)}...</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3">
                      Documents ({selectedRecord.documents?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {selectedRecord.documents?.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {doc.type}
                              </p>
                              <p className="text-xs text-slate-500">
                                Hash:{" "}
                                {doc.documentHash?.substring(0, 16) || "N/A"}...
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => alert(`Downloading ${doc.type}...`)}>
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {selectedRecord.status === "PENDING" && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">
                        Admin Actions
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="expiry-date">Expiry Date *</Label>
                          <Input
                            id="expiry-date"
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Select when this KYC will expire (user will be notified 10 days before)
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="remarks">Remarks</Label>
                          <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add remarks for verification decision..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button
                            onClick={() =>
                              updateKYCStatus(selectedRecord.id, "VERIFIED")
                            }
                            disabled={isUpdating || !expiryDate}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isUpdating ? "Approving..." : "✅ Approve KYC"}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              updateKYCStatus(selectedRecord.id, "REJECTED")
                            }
                            disabled={isUpdating}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {isUpdating ? "Rejecting..." : "❌ Reject KYC"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
