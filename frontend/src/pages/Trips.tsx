import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Map, Plus, Calendar } from 'lucide-react';

// Dummy trips
const DUMMY_TRIPS = [
  { id: 1, userEmail: 'adam@gmail.com', name: 'Paris Adventure', description: 'Eiffel Tower, Louvre', start_date: '2025-10-01', end_date: '2025-10-05' },
  { id: 2, userEmail: 'eve@gmail.com', name: 'Safari in Kenya', description: 'Wildlife and Nature', start_date: '2025-11-10', end_date: '2025-11-20' },
  { id: 3, userEmail: 'adam@gmail.com', name: 'Tokyo Exploration', description: 'Food & Culture', start_date: '2025-12-05', end_date: '2025-12-10' },
];

const Trips = () => {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState<typeof DUMMY_TRIPS>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const userTrips = DUMMY_TRIPS.filter(t => t.userEmail === currentUser.email);
      setTrips(userTrips);
    }
    setLoading(false);
  }, [currentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl text-gray-600">Loading trips...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">My Trips</h1>
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

        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Map size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No trips yet</h2>
            <p className="text-gray-600 mb-6">Start documenting your adventures!</p>
            <Link to="/trips/new">
              <button className="bg-[#0077b6] text-white px-8 py-3 rounded-lg hover:bg-[#023e8a] transition-colors font-semibold">
                Create Your First Trip
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link to={`/trips/${trip.id}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all h-full border-2 border-transparent hover:border-[#0077b6]">
                    <div className="mb-4">
                      <div className="w-full h-40 bg-gradient-to-br from-[#0077b6] to-[#023e8a] rounded-xl flex items-center justify-center">
                        <Map size={48} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{trip.description || 'No description'}</p>
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
            ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Trips;
