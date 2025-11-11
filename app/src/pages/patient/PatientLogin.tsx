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
  const [showRegister, setShowRegister] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');
  
  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRoomNumber, setRegRoomNumber] = useState('');
  const [regDateOfBirth, setRegDateOfBirth] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regBloodType, setRegBloodType] = useState('');
  const [regAllergies, setRegAllergies] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear previous errors
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
      console.error('Login error:', err);
      
      // Show user-friendly error message
      let errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      
      if (err.response) {
        // Axios error with response
        const backendMessage = err.response.data?.message || err.response.data?.error || err.response.statusText;
        if (backendMessage && (backendMessage.includes('Invalid') || backendMessage.includes('credentials'))) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (backendMessage) {
          errorMessage = backendMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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

  // Helper function to convert date formats to ISO string (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse MM/DD/YYYY or DD/MM/YYYY format
    const dateParts = dateString.split(/[\/\-]/);
    if (dateParts.length === 3) {
      let month: string, day: string, year: string;
      
      // Determine format: if first part > 12, it's likely DD/MM/YYYY, else MM/DD/YYYY
      if (parseInt(dateParts[0]) > 12) {
        // DD/MM/YYYY format
        day = dateParts[0].padStart(2, '0');
        month = dateParts[1].padStart(2, '0');
        year = dateParts[2];
      } else {
        // MM/DD/YYYY format
        month = dateParts[0].padStart(2, '0');
        day = dateParts[1].padStart(2, '0');
        year = dateParts[2];
      }
      
      // Validate year is 4 digits
      if (year.length === 2) {
        // Assume 19xx or 20xx
        year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
      }
      
      // Create date string in YYYY-MM-DD format
      const isoDate = `${year}-${month}-${day}`;
      
      // Validate the date is actually valid
      const date = new Date(isoDate);
      if (!isNaN(date.getTime())) {
        return isoDate;
      }
    }
    
    // If we can't parse it, try to let the browser handle it
    return dateString;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegDateOfBirth(value);
  };

  const handleDateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (!value) {
      setRegDateOfBirth('');
      return;
    }
    
    // If user typed a date in MM/DD/YYYY format, keep it as is for display
    // but we'll convert it to YYYY-MM-DD when submitting
    // Just validate it's a valid date
    const formatted = formatDateForInput(value);
    if (formatted && formatted !== value && /^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
      // Valid date - keep the original format for user display
      // The formatted version will be used on submit
      return;
    }
    
    // If it's already in YYYY-MM-DD format, keep it
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegistering(true);
    setRegisterSuccess('');

    try {
      // Format date of birth if provided
      let formattedDateOfBirth = regDateOfBirth;
      if (regDateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(regDateOfBirth)) {
        formattedDateOfBirth = formatDateForInput(regDateOfBirth);
        if (!formattedDateOfBirth) {
          setError('Please enter a valid date of birth (MM/DD/YYYY or YYYY-MM-DD format)');
          setRegistering(false);
          return;
        }
      }

      const response = await authApi.registerPatient({
        email: regEmail,
        password: regPassword,
        name: regName,
        roomNumber: regRoomNumber || undefined,
        dateOfBirth: formattedDateOfBirth || undefined,
        gender: regGender || undefined,
        bloodType: regBloodType || undefined,
        allergies: regAllergies || undefined,
      });

      setRegisterSuccess(`Account created successfully! You can now log in as ${response.email}`);
      
      // Clear form
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRoomNumber('');
      setRegDateOfBirth('');
      setRegGender('');
      setRegBloodType('');
      setRegAllergies('');
      
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showRegister ? 'Create Patient Account' : 'Welcome to Patient Care Hub'}
            </h1>
            <p className="text-gray-600">
              {showRegister
                ? 'Register a new patient account'
                : 'Manage your health records, schedule appointments, and more.'}
            </p>
          </div>

          {!showRegister ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  placeholder="Email"
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
                  Create New Patient Account
                </button>
                <button
                  onClick={() => navigate('/staff/login')}
                  className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                >
                  Staff Login →
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
                    placeholder="John Doe"
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
                    placeholder="patient@example.com"
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
                    Room Number
                  </label>
                  <Input
                    type="text"
                    placeholder="101 (optional)"
                    value={regRoomNumber}
                    onChange={(e) => setRegRoomNumber(e.target.value)}
                    disabled={registering}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={regDateOfBirth}
                      onChange={handleDateChange}
                      onBlur={handleDateBlur}
                      disabled={registering}
                      placeholder="MM/DD/YYYY (e.g., 11/11/2000)"
                      pattern="\d{1,2}/\d{1,2}/\d{4}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Format: MM/DD/YYYY (e.g., 11/11/2000)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      disabled={registering}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Type
                    </label>
                    <select
                      value={regBloodType}
                      onChange={(e) => setRegBloodType(e.target.value)}
                      disabled={registering}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">Select...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Penicillin, None"
                    value={regAllergies}
                    onChange={(e) => setRegAllergies(e.target.value)}
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

