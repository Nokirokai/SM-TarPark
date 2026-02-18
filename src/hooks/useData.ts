import { useState, useEffect } from 'react';
import { slotsAPI, vehiclesAPI, violationsAPI, paymentsAPI, analyticsAPI } from '../services/api';

// Hook for fetching parking slots
export function useParkingSlots() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      // Add timestamp to bypass any caching
      const data = await slotsAPI.getAll();
      setSlots(data.slots || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching slots:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  return { slots, loading, error, refetch: fetchSlots };
}

// Hook for fetching vehicles (requires auth)
export function useVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesAPI.getAll();
      setVehicles(data.vehicles || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return { vehicles, loading, error, refetch: fetchVehicles };
}

// Hook for fetching violations (requires auth)
export function useViolations() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const data = await violationsAPI.getAll();
      setViolations(data.violations || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching violations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  return { violations, loading, error, refetch: fetchViolations };
}

// Hook for fetching payments (requires auth)
export function usePayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentsAPI.getAll();
      setPayments(data.payments || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, loading, error, refetch: fetchPayments };
}

// Hook for fetching dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.getDashboardStats();
      setStats(data.stats || {});
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

// Hook for fetching occupancy trend
export function useOccupancyTrend(period: 'day' | 'week' | 'month' = 'day') {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await analyticsAPI.getOccupancyTrend(period);
      setData(result.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching occupancy trend:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  return { data, loading, error, refetch: fetchData };
}