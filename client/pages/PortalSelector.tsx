import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  GraduationCap, 
  Landmark, 
  MonitorPlay, 
  HeartPulse, 
  Building2,
  ArrowLeft
} from 'lucide-react';

const portals = [
  {
    id: 'user',
    title: 'User Portal',
    description: 'Submit KYC documents, track verification status, and view your immutable audit trail.',
    icon: <User className="h-8 w-8 text-white" />,
    color: 'from-blue-600 to-indigo-600',
    hoverColor: 'hover:shadow-blue-500/20',
    route: '/auth/user'
  },
  {
    id: 'principal',
    title: 'Principal Portal',
    description: 'Verify student marksheets, diplomas, and educational certificates securely.',
    icon: <GraduationCap className="h-8 w-8 text-white" />,
    color: 'from-purple-600 to-fuchsia-600',
    hoverColor: 'hover:shadow-purple-500/20',
    route: '/auth/principal'
  },
  {
    id: 'banker',
    title: 'Banker Portal',
    description: 'Review financial documents, bank statements, and approve banking KYC requirements.',
    icon: <Landmark className="h-8 w-8 text-white" />,
    color: 'from-emerald-600 to-teal-600',
    hoverColor: 'hover:shadow-emerald-500/20',
    route: '/auth/banker'
  },
  {
    id: 'it_officer',
    title: 'IT Officer Portal',
    description: 'Monitor system health, verify blockchain integrity, and flag suspicious document activity.',
    icon: <MonitorPlay className="h-8 w-8 text-white" />,
    color: 'from-cyan-600 to-blue-500',
    hoverColor: 'hover:shadow-cyan-500/20',
    route: '/auth/it'
  },
  {
    id: 'medical',
    title: 'Medical Officer',
    description: 'Verify health records, medical certificates, and specialized health KYC requirements.',
    icon: <HeartPulse className="h-8 w-8 text-white" />,
    color: 'from-red-600 to-rose-600',
    hoverColor: 'hover:shadow-red-500/20',
    route: '/auth/medical'
  },
  {
    id: 'government',
    title: 'Government Official',
    description: 'Master access for Aadhaar, PAN validation, and cross-referencing all compliance data.',
    icon: <Building2 className="h-8 w-8 text-white" />,
    color: 'from-amber-500 to-orange-600',
    hoverColor: 'hover:shadow-amber-500/20',
    route: '/auth/government'
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function PortalSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 bg-opacity-95 text-slate-100 p-6 relative overflow-hidden flex flex-col items-center">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto pt-8 pb-16 relative z-10">
        <Button 
          variant="ghost" 
          className="mb-8 text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
          >
            Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Portal</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Access the role-specific dashboard tailored to your verification clearance and responsibilities.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {portals.map((portal) => (
            <motion.div key={portal.id} variants={item}>
              <Card className={`bg-slate-800/50 backdrop-blur-sm border-slate-700 h-full flex flex-col hover:bg-slate-800 transition-all duration-300 shadow-lg ${portal.hoverColor}`}>
                <CardHeader>
                  <div className={`p-3 rounded-2xl w-fit mb-4 shadow-lg bg-gradient-to-br ${portal.color}`}>
                    {portal.icon}
                  </div>
                  <CardTitle className="text-2xl text-slate-100">{portal.title}</CardTitle>
                  <CardDescription className="text-slate-400 text-base mt-2">
                    {portal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-6">
                  <Link to={portal.route} className="w-full">
                    <Button className={`w-full bg-slate-700 hover:bg-gradient-to-r ${portal.color} text-white border-0 transition-all duration-300`}>
                      Login / Register
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
