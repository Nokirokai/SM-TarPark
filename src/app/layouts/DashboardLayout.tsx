import { useState, ReactNode } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ToastContainer, ToastProps } from '../components/Toast';
import { motion } from 'motion/react';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'toll' | 'admin';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const handleToastClose = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-20" />
        
        {/* Floating orbs */}
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

      {/* Content */}
      <div className="relative z-10">
        <Navbar 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen}
        />
        
        <div className="flex pt-[73px] lg:pt-[89px]">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            role={role}
          />
          
          <main 
            className={`flex-1 transition-all duration-300 ${
              isSidebarOpen ? 'lg:ml-[280px]' : 'ml-0'
            }`}
          >
            <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>

        <ToastContainer toasts={toasts} onClose={handleToastClose} />

        {/* Footer */}
        <footer 
          className={`relative bg-card border-t border-border py-6 transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-[280px]' : 'ml-0'
          }`}
        >
          <div className="absolute inset-0 grid-bg opacity-10" />

          <div className="relative max-w-[1600px] mx-auto px-4 lg:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground font-semibold">
                    © 2077 SM TarPark. All rights reserved.
                  </p>
                  <h3 className="text-sm text-primary font-black uppercase tracking-wide">
                    Website by Angel Bitangcol
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <button className="hover:text-primary transition-colors font-semibold">Privacy Policy</button>
                <span className="text-primary/50">•</span>
                <button className="hover:text-primary transition-colors font-semibold">Terms of Service</button>
                <span className="text-primary/50">•</span>
                <button className="hover:text-primary transition-colors font-semibold">Contact Support</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}