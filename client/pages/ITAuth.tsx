import { AuthForm } from '../components/AuthForm';
import { MonitorPlay } from 'lucide-react';

export default function ITAuth() {
  return (
    <AuthForm 
      role="it_officer"
      roleName="IT Officer"
      roleColor="cyan"
      roleIcon={<MonitorPlay />}
      sector="IT"
    />
  );
}
