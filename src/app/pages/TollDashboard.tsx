import { useState, useEffect } from 'react';
import { Card, StatCard } from '../components/Card';
import { Button } from '../components/Button';
import { ParkingMap } from '../components/ParkingMap';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { useParkingSlots } from '../../hooks/useData';
import { vehiclesAPI, slotsAPI } from '../../services/api';
import { Car, TrendingUp, DollarSign, AlertTriangle, Scan, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

interface Vehicle {
  id: string;
  plate: string;
  owner: string;
  creditScore: number;
  entries: number;
  violations: number;
  status: string;
  slotNumber?: string;
  entryTime?: string;
  duration?: string;
  fee?: number;
}

export function TollDashboard() {
  const auth = useAuth();
  const { user = null } = auth || {};
  const navigate = useNavigate();
  const { slots, refetch: refetchSlots } = useParkingSlots();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entryPlate, setEntryPlate] = useState('');
  const [entryOwner, setEntryOwner] = useState('');
  const [exitPlate, setExitPlate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [entryResult, setEntryResult] = useState<any>(null);
  const [exitResult, setExitResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated, redirecting to login...');
      toast.error('Please log in to access this page');
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getAll();
      setVehicles(response.vehicles || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      refetchSlots();
      fetchVehicles();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchSlots]);

  const occupiedCount = slots.filter((s: any) => s.status === 'occupied').length;
  const freeCount = slots.filter((s: any) => s.status === 'free').length;
  const totalRevenue = vehicles.reduce((sum, v) => sum + (v.fee || 0), 0);
  const vehiclesToday = vehicles.length;

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryPlate.trim()) {
      setError('Please enter a plate number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if vehicle exists and get credit score
      let vehicle: Vehicle | null = null;
      const plateResponse = await vehiclesAPI.getByPlate(entryPlate) as any;
      vehicle = plateResponse.vehicle || null;

      // Check credit score
      if (vehicle && vehicle.creditScore < 0) {
        setEntryResult({
          success: false,
          plate: entryPlate,
          creditScore: vehicle.creditScore,
          message: 'Vehicle blocked due to unpaid violations'
        });
        setShowEntryModal(true);
        setLoading(false);
        return;
      }

      // Find free slot
      const freeSlots = slots.filter((s: any) => s.status === 'free');
      if (freeSlots.length === 0) {
        setError('No free slots available');
        setLoading(false);
        return;
      }

      const assignedSlot = freeSlots[Math.floor(Math.random() * freeSlots.length)];

      // Record entry
      const entryResponse = await vehiclesAPI.recordEntry(
        entryPlate,
        entryOwner || 'Unknown',
        assignedSlot.id
      );

      // Update slot status
      await slotsAPI.updateStatus(assignedSlot.id, 'occupied', entryPlate);

      setEntryResult({
        success: true,
        plate: entryPlate,
        creditScore: entryResponse.vehicle.creditScore,
        slot: assignedSlot.id,
        zone: assignedSlot.zone
      });
      setShowEntryModal(true);
      setEntryPlate('');
      setEntryOwner('');
      
      // Refresh data
      refetchSlots();
      fetchVehicles();
    } catch (err: any) {
      console.error('Error recording entry:', err);
      setError(err.message || 'Failed to record entry');
    } finally {
      setLoading(false);
    }
  };

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitPlate.trim()) {
      setError('Please enter a plate number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find vehicle
      const response = await vehiclesAPI.getByPlate(exitPlate);
      const vehicle = response.vehicle;

      if (!vehicle || vehicle.status !== 'parked') {
        setError('Vehicle not found or not currently parked');
        setLoading(false);
        return;
      }

      // Calculate duration and fee
      const entryTime = new Date(vehicle.entryTime);
      const now = new Date();
      const durationMs = now.getTime() - entryTime.getTime();
      const hours = Math.ceil(durationMs / (1000 * 60 * 60));
      const fee = hours * 25; // ₱25 per hour (matches server rate)

      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      setExitResult({
        vehicleId: vehicle.id,
        plate: exitPlate,
        duration: `${durationHours}h ${durationMinutes}m`,
        fee,
        slot: vehicle.slotNumber
      });
      setShowExitModal(true);
    } catch (err: any) {
      console.error('Error finding vehicle:', err);
      setError(err.message || 'Vehicle not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot: any) => {
    setSelectedSlot(slot);
  };

  const handleSlotUpdate = async (newStatus: string) => {
    if (selectedSlot) {
      try {
        await slotsAPI.updateStatus(selectedSlot.id, newStatus, newStatus === 'occupied' ? selectedSlot.plate : null);
        refetchSlots();
        setSelectedSlot(null);
      } catch (err) {
        console.error('Error updating slot:', err);
      }
    }
  };

  const handleConfirmExit = async (paymentMethod: 'gcash' | 'cash') => {
    if (!exitResult) return;

    setLoading(true);
    try {
      // Record exit
      await vehiclesAPI.recordExit(exitResult.vehicleId);

      // Free up the slot
      await slotsAPI.updateStatus(exitResult.slot, 'free', null);

      // Refresh data
      refetchSlots();
      fetchVehicles();

      setShowExitModal(false);
      setShowGCashModal(false);
      setExitPlate('');
      setExitResult(null);
    } catch (err: any) {
      console.error('Error processing exit:', err);
      setError(err.message || 'Failed to process exit');
    } finally {
      setLoading(false);
    }
  };

  const parkedVehicles = vehicles.filter(v => v.status === 'parked');

  const tableColumns = [
    { key: 'plate', label: 'Plate Number', sortable: true },
    { key: 'slotNumber', label: 'Slot', sortable: true },
    { 
      key: 'duration', 
      label: 'Duration', 
      sortable: false,
      render: (v: Vehicle) => {
        if (!v.entryTime) return 'N/A';
        const entryTime = new Date(v.entryTime);
        const now = new Date();
        const durationMs = now.getTime() - entryTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      }
    },
    { 
      key: 'fee', 
      label: 'Fee (₱)', 
      sortable: true,
      render: (v: Vehicle) => {
        if (!v.entryTime) return '₱0';
        const entryTime = new Date(v.entryTime);
        const now = new Date();
        const durationMs = now.getTime() - entryTime.getTime();
        const hours = Math.ceil(durationMs / (1000 * 60 * 60));
        return `₱${hours * 25}`;
      }
    },
    { 
      key: 'creditScore', 
      label: 'Credit Score', 
      sortable: true,
      render: (v: Vehicle) => (
        <span className={v.creditScore < 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
          {v.creditScore}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Toll Personnel Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage vehicle entries, exits, and parking slots</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError('')} className="text-sm text-red-600 underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Occupied Slots"
          value={`${occupiedCount}/${slots.length}`}
          icon={<MapPin className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Free Slots"
          value={freeCount}
          icon={<Car className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Vehicles Today"
          value={vehiclesToday}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Revenue Today"
          value={`₱${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="yellow"
        />
      </div>

      {/* Entry & Exit Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Scan className="w-6 h-6 text-blue-800" />
            <h2 className="text-xl font-bold text-gray-900">Vehicle Entry</h2>
          </div>
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plate Number *
              </label>
              <input
                type="text"
                value={entryPlate}
                onChange={(e) => setEntryPlate(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 text-lg font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name (Optional)
              </label>
              <input
                type="text"
                value={entryOwner}
                onChange={(e) => setEntryOwner(e.target.value)}
                placeholder="Juan Dela Cruz"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Scan className="w-5 h-5" />
              {loading ? 'Processing...' : 'Check & Assign Slot'}
            </Button>
          </form>
        </Card>

        {/* Exit */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Scan className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Vehicle Exit</h2>
          </div>
          <form onSubmit={handleExitSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plate Number
              </label>
              <input
                type="text"
                value={exitPlate}
                onChange={(e) => setExitPlate(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-lg font-mono"
                required
              />
            </div>
            <Button type="submit" variant="success" className="w-full" disabled={loading}>
              <Scan className="w-5 h-5" />
              {loading ? 'Processing...' : 'Calculate Fee'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Live Parking Map */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Live Parking Map</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Real-time Sync</span>
          </div>
        </div>
        <ParkingMap 
          slots={slots} 
          onSlotClick={handleSlotClick}
          highlightedSlots={selectedSlot ? [selectedSlot.id] : []}
        />
      </Card>

      {/* Active Vehicles Table */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Vehicles ({parkedVehicles.length})</h2>
        <DataTable
          data={parkedVehicles}
          columns={tableColumns}
          rowsPerPage={10}
        />
      </Card>

      {/* Entry Modal */}
      <Modal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        title="Entry Result"
        size="md"
      >
        {entryResult && (
          <div className="space-y-4">
            {entryResult.success ? (
              <>
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Car className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Entry Approved</h3>
                  <p className="text-gray-600 mt-1">Vehicle: {entryResult.plate}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Assigned Slot:</span>
                    <span className="font-bold text-blue-800 text-lg">{entryResult.slot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Zone:</span>
                    <span className="font-semibold">Zone {entryResult.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Credit Score:</span>
                    <span className="font-semibold text-green-600">{entryResult.creditScore}</span>
                  </div>
                </div>
                <Button onClick={() => setShowEntryModal(false)} className="w-full">
                  Confirm Entry
                </Button>
              </>
            ) : (
              <>
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-red-900">Entry Blocked</h3>
                  <p className="text-gray-600 mt-1">Vehicle: {entryResult.plate}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-red-800 font-medium">{entryResult.message}</p>
                  <p className="text-red-600 text-sm mt-2">
                    Credit Score: {entryResult.creditScore}
                  </p>
                </div>
                <Button variant="danger" onClick={() => setShowEntryModal(false)} className="w-full">
                  Close
                </Button>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Exit Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit & Payment"
        size="md"
      >
        {exitResult && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h3 className="text-xl font-bold text-gray-900">Vehicle: {exitResult.plate}</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Slot:</span>
                <span className="font-semibold">{exitResult.slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Duration:</span>
                <span className="font-semibold">{exitResult.duration}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-700">Total Fee:</span>
                <span className="font-bold text-blue-800">₱{exitResult.fee}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="success" 
                onClick={() => {
                  setShowExitModal(false);
                  setShowGCashModal(true);
                }} 
                className="flex-1"
                disabled={loading}
              >
                Pay with GCash
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleConfirmExit('cash')} 
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Cash Payment'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* GCash QR Modal */}
      <Modal
        isOpen={showGCashModal}
        onClose={() => setShowGCashModal(false)}
        title="GCash Payment"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-gray-400 text-sm">QR Code<br/>Placeholder</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">Scan to pay ₱{exitResult?.fee || 0}</p>
          <Button 
            variant="success" 
            onClick={() => handleConfirmExit('gcash')} 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Payment Confirmed'}
          </Button>
        </div>
      </Modal>

      {/* Slot Update Modal */}
      {selectedSlot && (
        <Modal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          title={`Update Slot ${selectedSlot.id}`}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Current Status:</p>
              <p className="text-lg font-semibold capitalize">{selectedSlot.status}</p>
            </div>
            {selectedSlot.plate && (
              <div>
                <p className="text-sm text-gray-600">Plate Number:</p>
                <p className="text-lg font-semibold">{selectedSlot.plate}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="success"
                onClick={() => handleSlotUpdate('free')}
                className="w-full"
              >
                Set Free
              </Button>
              <Button
                variant="danger"
                onClick={() => handleSlotUpdate('occupied')}
                className="w-full"
              >
                Set Occupied
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}