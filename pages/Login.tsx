import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CheckSquare } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.login({ email, password });
      login(response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    const demoEmail = 'demo@taskflow.pro';
    const demoPassword = 'Password123!';

    try {
      // First try to login
      const response = await api.login({ email: demoEmail, password: demoPassword });
      login(response);
      navigate('/dashboard');
    } catch (loginError) {
      // If login fails, try to register
      try {
        const registerResponse = await api.register({
          name: 'Demo User',
          email: demoEmail,
          password: demoPassword
        });
        login(registerResponse);
        navigate('/dashboard');
      } catch (registerError: any) {
        // Fallback: If backend is unreachable ("Failed to fetch"), create a mock session
        if (registerError.message === 'Failed to fetch' || registerError.message.includes('NetworkError')) {
           console.warn('Backend unreachable. Entering Demo Mode with mock data.');
           login({
             token: 'demo-mock-token-12345',
             user: {
               id: 'demo-user-id',
               email: demoEmail,
               name: 'Demo User'
             }
           });
           navigate('/dashboard');
           return;
        }

        console.error('Demo registration failed:', registerError);
        setError('Failed to sign in with demo account. Please try registering manually.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <CheckSquare className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
                id="email"
                type="email"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Input
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" isLoading={loading}>
                Sign in
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                className="w-full" 
                onClick={handleDemoLogin}
                isLoading={loading}
              >
                Demo Login
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/register" className="font-medium text-primary hover:text-indigo-500">
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};