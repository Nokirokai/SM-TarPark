import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Menu, X, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { toast } from 'sonner';
import { SMLogoSVG } from './SMLogoSVG';
import { motion } from 'motion/react';

interface NavbarProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onMenuToggle, isSidebarOpen }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  
  const { user = null, signOut = async () => {} } = auth || {};
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const isLoggedIn = !!user;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentRole = 
    location.pathname.startsWith('/admin') ? 'Admin' :
    location.pathname.startsWith('/toll') ? 'Toll Personnel' :
    'Public';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vehicles?search=${searchQuery}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-card/95 border-b border-border shadow-lg z-[100] backdrop-blur-xl">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {isLoggedIn && currentRole !== 'Public' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMenuToggle}
                className="lg:hidden p-2 hover:bg-secondary rounded-xl transition-colors"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            )}
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
                <SMLogoSVG className="relative w-full h-full filter drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-black gradient-text">SM TarPark</h1>
                <p className="text-xs text-muted-foreground font-semibold hidden sm:block">Smart Parking System</p>
              </div>
            </motion.div>
          </div>

          {/* Center - Search */}
          {isLoggedIn && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="text"
                  placeholder="Search plate number (e.g., ABC123)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground transition-all font-mono"
                />
              </div>
            </form>
          )}

          {/* Right section */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Real-time clock */}
            <div className="text-right hidden lg:block">
              <div className="text-sm font-black text-primary">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User actions */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className="p-2 hover:bg-secondary rounded-xl transition-colors hidden sm:block border border-border"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5 text-primary" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-bold">Logout</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-primary transition-all text-sm font-bold shadow-lg glow-sm"
              >
                Login
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile search */}
        {isLoggedIn && (
          <form onSubmit={handleSearch} className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                type="text"
                placeholder="Search plate (ABC123)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground transition-all font-mono"
              />
            </div>
          </form>
        )}
      </div>
    </nav>
  );
}