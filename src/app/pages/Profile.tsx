import { useState } from "react";
import { motion } from "motion/react";
import { User, Car, CreditCard, FileText, Edit2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { CreditScoreGauge } from "../components/Charts";
import { toast } from "sonner";

interface PaymentHistory {
  id: string;
  date: Date;
  amount: number;
  duration: string;
  slot: string;
  status: "paid" | "pending";
}

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    phone: "+63 917 123 4567",
    plate: "ABC123",
    creditScore: -5.2,
  });

  const paymentHistory: PaymentHistory[] = [
    {
      id: "P001",
      date: new Date(Date.now() - 86400000),
      amount: 60,
      duration: "2 hours",
      slot: "A-15",
      status: "paid",
    },
    {
      id: "P002",
      date: new Date(Date.now() - 172800000),
      amount: 40,
      duration: "1.5 hours",
      slot: "B-23",
      status: "paid",
    },
    {
      id: "P003",
      date: new Date(Date.now() - 259200000),
      amount: 80,
      duration: "3.5 hours",
      slot: "D-12",
      status: "paid",
    },
    {
      id: "P004",
      date: new Date(Date.now() - 345600000),
      amount: 100,
      duration: "5 hours",
      slot: "C-08",
      status: "pending",
    },
  ];

  const paymentColumns = [
    { key: "id", label: "Invoice ID", sortable: true },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (row: PaymentHistory) => row.date.toLocaleDateString(),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (row: PaymentHistory) => `₱${row.amount}`,
    },
    { key: "duration", label: "Duration", sortable: false },
    { key: "slot", label: "Slot", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row: PaymentHistory) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.status === "paid"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status === "paid" ? "Paid" : "Pending"}
        </span>
      ),
    },
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleRedeemScore = () => {
    toast.info("Redirecting to payment portal...");
  };

  const totalSpent = paymentHistory
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const unpaidAmount = paymentHistory
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account and view your parking history</p>
      </motion.div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <User className="w-6 h-6 mr-2" />
                Personal Information
              </h2>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile}>
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={profile.plate}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      plate: e.target.value.toUpperCase(),
                    })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 disabled:bg-gray-100 font-mono"
                />
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Credit Score
            </h2>
            <div className="flex justify-center">
              <CreditScoreGauge score={profile.creditScore} />
            </div>
            <Button
              variant="success"
              className="w-full mt-4"
              onClick={handleRedeemScore}
            >
              Pay Fines to Improve Score
            </Button>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-800 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentHistory.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₱{totalSpent}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-600 p-3 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unpaid Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{unpaidAmount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Payment History
        </h2>
        <Table columns={paymentColumns} data={paymentHistory} rowsPerPage={10} />
      </div>
    </div>
  );
}
