import { useAuth } from '@/app/providers/AuthContext';
import { useNavigate } from 'react-router-dom';

import { LoginBackground } from './components/LoginBackground';
import { LoginForm } from './components/LoginForm';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

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
