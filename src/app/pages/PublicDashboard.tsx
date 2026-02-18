import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ParkingMap } from '../components/ParkingMap';
import { StatCard } from '../components/StatCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { Car, MapPin, Clock, TrendingUp, Search, Info, LogIn, Sparkles } from 'lucide-react';
import { useParkingSlots, useDashboardStats } from '../../hooks/useData';
import { motion } from 'motion/react';

export function PublicDashboard() {
  const navigate = useNavigate();
  const { slots, refetch } = useParkingSlots();
  const { stats, refetch: refetchStats } = useDashboardStats();
  const [searchPlate, setSearchPlate] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Public Dashboard: Refetching data at', new Date().toISOString());
      refetch();
      refetchStats();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetch, refetchStats]);

  const occupiedCount = slots.filter(s => s.status === 'occupied').length;
  const freeCount = slots.filter(s => s.status === 'free').length;
  const totalSlots = slots.length || 600;
  const occupancyPercentage = stats?.occupancyRate || Math.round((occupiedCount / totalSlots) * 100);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlate.trim()) {
      const slot = slots.find(s => s.plate === searchPlate.toUpperCase());
      if (slot) {
        setSearchResult({
          found: true,
          slot: slot.id,
          zone: slot.zone,
          status: 'parked',
          creditScore: 85
        });
      } else {
        setSearchResult({
          found: false,
          creditScore: 90
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-3xl rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-3xl rounded-full" 
        />
      </div>

      {/* Hero Section */}
      <div className="relative bg-card border-b border-border shadow-lg">
        <div className="absolute inset-0 grid-bg opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left Section */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-xl group-hover:bg-primary/30 transition-all" />
                  <div className="relative w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center border border-primary/30 shadow-2xl glow-sm">
                    <MapPin className="w-8 h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2.5} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
                  </div>
                </motion.div>

                {/* Title */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl lg:text-5xl font-black gradient-text">
                      SM TarPark
                    </h1>
                    <span className="text-accent font-black text-xl lg:text-3xl">LIVE</span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs font-black text-primary uppercase tracking-wider">2077</span>
                    </div>
                  </div>
                  
                  <p className="text-base lg:text-lg text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Real-time parking availability at SM Tarlac
                  </p>

                  {/* Status Bar */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm">
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                      </div>
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wide">System Online</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-sm">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">Updates Every 3s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-auto flex items-center gap-3">
              <ThemeToggle />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="group relative flex-1 lg:flex-initial px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary rounded-xl font-bold text-white transition-all shadow-lg glow-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="relative flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  <span className="uppercase tracking-wide">Staff Login</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Slots"
            value={totalSlots}
            icon={MapPin}
            color="blue"
          />
          <StatCard
            title="Free Slots"
            value={freeCount}
            icon={Car}
            color="green"
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Occupancy"
            value={`${occupancyPercentage}%`}
            icon={TrendingUp}
            color="yellow"
          />
          <StatCard
            title="Avg Wait Time"
            value="5 min"
            icon={Clock}
            color="purple"
          />
        </div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/30">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">Vehicle Status</h2>
              <p className="text-sm text-muted-foreground font-semibold">Real-time location tracking</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Enter plate number (e.g., ABC123)"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                className="w-full pl-12 pr-4 py-4 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono text-lg text-foreground placeholder-muted-foreground transition-all"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary rounded-xl font-bold text-white transition-all shadow-lg glow-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                <span className="uppercase tracking-wide">Search</span>
              </div>
            </motion.button>
          </form>

          {searchResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 p-6 rounded-xl border backdrop-blur-sm ${
                searchResult.found 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}
            >
              {searchResult.found ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center border border-primary/30">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-xl">Vehicle Found!</p>
                      <p className="text-sm text-primary font-semibold">Location confirmed</p>
                    </div>
                  </div>
                  <div className="space-y-3 pl-15">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground font-semibold">Location:</span>
                      <span className="text-foreground font-black">Zone {searchResult.zone}, Slot {searchResult.slot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground font-semibold">Credit Score:</span>
                      <span className="text-green-500 font-black">{searchResult.creditScore}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center border border-green-500/30">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-xl">Vehicle Not Parked</p>
                      <p className="text-sm text-green-600 font-semibold">No active parking session</p>
                    </div>
                  </div>
                  <div className="pl-15 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground font-semibold">Your Credit Score:</span>
                    <span className="text-green-500 font-black">{searchResult.creditScore}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Live Parking Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-xl border border-accent/30">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Live Parking Map</h2>
                <p className="text-sm text-muted-foreground font-semibold">Real-time slot availability</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              </div>
              <span className="text-sm font-bold text-green-600 uppercase tracking-wide">Live Updates</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-secondary rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg shadow-lg"></div>
              <span className="text-sm text-foreground font-semibold">Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg shadow-lg"></div>
              <span className="text-sm text-foreground font-semibold">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg shadow-lg"></div>
              <span className="text-sm text-foreground font-semibold">Reserved</span>
            </div>
          </div>
          
          <ParkingMap slots={slots} interactive={false} />
        </motion.div>

        {/* How to Park */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/30">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-foreground">How to Park</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: 'Find Available Slot', desc: 'Check the real-time parking map above to find an available slot. Green slots are free to use.', color: 'blue' },
              { step: 2, title: 'Park Your Vehicle', desc: 'Park in your assigned slot. Note your zone and slot number for easy location.', color: 'green' },
              { step: 3, title: 'Exit & Pay', desc: 'Scan plate at exit. Pay via GCash or cash. ₱25 per hour.', color: 'purple' }
            ].map(({ step, title, desc, color }) => (
              <motion.div 
                key={step}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-${color}-500/5 border border-${color}-500/20 rounded-xl p-6 text-center hover:border-${color}-500/40 transition-all`}
              >
                <div className="relative inline-block mb-4">
                  <div className={`absolute inset-0 bg-${color}-500/20 blur-lg rounded-full`} />
                  <div className={`relative w-16 h-16 bg-gradient-to-br from-${color}-600 to-${color}-500 text-white rounded-full flex items-center justify-center text-2xl font-black border border-${color}-500/30 shadow-lg`}>
                    {step}
                  </div>
                </div>
                <h3 className="font-black text-foreground mb-3 text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-semibold">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Peak Hours Warning */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-500/5 border border-yellow-500/30 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-500/30 shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-foreground text-xl mb-3">⚠️ Peak Hours Alert</p>
              <p className="text-muted-foreground leading-relaxed mb-4 font-semibold">
                High traffic expected during lunch hours (12-2 PM) and evening rush (5-7 PM). 
                We recommend arriving early to secure a parking slot. Plan your visit accordingly!
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <span className="text-sm font-bold text-yellow-600">🕛 Lunch: 12-2 PM</span>
                </div>
                <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <span className="text-sm font-bold text-orange-600">🕔 Evening: 5-7 PM</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border space-y-2">
          <p className="text-sm text-muted-foreground font-semibold">SM TarPark © 2077 | SM Tarlac</p>
          <h3 className="text-sm text-primary font-black uppercase tracking-wide">Website by Angel Bitangcol</h3>
          <p className="text-xs text-muted-foreground">For assistance, contact parking management at the entrance</p>
        </div>
      </div>
    </div>
  );
}
