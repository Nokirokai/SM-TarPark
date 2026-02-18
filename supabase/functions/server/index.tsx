import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Session-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to create Supabase admin client (service role)
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
};

// Helper to create Supabase anon client (for password verification)
const getAnonClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_ANON_KEY") || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
};

// ============= SESSION-BASED AUTH (replaces JWT) =============

// Generate a secure random session token
const generateSessionToken = (): string => {
  return crypto.randomUUID() + '-' + crypto.randomUUID();
};

// Session duration: 24 hours
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// Create a session in KV store
const createSession = async (userData: {
  userId: string;
  email: string;
  name: string;
  role: string;
}) => {
  const token = generateSessionToken();
  const session = {
    ...userData,
    token, // Store token in session data for cleanup support
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  await kv.set(`session:${token}`, session);
  return { token, session };
};

// Verify session token from request - replaces JWT verification
const verifyAuth = async (request: Request) => {
  // Session token is sent in X-Session-Token header (Authorization is reserved for Supabase gateway)
  const sessionToken = request.headers.get('X-Session-Token');

  if (!sessionToken || sessionToken === 'undefined' || sessionToken === 'null') {
    console.log('verifyAuth: No session token found in X-Session-Token header');
    return null;
  }

  try {
    const session = await kv.get(`session:${sessionToken}`);

    if (!session) {
      console.log('verifyAuth: Session not found in KV store for token:', sessionToken.substring(0, 8) + '...');
      return null;
    }

    // Check expiration
    if (session.expiresAt < Date.now()) {
      console.log('verifyAuth: Session expired, cleaning up');
      await kv.del(`session:${sessionToken}`);
      return null;
    }

    console.log('verifyAuth: Session valid for', session.email, '(role:', session.role + ')');
    return session; // { userId, email, name, role, createdAt, expiresAt }
  } catch (error) {
    console.error('verifyAuth: Error checking session:', error.message);
    return null;
  }
};

// Initialize data on first run
const initializeData = async () => {
  console.log('Starting data initialization...');

  if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    console.error('Missing Supabase environment variables');
    return;
  }

  // Retry helper function
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3, delayMs = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  };

  try {
    const slots = await retryOperation(() => kv.get('parking_slots'));
    if (!slots) {
      const initialSlots = [];
      const zones = ['A', 'B', 'C', 'D', 'E', 'F'];

      zones.forEach(zone => {
        for (let i = 1; i <= 100; i++) {
          initialSlots.push({
            id: `${zone}${String(i).padStart(3, '0')}`,
            zone,
            status: 'free',
            plate: null,
            entryTime: null
          });
        }
      });

      await retryOperation(() => kv.set('parking_slots', initialSlots));
      console.log('Initialized parking slots: 600 total (100 per zone x 6 zones)');
    } else {
      console.log('Parking slots already initialized, count:', slots.length);
    }
  } catch (error) {
    console.error('Error initializing parking slots:', error);
    // Don't fail server startup, just log the error
  }

  try {
    const vehicles = await retryOperation(() => kv.get('vehicles'));
    if (!vehicles) {
      await retryOperation(() => kv.set('vehicles', []));
      console.log('Initialized vehicles collection');
    } else {
      console.log('Vehicles already initialized, count:', vehicles.length);
    }
  } catch (error) {
    console.error('Error initializing vehicles:', error);
  }

  try {
    const violations = await retryOperation(() => kv.get('violations'));
    if (!violations) {
      await retryOperation(() => kv.set('violations', []));
      console.log('Initialized violations collection');
    } else {
      console.log('Violations already initialized, count:', violations.length);
    }
  } catch (error) {
    console.error('Error initializing violations:', error);
  }

  try {
    const payments = await retryOperation(() => kv.get('payments'));
    if (!payments) {
      await retryOperation(() => kv.set('payments', []));
      console.log('Initialized payments collection');
    } else {
      console.log('Payments already initialized, count:', payments.length);
    }
  } catch (error) {
    console.error('Error initializing payments:', error);
  }

  try {
    await createDefaultAccounts();
  } catch (error) {
    console.error('Error creating default accounts:', error);
  }

  console.log('Data initialization complete');
};

