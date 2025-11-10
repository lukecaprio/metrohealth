import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const PatientLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      
      // Check if user is a patient
      if (response.user.role !== 'PATIENT') {
        setError('Please use staff login for staff accounts');
        setLoading(false);
        return;
      }

      login(response.accessToken, response.user);
      navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Are you sure you want to reset all demo data? This will restore the original seed data.')) {
      return;
    }

    setResetting(true);
    setError('');
    setResetSuccess('');

    try {
      await authApi.resetDemoData();
      setResetSuccess('Demo data reset successfully! You can now log in with the original credentials.');
    } catch (err: any) {
      setError('Failed to reset demo data. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Patient Care Hub
            </h1>
            <p className="text-gray-600">
              Manage your health records, schedule appointments, and more.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              fullWidth
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/staff/login')}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Staff Login →
            </button>
          </div>
        </div>

        {/* Demo credentials hint with reset button */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium">Demo Credentials:</p>
              <p className="text-xs text-blue-700 mt-1">john.smith@patient.com / password123</p>
            </div>
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="ml-3 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
            >
              {resetting ? 'Resetting...' : 'Reset Demo'}
            </button>
          </div>
          {resetSuccess && (
            <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded">
              <p className="text-xs text-green-800">{resetSuccess}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;

