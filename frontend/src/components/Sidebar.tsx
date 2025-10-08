import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Heart, Award, Users, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/trips', icon: Map, label: 'Trips' },
    { path: '/wishlist', icon: Heart, label: 'Wishlist' },
    { path: '/badges', icon: Award, label: 'Badges' },
    { path: '/friends', icon: Users, label: 'Friends' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-gradient-to-b from-[#1d3557] to-[#023e8a] h-screen fixed left-0 top-0 text-white shadow-2xl z-50"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <span className="text-3xl">✈️</span>
          Travel Journal
        </h1>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 8 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white text-[#0077b6] font-semibold shadow-lg'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}

          <motion.button
            whileHover={{ x: 8 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-all mt-8"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </motion.button>
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