// Create default admin and toll personnel accounts
const createDefaultAccounts = async () => {
  try {
    const supabase = getSupabaseClient();

    // Always try to ensure accounts exist - don't rely on a flag
    // that might have been set even if creation failed

    // Helper to upsert a user account
    const ensureAccount = async (email: string, password: string, name: string, role: string) => {
      try {
        // First, try to find if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find((u: any) => u.email === email);

        if (existing) {
          // User exists - update password and metadata to ensure they're correct
          const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
            password,
            user_metadata: { name, role },
            email_confirm: true,
          });
          if (updateError) {
            console.error(`Error updating ${email}:`, updateError.message);
          } else {
            console.log(`Account ensured (updated): ${email} / ${password} (role: ${role})`);
          }
          return;
        }

        // User doesn't exist - create it
        const { error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: { name, role },
          email_confirm: true,
        });

        if (createError) {
          if (createError.message.includes('already registered')) {
            console.log(`Account already exists: ${email}`);
          } else {
            console.error(`Error creating ${email}:`, createError.message);
          }
        } else {
          console.log(`Account created: ${email} / ${password} (role: ${role})`);
        }
      } catch (e: any) {
        console.error(`Error ensuring account ${email}:`, e.message);
      }
    };

    await ensureAccount('admin@smtarpark.com', 'Admin123!', 'Admin User', 'admin');
    await ensureAccount('toll@smtarpark.com', 'Toll123!', 'Toll Personnel', 'toll');

    // Set flag for informational purposes only (not used to skip creation)
    await kv.set('default_accounts_created', true);
    console.log('Default accounts initialization complete');
  } catch (error) {
    console.error('Error creating default accounts:', error);
  }
};

// Initialize on server start
initializeData();

// Health check endpoint
app.get("/make-server-66851205/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Force reset default accounts (public endpoint for recovery)
app.post("/make-server-66851205/auth/reset-accounts", async (c) => {
  try {
    console.log('Force resetting default accounts...');
    const supabase = getSupabaseClient();

    const accounts = [
      { email: 'admin@smtarpark.com', password: 'Admin123!', name: 'Admin User', role: 'admin' },
      { email: 'toll@smtarpark.com', password: 'Toll123!', name: 'Toll Personnel', role: 'toll' },
    ];

    const results = [];

    for (const acct of accounts) {
      try {
        // Find existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find((u: any) => u.email === acct.email);

        if (existing) {
          // Delete and recreate to ensure clean state
          await supabase.auth.admin.deleteUser(existing.id);
          console.log(`Deleted existing account: ${acct.email}`);
        }

        // Create fresh account
        const { data, error } = await supabase.auth.admin.createUser({
          email: acct.email,
          password: acct.password,
          user_metadata: { name: acct.name, role: acct.role },
          email_confirm: true,
        });

        if (error) {
          console.error(`Failed to create ${acct.email}:`, error.message);
          results.push({ email: acct.email, status: 'error', message: error.message });
        } else {
          console.log(`Created fresh account: ${acct.email}`);
          results.push({ email: acct.email, status: 'created', password: acct.password });
        }
      } catch (e: any) {
        console.error(`Error resetting ${acct.email}:`, e.message);
        results.push({ email: acct.email, status: 'error', message: e.message });
      }
    }

    // Clear any stale sessions
    const allSessions = await kv.getByPrefix('session:');
    if (allSessions && allSessions.length > 0) {
      for (const sessionData of allSessions) {
        // Session values now include their own token, so we can reconstruct the key
        if (sessionData && sessionData.token) {
          await kv.del(`session:${sessionData.token}`).catch(() => {});
        }
      }
      console.log(`Cleared ${allSessions.length} stale sessions`);
    }

    return c.json({
      message: 'Default accounts reset complete',
      accounts: results,
    });
  } catch (error: any) {
    console.error('Reset accounts error:', error);
    return c.json({ message: 'Failed to reset accounts: ' + error.message }, 500);
  }
});

// ============= AUTH ROUTES =============

// Login with email/password - returns server session token (NO JWT)
app.post("/make-server-66851205/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ message: 'Email and password are required' }, 400);
    }

    // Use anon client to verify credentials via signInWithPassword
    const anonClient = getAnonClient();
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Login failed for', email, ':', error.message);
      return c.json({ message: 'Invalid email or password' }, 401);
    }

    if (!data.user) {
      return c.json({ message: 'Login failed - no user returned' }, 401);
    }

    // Credentials verified! Create our own server session
    const userData = {
      userId: data.user.id,
      email: data.user.email || email,
      name: data.user.user_metadata?.name || email.split('@')[0],
      role: data.user.user_metadata?.role || 'toll',
    };

    const { token, session } = await createSession(userData);

    // Sign out from the anon client immediately (we don't need the Supabase session)
    await anonClient.auth.signOut().catch(() => {});

    console.log('Login successful for', userData.email, '- role:', userData.role);

    return c.json({
      token,
      user: {
        id: userData.userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      }
    });
  } catch (error) {
    console.error('Login route error:', error);
    return c.json({ message: 'Internal server error during login' }, 500);
  }
});

