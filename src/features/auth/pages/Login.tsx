import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { LoginForm } from '../components/LoginForm';
import { LoginBackground } from '../components/LoginBackground';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return null;

  const handleLogin = (username: string, password: string) => {
    const success = login(username.trim(), password);

    if (success) {
      navigate('/dashboard');
      return true;
    }

    return false;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <LoginBackground />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
}
