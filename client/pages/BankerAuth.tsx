import { AuthForm } from '../components/AuthForm';
import { Landmark } from 'lucide-react';

export default function BankerAuth() {
  return (
    <AuthForm 
      role="banker"
      roleName="Banker"
      roleColor="green"
      roleIcon={<Landmark />}
      sector="FINANCE"
    />
  );
}
