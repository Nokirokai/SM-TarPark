import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { violationsAPI, paymentsAPI } from '../../services/api';
import { Search, Filter, AlertTriangle, Camera, DollarSign, CreditCard, Smartphone, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Violation {
  id: string;
  plate: string;
  type: string;
  fine: number;
  date: string;
  status: 'paid' | 'unpaid' | 'pending';
  photoUrl?: string;
}

export function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newViolation, setNewViolation] = useState({
    plate: '',
    type: 'Overstay',
    fine: 500,
    photoUrl: ''
  });

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const response = await violationsAPI.getAll();
      setViolations(response.violations || []);
    } catch (error: any) {
      console.error('❌ Error fetching violations:', error);
      if (error.message?.includes('log in')) {
        toast.error('Please log in to view violations');
      } else {
        toast.error('Failed to fetch violations: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const handleCreateViolation = async () => {
    if (!newViolation.plate) {
      toast.error('Please enter a plate number');
      return;
    }

    try {
      await violationsAPI.create({
        plate: newViolation.plate,
        type: newViolation.type,
        fine: newViolation.fine,
        photoUrl: newViolation.photoUrl || undefined
      });
      toast.success('Violation created successfully');
      setShowCreateModal(false);
      setNewViolation({
        plate: '',
        type: 'Overstay',
        fine: 500,
        photoUrl: ''
      });
      fetchViolations();
    } catch (error: any) {
      console.error('Error creating violation:', error);
      toast.error('Failed to create violation: ' + error.message);
    }
  };

  const handleProcessPayment = async (method: 'GCash' | 'Cash' | 'Card') => {
    if (!selectedViolation) return;

    try {
      setLoading(true);
      
      // Create payment record
      await paymentsAPI.create({
        plate: selectedViolation.plate,
        amount: selectedViolation.fine,
        method: method,
        type: 'violation',
        referenceId: selectedViolation.id
      });

      // Update violation status to paid
      await violationsAPI.updateStatus(selectedViolation.id, 'paid');

      toast.success(`Payment of ₱${selectedViolation.fine.toLocaleString()} processed successfully via ${method}!`);
      setShowPaymentModal(false);
      setSelectedViolation(null);
      fetchViolations();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'plate', 
      label: 'Plate Number', 
      sortable: true,
      render: (v: Violation) => (
        <span className="font-mono font-semibold">{v.plate}</span>
      )
    },
    { key: 'type', label: 'Violation Type', sortable: true },
    { 
      key: 'fine', 
      label: 'Fine Amount', 
      sortable: true,
      render: (v: Violation) => (
        <span className="font-bold text-red-600">₱{v.fine.toLocaleString()}</span>
      )
    },
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true,
      render: (v: Violation) => new Date(v.date).toLocaleDateString()
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (v: Violation) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          v.status === 'paid' ? 'bg-green-100 text-green-800' :
          v.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {v.status === 'paid' ? 'Paid' : v.status.toUpperCase()}
        </span>
      )
    }
  ];

  const totalUnpaid = violations
    .filter(v => v.status === 'unpaid')
    .reduce((sum, v) => sum + v.fine, 0);

  const totalPending = violations
    .filter(v => v.status === 'pending')
    .reduce((sum, v) => sum + v.fine, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Violations Management</h1>
        <p className="text-gray-600 mt-1">Track and manage parking violations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Violations</p>
              <p className="text-2xl font-bold text-gray-900">{violations.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unpaid Fines</p>
              <p className="text-2xl font-bold text-red-600">₱{totalUnpaid.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">₱{totalPending.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Violation Types Info */}
      <Card>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Violation Fee Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">Overstay (4+ hours)</p>
            <p className="text-lg font-bold text-red-600">₱500</p>
            <p className="text-xs text-gray-500 mt-1">₱25 per hour after 4h</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">Improper Parking</p>
            <p className="text-lg font-bold text-red-600">₱300</p>
            <p className="text-xs text-gray-500 mt-1">Blocking or wrong slot</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">No Payment on Exit</p>
            <p className="text-lg font-bold text-red-600">₱200</p>
            <p className="text-xs text-gray-500 mt-1">+ original parking fee</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">Repeat Offender</p>
            <p className="text-lg font-bold text-red-600">₱1,000</p>
            <p className="text-xs text-gray-500 mt-1">3+ violations in 30 days</p>
          </div>
        </div>
      </Card>

      {/* Violations Table */}
      <Card>
        <DataTable
          data={violations}
          columns={columns}
          rowsPerPage={10}
          onRowClick={(violation) => {
            setSelectedViolation(violation);
            setShowDetailModal(true);
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedViolation(null);
        }}
        title="Violation Details"
        size="lg"
      >
        {selectedViolation && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Violation ID</p>
                <p className="text-lg font-mono font-semibold">#{selectedViolation.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                selectedViolation.status === 'paid' ? 'bg-green-100 text-green-800' :
                selectedViolation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedViolation.status === 'paid' ? 'Paid' : selectedViolation.status.toUpperCase()}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={selectedViolation.plate}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={new Date(selectedViolation.date).toLocaleString()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Violation Type
              </label>
              <input
                type="text"
                value={selectedViolation.type}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            {/* Photo Evidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo Evidence
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Photo evidence placeholder</p>
                <p className="text-xs text-gray-400 mt-1">Captured by system camera</p>
              </div>
            </div>

            {/* Fine Amount */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Total Fine Amount:</span>
                <span className="text-2xl font-bold text-red-600">
                  ₱{selectedViolation.fine.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedViolation.status !== 'paid' && (
                <Button 
                  variant="success" 
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowPaymentModal(true);
                  }}
                >
                  <DollarSign className="w-4 h-4" />
                  Process Payment
                </Button>
              )}
              {selectedViolation.status === 'pending' && (
                <Button variant="danger" className="flex-1">
                  <CheckCircle className="w-4 h-4" />
                  Approve Violation
                </Button>
              )}
              <Button 
                variant="secondary" 
                onClick={() => setShowDetailModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Process Violation Payment"
        size="md"
      >
        {selectedViolation && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-700 text-base">Vehicle: <span className="font-semibold">{selectedViolation.plate}</span></p>
              <p className="text-5xl font-bold text-red-600">
                ₱{selectedViolation.fine.toLocaleString()}
              </p>
              <p className="text-gray-500 text-base">{selectedViolation.type}</p>
            </div>

            <div className="space-y-3">
              <Button 
                variant="success" 
                className="w-full py-4 text-base" 
                onClick={() => handleProcessPayment('GCash')}
                loading={loading}
              >
                <Smartphone className="w-5 h-5" />
                Pay with GCash
              </Button>
              <button 
                className="w-full py-4 px-4 border-2 border-blue-800 text-blue-800 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleProcessPayment('Cash')}
                disabled={loading}
              >
                <DollarSign className="w-5 h-5" />
                Cash Payment
              </button>
              <button 
                className="w-full py-4 px-4 border-2 border-blue-800 text-blue-800 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleProcessPayment('Card')}
                disabled={loading}
              >
                <CreditCard className="w-5 h-5" />
                Card Payment
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 pt-2">
              <p>Payment will update credit score by +10 points</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Violation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Violation"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plate Number
            </label>
            <input
              type="text"
              value={newViolation.plate}
              onChange={(e) => setNewViolation({ ...newViolation, plate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Violation Type
            </label>
            <select
              value={newViolation.type}
              onChange={(e) => setNewViolation({ ...newViolation, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Overstay">Overstay (4+ hours)</option>
              <option value="Improper Parking">Improper Parking</option>
              <option value="No Payment on Exit">No Payment on Exit</option>
              <option value="Repeat Offender">Repeat Offender</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fine Amount
            </label>
            <input
              type="number"
              value={newViolation.fine}
              onChange={(e) => setNewViolation({ ...newViolation, fine: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo Evidence URL
            </label>
            <input
              type="text"
              value={newViolation.photoUrl}
              onChange={(e) => setNewViolation({ ...newViolation, photoUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="success"
              onClick={handleCreateViolation}
            >
              <Plus className="w-4 h-4" />
              Create Violation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Violation Button */}
      <div className="text-right">
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          Add Violation
        </Button>
      </div>
    </div>
  );
}