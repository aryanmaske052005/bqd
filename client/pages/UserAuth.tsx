import { AuthForm } from '../components/AuthForm';
import { User } from 'lucide-react';

export default function UserAuth() {
  return (
    <AuthForm 
      role="user"
      roleName="User"
      roleColor="blue"
      roleIcon={<User />}
    />
  );
}
