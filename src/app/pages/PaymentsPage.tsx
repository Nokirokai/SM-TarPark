import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { paymentsAPI } from '../../services/api';
import { DollarSign, TrendingUp, CheckCircle, Clock, Smartphone, Banknote, CreditCard, Plus, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  plate: string;
  amount: number;
  method: 'GCash' | 'Cash' | 'Card';
  type: 'parking' | 'violation';
  date: string;
  status: 'completed' | 'pending' | 'failed';
  referenceId?: string;
}

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    plate: '',
    amount: 0,
    method: 'Cash' as 'GCash' | 'Cash' | 'Card',
    type: 'parking' as 'parking' | 'violation',
    referenceId: ''
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getAll();
      setPayments(response.payments || []);
    } catch (error: any) {
      console.error('❌ Error fetching payments:', error);
      if (error.message?.includes('log in')) {
        toast.error('Please log in to view payments');
      } else {
        toast.error('Failed to fetch payments: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreatePayment = async () => {
    if (!newPayment.plate || !newPayment.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await paymentsAPI.create({
        plate: newPayment.plate,
        amount: newPayment.amount,
        method: newPayment.method,
        type: newPayment.type,
        referenceId: newPayment.referenceId || undefined
      });
      toast.success('Payment recorded successfully');
      setShowCreateModal(false);
      setNewPayment({
        plate: '',
        amount: 0,
        method: 'Cash',
        type: 'parking',
        referenceId: ''
      });
      fetchPayments();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error('Failed to record payment: ' + error.message);
    }
  };

  const columns = [
    { 
      key: 'plate', 
      label: 'Plate Number', 
      sortable: true,
      render: (p: Payment) => <span className="font-mono font-semibold">{p.plate}</span>
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (p: Payment) => <span className="font-bold text-green-600">₱{p.amount}</span>
    },
    { key: 'method', label: 'Method', sortable: true },
    { 
      key: 'type', 
      label: 'Type', 
      sortable: true,
      render: (p: Payment) => (
        <span className="capitalize">{p.type}</span>
      )
    },
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true,
      render: (p: Payment) => new Date(p.date).toLocaleString()
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (p: Payment) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          p.status === 'completed' ? 'bg-green-100 text-green-800' :
          p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {p.status}
        </span>
      )
    }
  ];

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">View payment history and process transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₱{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">₱{pendingAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Methods Available</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold">GCash</h3>
            </div>
            <p className="text-sm text-gray-600">QR Code scanning for instant payment</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Banknote className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold">Cash</h3>
            </div>
            <p className="text-sm text-gray-600">Pay at toll booth on exit</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold">Card</h3>
            </div>
            <p className="text-sm text-gray-600">Debit/Credit card terminals</p>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card>
        <DataTable
          data={payments}
          columns={columns}
          rowsPerPage={10}
          onRowClick={(payment) => {
            setSelectedPayment(payment);
            setShowInvoice(true);
          }}
        />
      </Card>

      {/* Invoice Modal */}
      <Modal
        isOpen={showInvoice}
        onClose={() => {
          setShowInvoice(false);
          setSelectedPayment(null);
        }}
        title="Payment Receipt"
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">SM TarPark</h2>
              <p className="text-sm text-gray-600">SM City Tarlac</p>
              <p className="text-sm text-gray-600">Smart Parking System</p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt #:</span>
                <span className="font-mono font-semibold">{selectedPayment.id.padStart(6, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{new Date(selectedPayment.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plate Number:</span>
                <span className="font-mono font-semibold">{selectedPayment.plate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold capitalize">{selectedPayment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">{selectedPayment.method}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-gray-50 rounded-lg p-4 border-t border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₱{selectedPayment.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              {selectedPayment.status === 'completed' ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Payment Completed</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-yellow-600">
                  <Clock className="w-6 h-6" />
                  <span className="font-semibold">Payment Pending</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p>Thank you for using SM TarPark!</p>
              <p className="mt-1">For inquiries: parking@smtarlac.com</p>
            </div>

            <Button onClick={() => setShowInvoice(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Create Payment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewPayment({
            plate: '',
            amount: 0,
            method: 'Cash',
            type: 'parking',
            referenceId: ''
          });
        }}
        title="Record New Payment"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <label className="text-sm text-gray-600">Plate Number:</label>
          </div>
          <input
            type="text"
            value={newPayment.plate}
            onChange={(e) => setNewPayment({ ...newPayment, plate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-gray-500" />
            <label className="text-sm text-gray-600">Amount:</label>
          </div>
          <input
            type="number"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <label className="text-sm text-gray-600">Payment Method:</label>
          </div>
          <select
            value={newPayment.method}
            onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as 'GCash' | 'Cash' | 'Card' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="GCash">GCash</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <label className="text-sm text-gray-600">Type:</label>
          </div>
          <select
            value={newPayment.type}
            onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value as 'parking' | 'violation' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="parking">Parking</option>
            <option value="violation">Violation</option>
          </select>

          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-500" />
            <label className="text-sm text-gray-600">Reference ID (optional):</label>
          </div>
          <input
            type="text"
            value={newPayment.referenceId}
            onChange={(e) => setNewPayment({ ...newPayment, referenceId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <Button onClick={handleCreatePayment} className="w-full">
            Record Payment
          </Button>
        </div>
      </Modal>

      {/* Add Payment Button */}
      <Button onClick={() => setShowCreateModal(true)} className="w-full">
        Add Payment
      </Button>
    </div>
  );
}