import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getSessionToken, clearSession, AppUser } from '../utils/supabaseClient';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-66851205`;

// Generic API call helper using server session tokens (no JWT)
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  useAuth = false
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // Always send the anon key in Authorization for the Supabase Edge Functions gateway
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  if (useAuth) {
    const sessionToken = getSessionToken();

    if (sessionToken) {
      // Send session token in a custom header (not Authorization, which is for the gateway)
      (headers as Record<string, string>)['X-Session-Token'] = sessionToken;
    } else {
      console.error('Auth required but no session token for:', endpoint);
      throw new Error('Please log in to access this feature');
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 - session expired or invalid
    if (response.status === 401 && useAuth) {
      console.error('Session invalid or expired for:', endpoint);
      clearSession();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`
      }));

      const errorMessage = error.message || `API Error: ${response.status}`;
      console.error(`API Error [${response.status}]:`, errorMessage, endpoint);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error:', error.message);
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

// ============= AUTH API =============
export const authAPI = {
  async login(email: string, password: string): Promise<{ token: string; user: AppUser }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Invalid email or password');
    }

    return response.json();
  },

  async exchangeOAuthToken(supabaseAccessToken: string): Promise<{ token: string; user: AppUser }> {
    const response = await fetch(`${API_BASE_URL}/auth/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ supabaseAccessToken }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'OAuth exchange failed' }));
      throw new Error(error.message || 'Failed to complete OAuth login');
    }

    return response.json();
  },

  async me(): Promise<{ user: AppUser }> {
    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error('Not logged in');

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Session-Token': sessionToken,
      },
    });

    if (!response.ok) {
      throw new Error('Session invalid');
    }

    return response.json();
  },

  async logout(): Promise<void> {
    const sessionToken = getSessionToken();
    if (sessionToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-Token': sessionToken,
        },
      }).catch(() => {});
    }
  },

  async signup(email: string, password: string, userData: { name: string; role: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, userData }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Signup failed' }));
      throw new Error(error.message || 'Failed to create account');
    }

    return response.json();
  },

  async updateProfile(data: { name?: string; phone?: string; gcashNumber?: string }) {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  },

  async resetAccounts(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Reset failed' }));
      throw new Error(error.message || 'Failed to reset accounts');
    }

    return response.json();
  },
};

// ============= PARKING SLOTS API =============
export const slotsAPI = {
  async getAll() {
    return apiCall(`/slots?_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store' as RequestCache
    });
  },

  async getByZone(zone: string) {
    return apiCall(`/slots/zone/${zone}?_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store' as RequestCache
    });
  },

  async updateStatus(slotId: string, status: string, plate?: string) {
    return apiCall(`/slots/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, plate })
    }, true);
  }
};

// ============= VEHICLES API =============
export const vehiclesAPI = {
  async getAll() {
    return apiCall('/vehicles', { method: 'GET' });
  },

  async getById(id: string) {
    return apiCall(`/vehicles/${id}`, { method: 'GET' });
  },

  async getByPlate(plate: string) {
    try {
      return await apiCall(`/vehicles/plate/${plate}`, { method: 'GET' });
    } catch (err: any) {
      // 404 is expected for new vehicles - return null vehicle instead of throwing
      if (err.message?.includes('Vehicle not found') || err.message?.includes('404')) {
        return { vehicle: null };
      }
      throw err;
    }
  },

  async recordEntry(plate: string, owner: string, slotId: string) {
    return apiCall('/vehicles/entry', {
      method: 'POST',
      body: JSON.stringify({ plate, owner, slotId })
    }, true);
  },

  async recordExit(vehicleId: string) {
    return apiCall(`/vehicles/${vehicleId}/exit`, {
      method: 'POST'
    }, true);
  },

  async updateCreditScore(vehicleId: string, score: number) {
    return apiCall(`/vehicles/${vehicleId}/credit`, {
      method: 'PUT',
      body: JSON.stringify({ score })
    }, true);
  },

  async deleteVehicle(vehicleId: string) {
    return apiCall(`/vehicles/${vehicleId}`, {
      method: 'DELETE'
    }, true);
  }
};

// ============= VIOLATIONS API =============
export const violationsAPI = {
  async getAll() {
    return apiCall('/violations', { method: 'GET' }, true);
  },

  async create(violation: {
    plate: string;
    type: string;
    fine: number;
    photoUrl?: string;
  }) {
    return apiCall('/violations', {
      method: 'POST',
      body: JSON.stringify(violation)
    }, true);
  },

  async updateStatus(violationId: string, status: string) {
    return apiCall(`/violations/${violationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }, true);
  }
};

// ============= PAYMENTS API =============
export const paymentsAPI = {
  async getAll() {
    return apiCall('/payments', { method: 'GET' }, true);
  },

  async create(payment: {
    plate: string;
    amount: number;
    method: 'GCash' | 'Cash' | 'Card';
    type: 'parking' | 'violation';
    referenceId?: string;
  }) {
    return apiCall('/payments', {
      method: 'POST',
      body: JSON.stringify(payment)
    }, true);
  },

  async processGCash(plate: string, amount: number, type: string) {
    return apiCall('/payments/gcash', {
      method: 'POST',
      body: JSON.stringify({ plate, amount, type })
    }, true);
  }
};

// ============= ANALYTICS API =============
export const analyticsAPI = {
  async getDashboardStats() {
    return apiCall(`/analytics/dashboard?_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store' as RequestCache
    });
  },

  async getOccupancyTrend(period: 'day' | 'week' | 'month') {
    return apiCall(`/analytics/occupancy?period=${period}&_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store' as RequestCache
    });
  },

  async getRevenue(startDate: string, endDate: string) {
    return apiCall(`/analytics/revenue?start=${startDate}&end=${endDate}`, { method: 'GET' }, true);
  },

  async getPeakPrediction() {
    return apiCall('/analytics/peak-prediction', { method: 'GET' });
  }
};

// Health check
export const healthCheck = async () => {
  return apiCall('/health', { method: 'GET' });
};