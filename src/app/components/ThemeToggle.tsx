import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'motion/react';

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const themes = [
    { mode: 'light' as const, icon: Sun, label: 'Light', gradient: 'from-yellow-400 to-orange-500' },
    { mode: 'dark' as const, icon: Moon, label: 'Dark', gradient: 'from-blue-500 to-purple-600' },
    { mode: 'night' as const, icon: Sparkles, label: 'Night', gradient: 'from-cyan-500 to-blue-600' }
  ];

  return (
    <div className="flex items-center gap-1 p-1.5 bg-card border border-border rounded-xl shadow-lg">
      {themes.map(({ mode: themeMode, icon: Icon, label, gradient }) => (
        <motion.button
          key={themeMode}
          onClick={() => setMode(themeMode)}
          className={`relative px-3 py-2 rounded-lg transition-all duration-200 ${
            mode === themeMode
              ? 'text-white shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={label}
        >
          <Icon className="w-4 h-4" />
          {mode === themeMode && (
            <motion.div
              layoutId="activeTheme"
              className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-lg -z-10`}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
