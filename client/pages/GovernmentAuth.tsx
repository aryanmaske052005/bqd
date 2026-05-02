import { AuthForm } from '../components/AuthForm';
import { Building2 } from 'lucide-react';

export default function GovernmentAuth() {
  return (
    <AuthForm 
      role="government_official"
      roleName="Government Official"
      roleColor="amber"
      roleIcon={<Building2 />}
      sector="GOVERNMENT"
    />
  );
}
