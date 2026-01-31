import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, Heart, Calendar, BookHeart, LogOut } from 'lucide-react';
import { useRole } from '@/lib/roleContext';

const navItems = [
  { to: '/home', icon: Search, label: 'Search' },
  { to: '/picks', icon: Heart, label: 'Picks' },
  { to: '/thursday', icon: Calendar, label: 'Thursday' },
  { to: '/memories', icon: BookHeart, label: 'Memories' },
];

export function Navigation() {
  const { role, clearRole } = useRole();
  const location = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:top-0 md:bottom-auto"
    >
      <div className="max-w-lg mx-auto">
        <div className="glass-card rounded-2xl p-2 flex items-center justify-between">
          {/* Role indicator */}
          <div className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
            role === 'dherru' ? 'role-dherru border' : 'role-nivi border'
          }`}>
            {role === 'dherru' ? 'Dherru' : 'Nivi'}
          </div>

          {/* Nav items */}
          <div className="flex gap-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`
                    relative p-3 rounded-xl transition-all
                    ${isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Logout */}
          <button
            onClick={clearRole}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title="Switch role"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
