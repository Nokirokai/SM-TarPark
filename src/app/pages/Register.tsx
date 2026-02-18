import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { User, Mail, Lock, Phone, Car } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    plateNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await signUp(formData.email, formData.password, {
        name: formData.fullName,
        role: 'public', // Default role for public users
        phone: formData.phone,
        plateNumber: formData.plateNumber
      });
      
      toast.success('Account created successfully!');
      navigate('/public');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account');
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
              <span className="text-blue-800 font-bold text-2xl">SM</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-blue-200">Register to use SM TarPark</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Owner Registration</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Juan Dela Cruz"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+63 912 345 6789"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plate Number
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({...formData, plateNumber: e.target.value.toUpperCase()})}
                    placeholder="ABC123"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 rounded" required />
              <label className="text-sm text-gray-600">
                I agree to the Terms of Service and Privacy Policy. I understand that my vehicle information
                will be used for parking management purposes.
              </label>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-800 hover:text-blue-900 font-medium"
              >
                Login here
              </button>
            </p>
          </div>
        </Card>

        <p className="text-center text-blue-200 text-sm mt-6">
          © 2026 SM Tarlac. All rights reserved.
        </p>
      </div>
    </div>
  );
}