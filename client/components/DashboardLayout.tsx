import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Home, FileText, Activity, Shield, Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { profile, signOut, role } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/portal');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getDashboardRoute = () => {
    if (!role) return '/';
    return `/dashboard/${role.replace('_officer', '').replace('_official', '')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-white">Authen Ledger</span>
        </div>
        
        <div className="p-6 border-b border-slate-800 flex items-center space-x-4">
          <Avatar className="h-10 w-10 border-2 border-slate-700 bg-slate-800">
            <AvatarFallback className="bg-slate-800 text-blue-400">{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">{profile?.full_name}</span>
            <span className="text-xs text-slate-500 capitalize">{profile?.role?.replace('_', ' ')}</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to={getDashboardRoute()}>
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
              <Home className="mr-3 h-5 w-5" />
              Dashboard Home
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
              <Activity className="mr-3 h-5 w-5" />
              Main Website
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={handleSignOut}>
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <span className="font-bold">Authen Ledger</span>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b px-6 py-4 sticky top-0 z-40 hidden md:block">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        </header>
        <div className="md:hidden bg-white border-b px-6 py-4">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
