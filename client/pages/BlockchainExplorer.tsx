import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ArrowLeft,
  Link2,
  RefreshCw,
  Calendar,
  Hash,
  CheckCircle,
} from "lucide-react";
import { BlockData, BlockchainStatus } from "@shared/api";

export default function BlockchainExplorer() {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const fetchBlockchainData = async () => {
    setIsLoading(true);
    try {
      // Fetch blockchain status
      const statusResponse = await fetch("/api/blockchain/status");
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        setBlockchainStatus(statusResult.blockchain);
      }

      // Fetch all blocks
      const blocksResponse = await fetch("/api/blockchain/explorer");
      if (blocksResponse.ok) {
        const blocksResult = await blocksResponse.json();
        setBlocks(blocksResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
    } finally {
      setIsLoading(false);
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
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Blockchain Explorer
                </h1>
                <p className="text-xs text-slate-500">
                  SHA-256 Proof-of-Work Blockchain
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchBlockchainData} disabled={isLoading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Blockchain Stats */}
      {blockchainStatus && (
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Hash className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Blocks</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {blockchainStatus.totalBlocks}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Chain Status</p>
                    <p className="text-lg font-bold text-green-600">
                      {blockchainStatus.chainValid ? "✅ Valid" : "❌ Invalid"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Algorithm</p>
                    <p className="text-lg font-bold text-slate-800">
                      {blockchainStatus.algorithm}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Mining Difficulty</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {blockchainStatus.difficulty}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Blocks List */}
      <div className="container mx-auto px-6 py-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-blue-600" />
              Blockchain Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-600">Loading blockchain...</p>
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No blocks found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <Card
                    key={index}
                    className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
                      block.index === 0
                        ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300"
                        : "bg-white border-slate-200"
                    }`}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Block Index */}
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Block Index</p>
                            <p className="text-2xl font-bold text-slate-800">
                              #{block.index}
                            </p>
                            {block.index === 0 && (
                              <Badge className="mt-1 bg-purple-100 text-purple-800">
                                Genesis
                              </Badge>
                            )}
                          </div>

                          {/* Timestamp */}
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                            <p className="text-sm text-slate-700">
                              {new Date(block.timestamp).toLocaleString()}
                            </p>
                          </div>

                          {/* Action */}
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Action</p>
                            <Badge variant="outline">{block.action}</Badge>
                          </div>

                          {/* Nonce */}
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Nonce</p>
                            <p className="text-sm font-mono text-slate-700">
                              {block.nonce}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Hashes */}
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Block Hash</p>
                          <p className="font-mono text-xs text-blue-600 break-all">
                            {block.hash}
                          </p>
                        </div>
                        {block.index > 0 && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Previous Hash</p>
                            <p className="font-mono text-xs text-slate-600 break-all">
                              {block.previousHash}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Transaction Hash</p>
                          <p className="font-mono text-xs text-green-600 break-all">
                            {block.transactionHash}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Block Detail Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Block #{selectedBlock.index} Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBlock(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Index</p>
                  <p className="font-semibold">{selectedBlock.index}</p>
                </div>
                <div>
                  <p className="text-slate-500">Action</p>
                  <Badge>{selectedBlock.action}</Badge>
                </div>
                <div>
                  <p className="text-slate-500">Timestamp</p>
                  <p>{new Date(selectedBlock.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Nonce</p>
                  <p className="font-mono">{selectedBlock.nonce}</p>
                </div>
                <div>
                  <p className="text-slate-500">Difficulty</p>
                  <p>{selectedBlock.difficulty}</p>
                </div>
                <div>
                  <p className="text-slate-500">KYC ID</p>
                  <p className="font-mono text-xs">{selectedBlock.kycId}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-slate-500 text-sm mb-1">Block Hash</p>
                  <p className="font-mono text-xs bg-slate-50 p-2 rounded break-all">
                    {selectedBlock.hash}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">Previous Hash</p>
                  <p className="font-mono text-xs bg-slate-50 p-2 rounded break-all">
                    {selectedBlock.previousHash}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">Transaction Hash</p>
                  <p className="font-mono text-xs bg-slate-50 p-2 rounded break-all">
                    {selectedBlock.transactionHash}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">Merkle Root</p>
                  <p className="font-mono text-xs bg-slate-50 p-2 rounded break-all">
                    {selectedBlock.merkleRoot}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