// Exchange a Supabase OAuth token for a server session (for OAuth flow)
app.post("/make-server-66851205/auth/exchange", async (c) => {
  try {
    const { supabaseAccessToken } = await c.req.json();

    if (!supabaseAccessToken) {
      return c.json({ message: 'Supabase access token is required' }, 400);
    }

    // Verify the Supabase token one time using admin client
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(supabaseAccessToken);

    if (error || !user) {
      console.error('OAuth exchange failed:', error?.message);
      return c.json({ message: 'Invalid or expired OAuth token' }, 401);
    }

    // Create our own server session
    const userData = {
      userId: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: user.user_metadata?.role || 'toll',
    };

    const { token, session } = await createSession(userData);

    console.log('OAuth exchange successful for', userData.email);

    return c.json({
      token,
      user: {
        id: userData.userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      }
    });
  } catch (error) {
    console.error('OAuth exchange error:', error);
    return c.json({ message: 'Internal server error during OAuth exchange' }, 500);
  }
});

// Get current user from session token
app.get("/make-server-66851205/auth/me", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Not authenticated' }, 401);
    }

    return c.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      }
    });
  } catch (error) {
    console.error('Auth/me error:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// Logout - delete server session
app.post("/make-server-66851205/auth/logout", async (c) => {
  try {
    const sessionToken = c.req.header('X-Session-Token');
    if (sessionToken) {
      await kv.del(`session:${sessionToken}`).catch(() => {});
      console.log('Session deleted successfully');
    }
    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ message: 'Logged out' });
  }
});

