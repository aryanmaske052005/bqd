import { AuthForm } from '../components/AuthForm';
import { GraduationCap } from 'lucide-react';

export default function PrincipalAuth() {
  return (
    <AuthForm 
      role="principal"
      roleName="Principal"
      roleColor="purple"
      roleIcon={<GraduationCap />}
      sector="EDUCATION"
    />
  );
}
