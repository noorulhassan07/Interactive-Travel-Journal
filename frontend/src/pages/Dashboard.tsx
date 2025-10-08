import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Map, Heart, Award, Users, Plus, Calendar } from 'lucide-react';

// --- Dummy Data ---
const DUMMY_TRIPS = [
  { id: 1, userEmail: 'adam@gmail.com', name: 'Paris Adventure', description: 'Eiffel Tower, Louvre', start_date: '2025-10-01', end_date: '2025-10-05' },
  { id: 2, userEmail: 'eve@gmail.com', name: 'Safari in Kenya', description: 'Wildlife and Nature', start_date: '2025-11-10', end_date: '2025-11-20' },
  { id: 3, userEmail: 'adam@gmail.com', name: 'Tokyo Exploration', description: 'Food & Culture', start_date: '2025-12-05', end_date: '2025-12-10' },
];

const DUMMY_STATS = {
  'adam@gmail.com': { trips_count: 2, countries_visited: 2, followers_count: 10 },
  'eve@gmail.com': { trips_count: 1, countries_visited: 1, followers_count: 5 },
};

const DUMMY_WISHLIST = [
  { id: 1, userEmail: 'adam@gmail.com', city: 'Rome', country: 'Italy', notes: 'Visit Colosseum', priority: 5 },
  { id: 2, userEmail: 'eve@gmail.com', city: 'Nairobi', country: 'Kenya', notes: 'Safari trip', priority: 4 },
  { id: 3, userEmail: 'adam@gmail.com', city: 'Kyoto', country: 'Japan', notes: 'Cherry blossom season', priority: 3 },
];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState<typeof DUMMY_TRIPS>([]);
  const [stats, setStats] = useState<{ trips_count: number; countries_visited: number; followers_count: number } | null>(null);
  const [wishlist, setWishlist] = useState<typeof DUMMY_WISHLIST>([]);
  const [loading, setLoading] = useState(true);
const DUMMY_STATS: { [key: string]: { trips_count: number; countries_visited: number; followers_count: number } } = {
  'adam@gmail.com': { trips_count: 2, countries_visited: 2, followers_count: 10 },
  'eve@gmail.com': { trips_count: 1, countries_visited: 1, followers_count: 5 },
};
  useEffect(() => {
    if (!currentUser) return;

    // Filter data for the current dummy user
    const userTrips = DUMMY_TRIPS.filter(t => t.userEmail === currentUser.email);
    const userStats = DUMMY_STATS[currentUser.email] || { trips_count: 0, countries_visited: 0, followers_count: 0 };
    const userWishlist = DUMMY_WISHLIST.filter(w => w.userEmail === currentUser.email);

    setTrips(userTrips);
    setStats(userStats);
    setWishlist(userWishlist);
    setLoading(false);
  }, [currentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome back, {currentUser?.email}!
            </h1>
            <p className="text-gray-600">Ready for your next adventure?</p>
          </div>
          <Link to="/trips/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2"
            >
              <Plus size={20} />
              New Trip
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-[#0077b6] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Map size={24} className="text-[#0077b6]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats?.trips_count}</h3>
            <p className="text-gray-600 font-medium">Total Trips</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-[#90be6d] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Award size={24} className="text-[#90be6d]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats?.countries_visited}</h3>
            <p className="text-gray-600 font-medium">Countries Visited</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-[#f77f00] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Users size={24} className="text-[#f77f00]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats?.followers_count}</h3>
            <p className="text-gray-600 font-medium">Followers</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-[#d62828] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Heart size={24} className="text-[#d62828]" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{wishlist.length}</h3>
            <p className="text-gray-600 font-medium">Wishlist Items</p>
          </motion.div>
        </div>

        {/* Recent Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Recent Trips</h2>
              <Link to="/trips" className="text-[#0077b6] font-semibold hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {trips.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
                  <Map size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No trips yet. Start your journey!</p>
                  <Link to="/trips/new">
                    <button className="bg-[#0077b6] text-white px-6 py-2 rounded-lg hover:bg-[#023e8a] transition-colors">
                      Create Your First Trip
                    </button>
                  </Link>
                </div>
              ) : (
                trips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 8 }}
                  >
                    <Link to={`/trips/${trip.id}`}>
                      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-[#0077b6]">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.name}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{trip.description}</p>
                        {trip.start_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={16} />
                            <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                            {trip.end_date && (
                              <>
                                <span>-</span>
                                <span>{new Date(trip.end_date).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Wishlist */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Travel Wishlist</h2>
              <Link to="/wishlist" className="text-[#0077b6] font-semibold hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {wishlist.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
                  <Heart size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No destinations in your wishlist yet</p>
                  <Link to="/wishlist">
                    <button className="bg-[#f77f00] text-white px-6 py-2 rounded-lg hover:bg-[#d62828] transition-colors">
                      Add Destinations
                    </button>
                  </Link>
                </div>
              ) : (
                wishlist.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: -8 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-r-4 border-[#f77f00]"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {item.city}, {item.country}
                    </h3>
                    {item.notes && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.notes}</p>
                    )}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-lg ${i < item.priority ? 'text-[#f77f00]' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