// Sign up route (creates user in Supabase Auth)
app.post("/make-server-66851205/auth/signup", async (c) => {
  try {
    const { email, password, userData } = await c.req.json();

    if (!email || !password) {
      return c.json({ message: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: userData || {},
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Sign up error:', error);
      return c.json({ message: error.message }, 400);
    }

    return c.json({
      user: data.user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Sign up route error:', error);
    return c.json({ message: 'Internal server error during sign up' }, 500);
  }
});

// Update user profile (requires auth)
app.put("/make-server-66851205/auth/profile", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const { name, phone, gcashNumber } = await c.req.json();

    // Update user metadata in Supabase
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.admin.updateUserById(session.userId, {
      user_metadata: {
        name: name || session.name,
        role: session.role,
        phone: phone || '',
        gcashNumber: gcashNumber || '',
      }
    });

    if (error) {
      console.error('Profile update error:', error);
      return c.json({ message: 'Failed to update profile' }, 500);
    }

    // Also update the session in KV with new name
    const sessionToken = c.req.header('X-Session-Token');
    if (sessionToken) {
      const existingSession = await kv.get(`session:${sessionToken}`);
      if (existingSession) {
        existingSession.name = name || existingSession.name;
        await kv.set(`session:${sessionToken}`, existingSession);
      }
    }

    return c.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// ============= PARKING SLOTS ROUTES =============

// Get all parking slots (public)
app.get("/make-server-66851205/slots", async (c) => {
  try {
    const slots = await kv.get('parking_slots') || [];
    return c.json({ slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return c.json({ message: 'Failed to fetch slots' }, 500);
  }
});

// Get slots by zone (public)
app.get("/make-server-66851205/slots/zone/:zone", async (c) => {
  try {
    const zone = c.req.param('zone');
    const allSlots = await kv.get('parking_slots') || [];
    const zoneSlots = allSlots.filter((slot: any) => slot.zone === zone);
    return c.json({ slots: zoneSlots });
  } catch (error) {
    console.error('Error fetching zone slots:', error);
    return c.json({ message: 'Failed to fetch zone slots' }, 500);
  }
});

// Update slot status (requires auth)
app.put("/make-server-66851205/slots/:slotId", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const slotId = c.req.param('slotId');
    const { status, plate } = await c.req.json();

    const slots = await kv.get('parking_slots') || [];
    const slotIndex = slots.findIndex((s: any) => s.id === slotId);

    if (slotIndex === -1) {
      return c.json({ message: 'Slot not found' }, 404);
    }

    slots[slotIndex] = {
      ...slots[slotIndex],
      status,
      plate: plate || null,
      entryTime: status === 'occupied' ? new Date().toISOString() : null
    };

    await kv.set('parking_slots', slots);
    return c.json({ slot: slots[slotIndex] });
  } catch (error) {
    console.error('Error updating slot:', error);
    return c.json({ message: 'Failed to update slot' }, 500);
  }
});

// ============= VEHICLES ROUTES =============

// Get all vehicles (public)
app.get("/make-server-66851205/vehicles", async (c) => {
  try {
    const vehicles = await kv.get('vehicles') || [];
    return c.json({ vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return c.json({ message: 'Failed to fetch vehicles' }, 500);
  }
});

// Get vehicle by ID (public)
app.get("/make-server-66851205/vehicles/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const vehicles = await kv.get('vehicles') || [];
    const vehicle = vehicles.find((v: any) => v.id === id);

    if (!vehicle) {
      return c.json({ message: 'Vehicle not found' }, 404);
    }

    return c.json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return c.json({ message: 'Failed to fetch vehicle' }, 500);
  }
});

// Get vehicle by plate (public)
app.get("/make-server-66851205/vehicles/plate/:plate", async (c) => {
  try {
    const plate = c.req.param('plate');
    const vehicles = await kv.get('vehicles') || [];
    const vehicle = vehicles.find((v: any) => v.plate === plate);

    if (!vehicle) {
      return c.json({ message: 'Vehicle not found' }, 404);
    }

    return c.json({ vehicle });
  } catch (error) {
    console.error('Error fetching vehicle by plate:', error);
    return c.json({ message: 'Failed to fetch vehicle' }, 500);
  }
});

// Record vehicle entry (requires auth)
app.post("/make-server-66851205/vehicles/entry", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized - authentication required' }, 401);
    }

    const { plate, owner, slotId } = await c.req.json();

    if (!plate || !slotId) {
      return c.json({ message: 'Plate and slotId are required' }, 400);
    }

    const vehicles = await kv.get('vehicles') || [];

    let vehicle = vehicles.find((v: any) => v.plate === plate);

    if (vehicle) {
      vehicle.status = 'parked';
      vehicle.slotNumber = slotId;
      vehicle.entryTime = new Date().toISOString();
      vehicle.entries = (vehicle.entries || 0) + 1;
    } else {
      vehicle = {
        id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        plate,
        owner: owner || 'Unknown',
        creditScore: 100,
        entries: 1,
        violations: 0,
        status: 'parked',
        slotNumber: slotId,
        entryTime: new Date().toISOString()
      };
      vehicles.push(vehicle);
    }

    await kv.set('vehicles', vehicles);

    // Update slot status
    const slots = await kv.get('parking_slots') || [];
    const slotIndex = slots.findIndex((s: any) => s.id === slotId);
    if (slotIndex !== -1) {
      slots[slotIndex].status = 'occupied';
      slots[slotIndex].plate = plate;
      slots[slotIndex].entryTime = new Date().toISOString();
      await kv.set('parking_slots', slots);
    }

    return c.json({ vehicle });
  } catch (error) {
    console.error('Error recording vehicle entry:', error);
    return c.json({ message: 'Failed to record vehicle entry' }, 500);
  }
});

// Record vehicle exit (requires auth)
app.post("/make-server-66851205/vehicles/:id/exit", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized - authentication required' }, 401);
    }

    const id = c.req.param('id');
    const vehicles = await kv.get('vehicles') || [];
    const vehicleIndex = vehicles.findIndex((v: any) => v.id === id);

    if (vehicleIndex === -1) {
      return c.json({ message: 'Vehicle not found' }, 404);
    }

    const vehicle = vehicles[vehicleIndex];
    const entryTime = new Date(vehicle.entryTime);
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    const fee = durationHours * 25; // ₱25 per hour

    vehicle.status = 'exited';
    vehicle.exitTime = exitTime.toISOString();
    vehicle.duration = `${durationHours}h`;
    vehicle.fee = fee;

    // Update slot to free
    const slots = await kv.get('parking_slots') || [];
    const slotIndex = slots.findIndex((s: any) => s.id === vehicle.slotNumber);
    if (slotIndex !== -1) {
      slots[slotIndex].status = 'free';
      slots[slotIndex].plate = null;
      slots[slotIndex].entryTime = null;
      await kv.set('parking_slots', slots);
    }

    await kv.set('vehicles', vehicles);

    return c.json({ vehicle, fee });
  } catch (error) {
    console.error('Error recording vehicle exit:', error);
    return c.json({ message: 'Failed to record vehicle exit' }, 500);
  }
});

