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
  History,
  Search,
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Loader2,
  Hash,
  ExternalLink,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import { KYCHistoryEntry, ApiResponse } from "@shared/api";

export default function KYCHistory() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("id") || "");
  const [historyEntries, setHistoryEntries] = useState<KYCHistoryEntry[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [showAllRecords, setShowAllRecords] = useState(false);

  useEffect(() => {
    if (searchParams.get("id")) {
      fetchHistory();
    }
  }, []);

  const fetchAllRecords = async () => {
    setIsLoading(true);
    setSearchError("");
    setAllRecords([]);
    setShowAllRecords(true);

    try {
      const response = await fetch("/api/admin/kyc/all?status=all&limit=100");
      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setAllRecords(result.data.records || []);
      } else {
        setSearchError(result.message || "Failed to fetch records");
      }
    } catch (error) {
      setSearchError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a KYC ID");
      return;
    }

    setIsLoading(true);
    setSearchError("");
    setHistoryEntries([]);
    setShowAllRecords(false);

    try {
      const params = new URLSearchParams({
        kycId: searchQuery.trim(),
      });

      if (filterAction !== "all") {
        params.append("action", filterAction);
      }

      const response = await fetch(`/api/kyc/history?${params}`);
      const result: ApiResponse<KYCHistoryEntry[]> = await response.json();

      if (result.success && result.data) {
        setHistoryEntries(result.data);
      } else {
        setSearchError(result.message || "Failed to fetch history");
      }
    } catch (error) {
      setSearchError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "UPDATED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "VERIFIED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "RESUBMITTED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATED":
        return <FileText className="h-4 w-4" />;
      case "UPDATED":
        return <AlertTriangle className="h-4 w-4" />;
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "RESUBMITTED":
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const exportHistory = () => {
    const csvContent = [
      [
        "Timestamp",
        "Action",
        "Performed By",
        "Transaction Hash",
        "Remarks",
      ].join(","),
      ...historyEntries.map((entry) =>
        [
          entry.performedAt,
          entry.action,
          entry.performedBy,
          entry.blockchainTxHash,
          entry.remarks || "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyc-history-${searchQuery}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
                <p className="text-xs text-slate-500">
                  KYC History & Audit Trail
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
        <div className="max-w-6xl mx-auto">
          {/* Search Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                KYC History & Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="search">KYC ID</Label>
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter KYC ID to view history"
                    onKeyPress={(e) => e.key === "Enter" && fetchHistory()}
                  />
                </div>
                <div>
                  <Label htmlFor="filter">Filter by Action</Label>
                  <select
                    id="filter"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="all">All Actions</option>
                    <option value="CREATED">Created</option>
                    <option value="UPDATED">Updated</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="RESUBMITTED">Resubmitted</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={fetchHistory}
                    disabled={isLoading || !searchQuery.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={fetchAllRecords}
                    disabled={isLoading}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Show All Records
                  </Button>
                  <Link to="/admin">
                    <Button
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 whitespace-nowrap"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                </div>
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

          {/* All Records Results */}
          {showAllRecords && allRecords.length > 0 && (
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    All KYC Records ({allRecords.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allRecords.map((record, index) => (
                      <div
                        key={record.id}
                        className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-slate-500" />
                                <span className="font-medium text-slate-700">
                                  {record.name}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Email: {record.email}
                              </p>
                              <p className="text-xs text-slate-500">
                                Phone: {record.phone}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">
                                KYC ID
                              </p>
                              <p className="font-mono text-xs font-medium text-slate-700 break-all">
                                {record.id}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                PAN: {record.pan}
                              </p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  className={
                                    record.status === "VERIFIED"
                                      ? "bg-green-100 text-green-800"
                                      : record.status === "PENDING"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">
                                Submitted:{" "}
                                {new Date(
                                  record.createdAt,
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-slate-500">
                                Documents: {record.documents?.length || 0}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link to={`/history?id=${record.id}`}>
                              <Button variant="outline" size="sm">
                                <History className="h-3 w-3 mr-1" />
                                History
                              </Button>
                            </Link>
                            <Link to={`/verify?id=${record.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                        {record.remarks && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-500 mb-1">
                              Remarks
                            </p>
                            <p className="text-sm text-slate-700">
                              {record.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* History Results */}
          {!showAllRecords && historyEntries.length > 0 && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Audit Trail Summary
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {historyEntries.length} entries
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportHistory}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      "CREATED",
                      "UPDATED",
                      "VERIFIED",
                      "REJECTED",
                      "RESUBMITTED",
                    ].map((action) => {
                      const count = historyEntries.filter(
                        (entry) => entry.action === action,
                      ).length;
                      return (
                        <div key={action} className="text-center">
                          <div className="text-2xl font-bold text-slate-800">
                            {count}
                          </div>
                          <div className="text-sm text-slate-500 capitalize">
                            {action.toLowerCase()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {historyEntries.map((entry, index) => {
                      const { date, time } = formatDate(entry.performedAt);
                      return (
                        <div
                          key={entry.id}
                          className="flex items-start space-x-4"
                        >
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`p-2 rounded-full ${getActionColor(entry.action).split(" ")[0]} border-2 border-white shadow-sm`}
                            >
                              {getActionIcon(entry.action)}
                            </div>
                            {index < historyEntries.length - 1 && (
                              <div className="w-px h-12 bg-slate-200 mt-2"></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="bg-slate-50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={getActionColor(entry.action)}
                                  >
                                    {entry.action}
                                  </Badge>
                                  <span className="text-sm text-slate-600">
                                    by {entry.performedBy}
                                  </span>
                                </div>
                                <div className="text-sm text-slate-500 text-right">
                                  <div>{date}</div>
                                  <div>{time}</div>
                                </div>
                              </div>

                              {entry.remarks && (
                                <p className="text-sm text-slate-700 mb-3">
                                  {entry.remarks}
                                </p>
                              )}

                              {/* Transaction Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <p className="text-slate-500 mb-1">
                                    Transaction Hash
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <code className="font-mono text-slate-600 break-all">
                                      {entry.blockchainTxHash?.substring(
                                        0,
                                        20,
                                      ) || "N/A"}
                                      {entry.blockchainTxHash && "..."}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-1"
                                      onClick={() => {
                                        if (entry.blockchainTxHash) {
                                          window.open('/blockchain-explorer', '_blank');
                                        }
                                      }}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-slate-500 mb-1">
                                    Entry ID
                                  </p>
                                  <code className="font-mono text-slate-600">
                                    {entry.id}
                                  </code>
                                </div>
                              </div>

                              {/* Additional Details */}
                              {entry.details &&
                                Object.keys(entry.details).length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-200">
                                    <details className="text-xs">
                                      <summary className="cursor-pointer text-slate-600 hover:text-slate-800">
                                        <span className="inline-flex items-center gap-1">
                                          <Eye className="h-3 w-3" />
                                          View Details
                                        </span>
                                      </summary>
                                      <div className="mt-2 bg-white rounded p-2 border">
                                        <pre className="text-xs text-slate-600 overflow-x-auto">
                                          {JSON.stringify(
                                            entry.details,
                                            null,
                                            2,
                                          )}
                                        </pre>
                                      </div>
                                    </details>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!isLoading &&
            historyEntries.length === 0 &&
            searchQuery &&
            !searchError && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    No History Found
                  </h3>
                  <p className="text-slate-500 mb-6">
                    No audit trail entries found for the specified KYC ID and
                    filters.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                    <Link to="/verify">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        Verify KYC Status
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Quick Actions */}
          {!isLoading && historyEntries.length === 0 && !searchQuery && (
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
                  <Link to="/verify">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Search className="h-6 w-6 mb-2" />
                      Verify Status
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
          )}
        </div>
      </div>
    </div>
  );
}
