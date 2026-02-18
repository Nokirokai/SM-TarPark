import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Map,
  Car,
  AlertTriangle,
  CreditCard,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  role: 'toll' | 'admin';
}

export function Sidebar({ isOpen, onToggle, role }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const tollMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/${role}` },
    { icon: Map, label: 'Slots Map', path: `/${role}/slots` },
    { icon: Car, label: 'Vehicles', path: `/${role}/vehicles` },
    { icon: AlertTriangle, label: 'Violations', path: `/${role}/violations` },
    { icon: CreditCard, label: 'Payments', path: `/${role}/payments` },
    { icon: FileText, label: 'Reports', path: `/${role}/reports` },
    { icon: Settings, label: 'Settings', path: `/${role}/settings` }
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/${role}` },
    { icon: Map, label: 'Slots Map', path: `/${role}/slots` },
    { icon: Car, label: 'Vehicles', path: `/${role}/vehicles` },
    { icon: AlertTriangle, label: 'Violations', path: `/${role}/violations` },
    { icon: CreditCard, label: 'Payments', path: `/${role}/payments` },
    { icon: FileText, label: 'Reports', path: `/${role}/reports` },
    { icon: Settings, label: 'Settings', path: `/${role}/settings` }
  ];

  const menuItems = role === 'toll' ? tollMenuItems : adminMenuItems;

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Toggle button - positioned outside sidebar */}
      <motion.button
        initial={false}
        animate={{ 
          x: isOpen ? 280 - 16 : -16
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="hidden lg:flex fixed left-0 top-[73px] lg:top-[89px] mt-6 w-8 h-8 bg-card border border-primary text-primary rounded-full items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg z-[60]"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </motion.button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -280,
          width: isOpen ? 280 : 0
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className="fixed left-0 top-[73px] lg:top-[89px] bottom-0 bg-card border-r border-border shadow-2xl z-[45] overflow-hidden"
      >
        <div className="h-full flex flex-col relative">
          {/* Animated background */}
          <div className="absolute inset-0 grid-bg opacity-20" />

          {/* Role badge */}
          <div className="relative p-4 border-b border-border">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative px-4 py-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/30 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-primary uppercase tracking-wider font-black">Current Role</p>
                <div className="relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                </div>
              </div>
              <p className="text-sm font-black text-foreground uppercase tracking-wide">
                {role === 'toll' ? 'Toll Personnel' : 'Administrator'}
              </p>
            </motion.div>
          </div>

          {/* Navigation items */}
          <nav className="relative flex-1 overflow-y-auto p-4 custom-scrollbar">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path === `/${role}` && location.pathname === `/${role}`);

                return (
                  <motion.li 
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <motion.button
                      onClick={() => {
                        navigate(item.path);
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg glow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border'
                      }`}
                    >
                      {/* Shimmer effect on hover */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      )}
                      
                      <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${
                        isActive ? 'text-white' : ''
                      }`} />
                      <span className="font-bold uppercase tracking-wide text-sm relative z-10">{item.label}</span>
                      
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-lg"
                        />
                      )}
                    </motion.button>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* Footer info */}
          <div className="relative p-4 border-t border-border bg-secondary/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs mb-3">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
              </div>
              <span className="text-green-500 font-black uppercase tracking-wide">System Online</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold">SM TarPark © 2077</p>
              <h3 className="text-xs text-primary font-black uppercase tracking-wide">Website by Angel Bitangcol</h3>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
