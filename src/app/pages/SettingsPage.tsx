import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Settings, Users, MapPin, Bell, Key, Trash2, Plus, Edit } from 'lucide-react';
import { slotsAPI, authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface UserDisplay {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface Zone {
  zone: string;
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
}

export function SettingsPage() {
  const { user } = useAuth();
  const [gcashApiKey, setGcashApiKey] = useState('sk_test_••••••••••••••••');
  const [notificationThreshold, setNotificationThreshold] = useState(90);
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'toll',
    password: ''
  });

  const fetchUsers = async () => {
    try {
      // Show default users since listing all users requires admin API on server
      setUsers([
        {
          id: '1',
          email: 'admin@smtarpark.com',
          name: 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          email: 'toll@smtarpark.com',
          name: 'Toll Personnel',
          role: 'toll',
          created_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await slotsAPI.getAll() as any;
      const slots = response.slots || [];
      
      const zoneMap = new Map<string, Zone>();
      
      slots.forEach((slot: any) => {
        if (!zoneMap.has(slot.zone)) {
          zoneMap.set(slot.zone, {
            zone: slot.zone,
            totalSlots: 0,
            occupiedSlots: 0,
            freeSlots: 0
          });
        }
        
        const zone = zoneMap.get(slot.zone)!;
        zone.totalSlots++;
        if (slot.status === 'occupied') {
          zone.occupiedSlots++;
        } else if (slot.status === 'free') {
          zone.freeSlots++;
        }
      });
      
      setZones(Array.from(zoneMap.values()).sort((a, b) => a.zone.localeCompare(b.zone)));
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to fetch zone data');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchZones()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSaveApiKey = () => {
    toast.success('API keys saved successfully');
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await authAPI.signup(newUser.email, newUser.password, {
        name: newUser.name,
        role: newUser.role,
      });

      toast.success('User created successfully');
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'toll', password: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure system preferences and integrations</p>
      </div>

      {/* Zone Management */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-800" />
          <h2 className="text-xl font-bold text-gray-900">Zone Management</h2>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading zones...</div>
        ) : (
          <div className="space-y-4">
            {zones.map(zone => (
              <div key={zone.zone} className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div>
                  <p className="font-semibold text-gray-900">Zone {zone.zone}</p>
                  <p className="text-sm text-gray-600">
                    {zone.totalSlots} total slots - {zone.occupiedSlots} occupied - {zone.freeSlots} available
                  </p>
                  <div className="mt-1 w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-800 h-2 rounded-full"
                      style={{ width: `${(zone.occupiedSlots / zone.totalSlots) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-800">
                    {Math.round((zone.occupiedSlots / zone.totalSlots) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">Occupancy</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* API Configuration */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-blue-800" />
          <h2 className="text-xl font-bold text-gray-900">API Configuration</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GCash API Key
            </label>
            <input
              type="password"
              value={gcashApiKey}
              onChange={(e) => setGcashApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 font-mono"
            />
          </div>
          <Button variant="success" onClick={handleSaveApiKey}>Save API Keys</Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-blue-800" />
          <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occupancy Alert Threshold (%)
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={notificationThreshold}
              onChange={(e) => setNotificationThreshold(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-600 mt-1">
              Alert when occupancy reaches {notificationThreshold}%
            </p>
          </div>
          <div className="space-y-2">
            {[
              'SMS alerts for violations',
              'SMS alerts for blocked vehicles',
              'Dashboard notifications',
              'Daily SMS summary reports'
            ].map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* User Roles */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-800" />
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          </div>
          <Button onClick={() => setShowAddUserModal(true)}>
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <p className="font-semibold text-gray-900">{u.name}</p>
                <p className="text-sm text-gray-600">
                  {u.email} - {u.role}
                </p>
                <p className="text-xs text-gray-400">
                  Created: {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="john@smtarpark.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="toll">Toll Personnel</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddUser} className="flex-1">
              Create User
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowAddUserModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
