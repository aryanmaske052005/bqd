import { AuthForm } from '../components/AuthForm';
import { HeartPulse } from 'lucide-react';

export default function MedicalAuth() {
  return (
    <AuthForm 
      role="medical_officer"
      roleName="Medical Officer"
      roleColor="red"
      roleIcon={<HeartPulse />}
      sector="HEALTHCARE"
    />
  );
}
