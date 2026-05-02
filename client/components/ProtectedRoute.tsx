import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'user' | 'principal' | 'banker' | 'it_officer' | 'medical_officer' | 'government_official';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, profile, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    // Determine the correct auth route based on the dashboard they tried to access
    const pathParts = location.pathname.split('/');
    const dashboardType = pathParts.length > 2 ? pathParts[2] : '';
    const authRoute = dashboardType ? `/auth/${dashboardType}` : '/portal';
    
    return <Navigate to={authRoute} state={{ from: location }} replace />;
  }

  if (role !== allowedRole) {
    // Redirect to their actual dashboard or portal
    const dashboardRoute = role ? `/dashboard/${role.replace('_officer', '').replace('_official', '')}` : '/portal';
    return <Navigate to={dashboardRoute} replace />;
  }

  // Check approval for officer roles
  if (role !== 'user' && profile && !profile.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-amber-100 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-slate-800">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-slate-600">
            <p className="mb-6">
              Your {role.replace('_', ' ')} account is currently pending approval by the system administrator.
            </p>
            <p className="text-sm">
              You will be able to access your dashboard once your account has been verified.
            </p>
            <div className="mt-6">
              <a href="/" className="text-blue-600 hover:underline text-sm font-medium">
                Return to Home
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