// Delete vehicle (requires auth)
app.delete("/make-server-66851205/vehicles/:id", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized - authentication required' }, 401);
    }

    const id = c.req.param('id');
    const vehicles = await kv.get('vehicles') || [];
    const vehicleIndex = vehicles.findIndex((v: any) => v.id === id);

    if (vehicleIndex === -1) {
      return c.json({ message: 'Vehicle not found' }, 404);
    }

    const vehicle = vehicles[vehicleIndex];

    if (vehicle.status === 'parked' && vehicle.slotNumber) {
      const slots = await kv.get('parking_slots') || [];
      const slotIndex = slots.findIndex((s: any) => s.id === vehicle.slotNumber);
      if (slotIndex !== -1) {
        slots[slotIndex].status = 'free';
        slots[slotIndex].plate = null;
        slots[slotIndex].entryTime = null;
        await kv.set('parking_slots', slots);
      }
    }

    vehicles.splice(vehicleIndex, 1);
    await kv.set('vehicles', vehicles);

    return c.json({ message: 'Vehicle deleted successfully', vehicle });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return c.json({ message: 'Failed to delete vehicle' }, 500);
  }
});

// Update vehicle credit score (requires auth)
app.put("/make-server-66851205/vehicles/:id/credit", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const { score } = await c.req.json();

    const vehicles = await kv.get('vehicles') || [];
    const vehicleIndex = vehicles.findIndex((v: any) => v.id === id);

    if (vehicleIndex === -1) {
      return c.json({ message: 'Vehicle not found' }, 404);
    }

    vehicles[vehicleIndex].creditScore = score;
    await kv.set('vehicles', vehicles);

    return c.json({ vehicle: vehicles[vehicleIndex] });
  } catch (error) {
    console.error('Error updating credit score:', error);
    return c.json({ message: 'Failed to update credit score' }, 500);
  }
});

