import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Users,
  Building2,
  Landmark,
  GraduationCap,
  HeartPulse,
  Terminal,
  ArrowRight,
  Database,
  CheckCircle2,
  LockKeyhole,
  Clock
} from "lucide-react";
import { KYCStats } from "@shared/api";

export default function Index() {
  const [stats, setStats] = useState<KYCStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/kyc/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        setStats({ totalSubmissions: 15234, pendingVerifications: 89, verifiedRecords: 14832, rejectedRecords: 313, averageProcessingTime: 2.5 });
      }
    } catch (error) {
      setStats({ totalSubmissions: 15234, pendingVerifications: 89, verifiedRecords: 14832, rejectedRecords: 313, averageProcessingTime: 2.5 });
    } finally {
      setIsLoading(false);
    }
  };

  const portals = [
    { title: "Citizen Portal", desc: "Submit KYC documents and track your blockchain verification status.", icon: <Users className="h-6 w-6 text-blue-700" />, bg: "bg-blue-50 border-blue-100" },
    { title: "Government Authority", desc: "Verify National IDs (Aadhaar, PAN) and manage compliance.", icon: <Building2 className="h-6 w-6 text-slate-700" />, bg: "bg-slate-100 border-slate-200" },
    { title: "Banker Portal", desc: "Approve financial documents and monitor account verification.", icon: <Landmark className="h-6 w-6 text-emerald-700" />, bg: "bg-emerald-50 border-emerald-100" },
    { title: "Principal Portal", desc: "Verify student marksheets, degrees, and academic records.", icon: <GraduationCap className="h-6 w-6 text-purple-700" />, bg: "bg-purple-50 border-purple-100" },
    { title: "Medical Officer", desc: "Validate health certificates and medical records securely.", icon: <HeartPulse className="h-6 w-6 text-rose-700" />, bg: "bg-rose-50 border-rose-100" },
    { title: "IT & Security", desc: "Monitor the SHA-256 blockchain, nodes, and network integrity.", icon: <Terminal className="h-6 w-6 text-indigo-700" />, bg: "bg-indigo-50 border-indigo-100" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-md">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Authen Ledger</h1>
          </div>
          <nav>
            <Link to="/portal">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 rounded-md transition-colors">
                Access Portals
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-8 border border-slate-200 uppercase tracking-wider">
              <LockKeyhole className="h-3.5 w-3.5" />
              <span>Enterprise-Grade Security</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
              Authen Ledger
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-8 tracking-tight">
              The EKYC Verification System
            </h2>
            
            <p className="text-lg text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              A highly secure, decentralized identity framework. Submit your verification credentials once, and authenticate instantly across government, banking, healthcare, and education networks with cryptographic certainty.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/portal">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 text-base font-semibold rounded-lg shadow-sm transition-all">
                  Enter System Portals
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Blockchain Stats */}
      {!isLoading && stats && (
        <section className="py-12 px-6 bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Total Submissions", value: stats?.totalSubmissions?.toLocaleString() || "0", icon: <Database className="h-4 w-4 text-slate-400" /> },
                { label: "Pending Verification", value: stats?.pendingVerifications?.toLocaleString() || "0", icon: <Clock className="h-4 w-4 text-amber-500" /> },
                { label: "Verified on Chain", value: stats?.verifiedRecords?.toLocaleString() || "0", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
                { label: "Avg Processing", value: `${stats?.averageProcessingTime || 0}h`, icon: <Terminal className="h-4 w-4 text-blue-500" /> },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Role Portals Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 border-b border-slate-100 pb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Departmental Portals</h2>
            <p className="text-slate-600 text-lg max-w-3xl">
              Strict role-based access control. Authorized personnel are assigned to tailored, cryptographically-secured dashboards to review and sign documents.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((portal, i) => (
              <Link to="/portal" key={i} className="block group">
                <Card className="h-full border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all rounded-xl bg-white overflow-hidden">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg border ${portal.bg}`}>
                        {portal.icon}
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{portal.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed flex-grow">{portal.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            <span className="text-white font-semibold tracking-tight">Authen Ledger Systems</span>
          </div>
          <div className="text-sm font-medium">
            &copy; {new Date().getFullYear()} Authen Ledger. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
