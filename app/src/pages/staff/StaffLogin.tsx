import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const StaffLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');
  
  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'NURSE' | 'PHYSICIAN' | 'ADMIN'>('NURSE');
  const [regDepartment, setRegDepartment] = useState('');
  const [regShift, setRegShift] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      
      // Check if user is staff
      if (response.user.role === 'PATIENT') {
        setError('Please use patient login for patient accounts');
        setLoading(false);
        return;
      }

      login(response.accessToken, response.user);
      navigate('/staff/dashboard');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegistering(true);
    setRegisterSuccess('');

    try {
      const response = await authApi.registerStaff({
        email: regEmail,
        password: regPassword,
        name: regName,
        role: regRole,
        department: regDepartment || undefined,
        shift: regShift || undefined,
      });

      setRegisterSuccess(`Account created successfully! You can now log in as ${response.email}`);
      
      // Clear form
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegDepartment('');
      setRegShift('');
      
      // Auto-switch to login after 2 seconds
      setTimeout(() => {
        setShowRegister(false);
        setEmail(response.email);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showRegister ? 'Create Staff Account' : 'Patient Care Hub'}
            </h1>
            <h2 className="text-xl text-gray-600">
              {showRegister ? 'Register a new staff member' : 'Welcome Back'}
            </h2>
          </div>

          {!showRegister ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  placeholder="Employee Email"
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

              <div className="mt-6 text-center space-y-2">
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium block w-full"
                >
                  Create New Staff Account
                </button>
                <button
                  onClick={() => navigate('/patient/login')}
                  className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                >
                  ← Patient Login
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={registering}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="staff@hospital.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={registering}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={registering}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as 'NURSE' | 'PHYSICIAN' | 'ADMIN')}
                    disabled={registering}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  >
                    <option value="NURSE">Nurse</option>
                    <option value="PHYSICIAN">Physician (Doctor)</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Cardiology, Emergency, General"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    disabled={registering}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Day Shift (7AM-7PM)"
                    value={regShift}
                    onChange={(e) => setRegShift(e.target.value)}
                    disabled={registering}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {registerSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">{registerSuccess}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={registering || !regName || !regEmail || !regPassword}
                    fullWidth
                  >
                    {registering ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowRegister(false);
                      setError('');
                      setRegisterSuccess('');
                    }}
                    variant="secondary"
                    fullWidth
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setShowRegister(false);
                    setError('');
                    setRegisterSuccess('');
                  }}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </div>

        {/* Demo credentials hint with reset button */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium">Demo Credentials:</p>
              <p className="text-xs text-blue-700 mt-1">nurse.williams@hospital.com / password123</p>
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

export default StaffLogin;