// ============= VIOLATIONS ROUTES =============

// Get all violations (requires auth)
app.get("/make-server-66851205/violations", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized - authentication required' }, 401);
    }

    const violations = await kv.get('violations') || [];
    return c.json({ violations });
  } catch (error) {
    console.error('Error fetching violations:', error);
    return c.json({ message: 'Failed to fetch violations' }, 500);
  }
});

// Create violation (requires auth)
app.post("/make-server-66851205/violations", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const { plate, type, fine, photoUrl } = await c.req.json();

    if (!plate || !type || !fine) {
      return c.json({ message: 'Plate, type, and fine are required' }, 400);
    }

    const violation = {
      id: `vio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plate,
      type,
      fine,
      photoUrl: photoUrl || null,
      date: new Date().toISOString(),
      status: 'unpaid'
    };

    const violations = await kv.get('violations') || [];
    violations.push(violation);
    await kv.set('violations', violations);

    // Update vehicle credit score
    const vehicles = await kv.get('vehicles') || [];
    const vehicleIndex = vehicles.findIndex((v: any) => v.plate === plate);
    if (vehicleIndex !== -1) {
      vehicles[vehicleIndex].violations = (vehicles[vehicleIndex].violations || 0) + 1;
      vehicles[vehicleIndex].creditScore = Math.max(0, (vehicles[vehicleIndex].creditScore || 100) - 10);
      await kv.set('vehicles', vehicles);
    }

    return c.json({ violation });
  } catch (error) {
    console.error('Error creating violation:', error);
    return c.json({ message: 'Failed to create violation' }, 500);
  }
});

// Update violation status (requires auth)
app.put("/make-server-66851205/violations/:id", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const { status } = await c.req.json();

    const violations = await kv.get('violations') || [];
    const violationIndex = violations.findIndex((v: any) => v.id === id);

    if (violationIndex === -1) {
      return c.json({ message: 'Violation not found' }, 404);
    }

    violations[violationIndex].status = status;
    await kv.set('violations', violations);

    return c.json({ violation: violations[violationIndex] });
  } catch (error) {
    console.error('Error updating violation:', error);
    return c.json({ message: 'Failed to update violation' }, 500);
  }
});

// ============= PAYMENTS ROUTES =============

// Get all payments (requires auth)
app.get("/make-server-66851205/payments", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const payments = await kv.get('payments') || [];
    return c.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return c.json({ message: 'Failed to fetch payments' }, 500);
  }
});

// Create payment (requires auth)
app.post("/make-server-66851205/payments", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const { plate, amount, method, type, referenceId } = await c.req.json();

    if (!plate || !amount || !method || !type) {
      return c.json({ message: 'Plate, amount, method, and type are required' }, 400);
    }

    const payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plate,
      amount,
      method,
      type,
      referenceId: referenceId || null,
      date: new Date().toISOString(),
      status: 'completed'
    };

    const payments = await kv.get('payments') || [];
    payments.push(payment);
    await kv.set('payments', payments);

    if (type === 'violation' && referenceId) {
      const violations = await kv.get('violations') || [];
      const violationIndex = violations.findIndex((v: any) => v.id === referenceId);
      if (violationIndex !== -1) {
        violations[violationIndex].status = 'paid';
        await kv.set('violations', violations);
      }
    }

    return c.json({ payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    return c.json({ message: 'Failed to create payment' }, 500);
  }
});

// Process GCash payment (requires auth)
app.post("/make-server-66851205/payments/gcash", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const { plate, amount, type } = await c.req.json();

    if (!plate || !amount || !type) {
      return c.json({ message: 'Plate, amount, and type are required' }, 400);
    }

    const payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plate,
      amount,
      method: 'GCash',
      type,
      date: new Date().toISOString(),
      status: 'completed',
      gcashReferenceNumber: `GC${Date.now()}`
    };

    const payments = await kv.get('payments') || [];
    payments.push(payment);
    await kv.set('payments', payments);

    return c.json({
      payment,
      message: 'GCash payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing GCash payment:', error);
    return c.json({ message: 'Failed to process GCash payment' }, 500);
  }
});

// ============= ANALYTICS ROUTES =============

// Get dashboard statistics (public)
app.get("/make-server-66851205/analytics/dashboard", async (c) => {
  try {
    const slots = await kv.get('parking_slots') || [];
    const vehicles = await kv.get('vehicles') || [];
    const violations = await kv.get('violations') || [];
    const payments = await kv.get('payments') || [];

    const totalSlots = slots.length;
    const occupiedSlots = slots.filter((s: any) => s.status === 'occupied').length;
    const freeSlots = slots.filter((s: any) => s.status === 'free').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPayments = payments.filter((p: any) =>
      new Date(p.date) >= today && p.status === 'completed'
    );
    const todayRevenue = todayPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

    const unpaidViolations = violations.filter((v: any) => v.status === 'unpaid').length;

    return c.json({
      stats: {
        totalSlots,
        occupiedSlots,
        freeSlots,
        occupancyRate: (occupiedSlots / totalSlots * 100).toFixed(1),
        todayRevenue,
        unpaidViolations,
        totalVehicles: vehicles.length
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ message: 'Failed to fetch dashboard stats' }, 500);
  }
});

// Get occupancy trend (public)
app.get("/make-server-66851205/analytics/occupancy", async (c) => {
  try {
    const period = c.req.query('period') || 'day';

    const data = [];
    const hours = period === 'day' ? 24 : period === 'week' ? 7 * 24 : 30 * 24;

    for (let i = 0; i < Math.min(hours, 48); i++) {
      const time = new Date(Date.now() - (hours - i) * 60 * 60 * 1000);
      const hour = time.getHours();

      const isPeak = (hour >= 9 && hour <= 12) || (hour >= 17 && hour <= 20);
      const baseOccupancy = isPeak ? 200 : 100;
      const variance = Math.random() * 50;

      data.push({
        time: time.toISOString(),
        occupied: Math.floor(baseOccupancy + variance),
        total: 300
      });
    }

    return c.json({ data });
  } catch (error) {
    console.error('Error fetching occupancy trend:', error);
    return c.json({ message: 'Failed to fetch occupancy trend' }, 500);
  }
});

// Get revenue data (requires auth)
app.get("/make-server-66851205/analytics/revenue", async (c) => {
  try {
    const session = await verifyAuth(c.req.raw);
    if (!session) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const start = c.req.query('start');
    const end = c.req.query('end');

    const payments = await kv.get('payments') || [];

    let filteredPayments = payments.filter((p: any) => p.status === 'completed');

    if (start) {
      filteredPayments = filteredPayments.filter((p: any) =>
        new Date(p.date) >= new Date(start)
      );
    }

    if (end) {
      filteredPayments = filteredPayments.filter((p: any) =>
        new Date(p.date) <= new Date(end)
      );
    }

    const totalRevenue = filteredPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const parkingRevenue = filteredPayments
      .filter((p: any) => p.type === 'parking')
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    const violationRevenue = filteredPayments
      .filter((p: any) => p.type === 'violation')
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    return c.json({
      revenue: {
        total: totalRevenue,
        parking: parkingRevenue,
        violations: violationRevenue,
        transactionCount: filteredPayments.length
      }
    });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return c.json({ message: 'Failed to fetch revenue' }, 500);
  }
});

// Get peak prediction (ML-powered simulation)
app.get("/make-server-66851205/analytics/peak-prediction", async (c) => {
  try {
    const now = new Date();
    const predictions = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedPeakTime: isWeekend ? '14:00' : '10:00',
        predictedOccupancy: isWeekend ? 85 : 75,
        confidence: 0.87 + Math.random() * 0.1
      });
    }

    return c.json({ predictions });
  } catch (error) {
    console.error('Error fetching peak prediction:', error);
    return c.json({ message: 'Failed to fetch peak prediction' }, 500);
  }
});

Deno.serve(app.fetch);