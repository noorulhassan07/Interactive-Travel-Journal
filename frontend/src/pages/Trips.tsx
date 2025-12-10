import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Map, Plus, Calendar } from 'lucide-react';
import { getUserTrips } from '../services/api';

interface Trip {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

const Trips = () => {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadTrips = async () => {
      try {
        const { data } = await getUserTrips(currentUser.email);
        setTrips(data);
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [currentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full text-2xl text-gray-600">
          Loading trips...
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
              <Plus size={20} /> New Trip
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
            {trips.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all h-full border-2 border-transparent hover:border-[#0077b6]">
                  <div className="w-full h-40 bg-gradient-to-br from-[#0077b6] to-[#023e8a] rounded-xl flex items-center justify-center mb-4">
                    <Map size={48} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{trip.description || 'No description'}</p>
                  {trip.start_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={16} />
                      <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                      {trip.end_date && <><span>-</span><span>{new Date(trip.end_date).toLocaleDateString()}</span></>}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Trips;
