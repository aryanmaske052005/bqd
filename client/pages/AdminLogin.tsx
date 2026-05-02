import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
  Building2,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Landmark,
} from "lucide-react";

const ADMIN_SECTORS = [
  { id: "BANKING", label: "Banking", icon: Landmark, color: "blue" },
  { id: "HEALTHCARE", label: "Medical/Healthcare", icon: Stethoscope, color: "green" },
  { id: "EDUCATION", label: "College/Education", icon: GraduationCap, color: "purple" },
  { id: "TELECOM", label: "Telecom/Company", icon: Briefcase, color: "orange" },
  { id: "GOVERNMENT", label: "Government", icon: Building2, color: "red" },
  { id: "FINANCE", label: "Finance", icon: Landmark, color: "indigo" },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, sector: selectedSector }),
      });

      const result = await response.json();

      if (result.success) {
        // Store admin info in session
        sessionStorage.setItem("adminSession", JSON.stringify(result.data));
        navigate("/admin/dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
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
                  Authen Ledger
                </h1>
                <p className="text-xs text-slate-500">Admin Portal Login</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-full w-fit mx-auto mb-4">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Admin Login
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Select your sector and login with your credentials
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Sector Selection */}
                <div>
                  <Label className="mb-3 block">Select Your Sector *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ADMIN_SECTORS.map((sector) => {
                      const Icon = sector.icon;
                      const isSelected = selectedSector === sector.id;
                      return (
                        <button
                          key={sector.id}
                          type="button"
                          onClick={() => setSelectedSector(sector.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? `border-${sector.color}-600 bg-${sector.color}-50`
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <Icon className={`h-5 w-5 mx-auto mb-1 ${
                            isSelected ? `text-${sector.color}-600` : "text-slate-500"
                          }`} />
                          <p className={`text-xs font-medium ${
                            isSelected ? `text-${sector.color}-800` : "text-slate-600"
                          }`}>
                            {sector.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Admin Email</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@sector.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !selectedSector || !email || !password}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  size="lg"
                >
                  {isLoading ? "Logging in..." : "Login to Admin Portal"}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p><strong>Banking:</strong> bank@admin.com / admin123</p>
                  <p><strong>Medical:</strong> medical@admin.com / admin123</p>
                  <p><strong>College:</strong> college@admin.com / admin123</p>
                  <p><strong>Government:</strong> gov@admin.com / admin123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
