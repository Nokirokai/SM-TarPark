import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User, Car, CreditCard, History, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    gcashNumber: '',
    role: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        gcashNumber: '',
        role: user.role || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await authAPI.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        gcashNumber: profileData.gcashNumber,
      });

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account and vehicles</p>
      </div>

      {/* Profile Info */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-800" />
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GCash Number</label>
            <input
              type="tel"
              value={profileData.gcashNumber}
              onChange={(e) => setProfileData({ ...profileData, gcashNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </Card>

      {/* My Vehicles */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-blue-800" />
          <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
        </div>
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-lg">ABC123</p>
                <p className="text-sm text-gray-600">Toyota Vios - White</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-semibold">Credit Score: 95</span>
                  <span className="text-gray-600">156 entries</span>
                  <span className="text-gray-600">0 violations</span>
                </div>
              </div>
              <Button variant="secondary">Manage</Button>
            </div>
          </div>
          <Button>
            <Car className="w-4 h-4" />
            Add Vehicle
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-blue-800" />
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {[
            { date: 'Feb 16, 2026 08:30 AM', action: 'Parked at Zone A', slot: 'A15', fee: 50 },
            { date: 'Feb 15, 2026 02:45 PM', action: 'Parked at Zone C', slot: 'C08', fee: 40 },
            { date: 'Feb 14, 2026 10:15 AM', action: 'Parked at Zone B', slot: 'B23', fee: 60 }
          ].map((activity, i) => (
            <div key={i} className="border-b border-gray-200 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.date} - Slot {activity.slot}</p>
                </div>
                <span className="text-green-600 font-bold">{'\u20B1'}{activity.fee}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Method */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-blue-800" />
          <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
        </div>
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">GCash</p>
                <p className="text-sm text-gray-600">{profileData.gcashNumber || '**** **** **** 6789'}</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Primary</span>
          </div>
          <Button variant="secondary">Add Payment Method</Button>
        </div>
      </Card>
    </div>
  );
}
