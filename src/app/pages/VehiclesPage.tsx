import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { vehiclesAPI } from '../../services/api';
import { Search, Filter, Edit, DollarSign, AlertTriangle, Trash2, Car, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState<'all' | 'good' | 'bad'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehiclesAPI.getAll();
      setVehicles(response.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      setDeleting(true);
      await vehiclesAPI.deleteVehicle(vehicleToDelete.id);
      toast.success(`Vehicle ${vehicleToDelete.plate} deleted successfully`);
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      fetchVehicles();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterScore === 'all' ||
      (filterScore === 'good' && v.creditScore >= 0) ||
      (filterScore === 'bad' && v.creditScore < 0);
    return matchesSearch && matchesFilter;
  });

  const columns = [
    { 
      key: 'plate', 
      label: 'Plate Number', 
      sortable: true,
      render: (v: Vehicle) => (
        <span className="font-mono font-semibold">{v.plate}</span>
      )
    },
    { key: 'owner', label: 'Owner', sortable: true },
    { 
      key: 'creditScore', 
      label: 'Credit Score', 
      sortable: true,
      render: (v: Vehicle) => (
        <div className="flex items-center gap-2">
          <span className={`font-bold ${v.creditScore < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {v.creditScore}
          </span>
          {v.creditScore < 0 && <AlertTriangle className="w-4 h-4 text-red-600" />}
        </div>
      )
    },
    { 
      key: 'entries', 
      label: 'Total Entries', 
      sortable: true,
      render: (v: Vehicle) => <span className="text-blue-600 font-semibold">{v.entries || 0}</span>
    },
    { 
      key: 'violations', 
      label: 'Violations', 
      sortable: true,
      render: (v: Vehicle) => (
        <span className={v.violations > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
          {v.violations || 0}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (v: Vehicle) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          v.status === 'parked' ? 'bg-blue-100 text-blue-800' :
          v.status === 'blocked' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {v.status}
        </span>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (v: Vehicle) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedVehicle(v);
              setShowEditModal(true);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVehicleToDelete(v);
              setShowDeleteModal(true);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600 mt-1">View and manage all registered vehicles</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Good Standing</p>
              <p className="text-2xl font-bold text-green-600">
                {vehicles.filter(v => v.creditScore >= 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked</p>
              <p className="text-2xl font-bold text-red-600">
                {vehicles.filter(v => v.status === 'blocked').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plate or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="all">All Vehicles</option>
              <option value="good">Good Standing</option>
              <option value="bad">Negative Score</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <DataTable
          data={filteredVehicles}
          columns={columns}
          rowsPerPage={10}
          onRowClick={(vehicle) => {
            setSelectedVehicle(vehicle);
            setShowEditModal(true);
          }}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVehicle(null);
        }}
        title={`Vehicle: ${selectedVehicle?.plate}`}
        size="lg"
      >
        {selectedVehicle && (
          <div className="space-y-6">
            {/* Vehicle Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={selectedVehicle.plate}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner
                </label>
                <input
                  type="text"
                  value={selectedVehicle.owner}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Credit Score</p>
                <p className={`text-xl font-bold ${
                  selectedVehicle.creditScore < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {selectedVehicle.creditScore}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-xl font-bold text-gray-900">{selectedVehicle.entries || 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Violations</p>
                <p className="text-xl font-bold text-red-600">{selectedVehicle.violations || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{selectedVehicle.status}</p>
              </div>
            </div>

            {/* Current Parking Info */}
            {selectedVehicle.status === 'parked' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Currently Parked</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>Slot: {selectedVehicle.slotNumber}</p>
                  {selectedVehicle.entryTime && (
                    <p>Entry Time: {new Date(selectedVehicle.entryTime).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}

            {/* Violations Warning */}
            {selectedVehicle.creditScore < 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">Vehicle Blocked</h3>
                    <p className="text-sm text-red-700 mt-1">
                      This vehicle has {selectedVehicle.violations} unpaid violations. 
                      Entry is blocked until fines are paid.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {selectedVehicle.creditScore < 0 && (
                <Button variant="success" className="flex-1">
                  <DollarSign className="w-4 h-4" />
                  Pay Violations
                </Button>
              )}
              <Button variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setVehicleToDelete(null);
        }}
        title={`Delete Vehicle: ${vehicleToDelete?.plate}`}
        size="md"
      >
        {vehicleToDelete && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-600">Are you sure you want to delete this vehicle?</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDeleteVehicle}
                className="flex-1"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setVehicleToDelete(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}