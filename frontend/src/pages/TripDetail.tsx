import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Map, Calendar } from 'lucide-react';

// Dummy trips
const DUMMY_TRIPS = [
  { id: 1, userEmail: 'adam@gmail.com', name: 'Paris Adventure', description: 'Eiffel Tower, Louvre', start_date: '2025-10-01', end_date: '2025-10-05' },
  { id: 2, userEmail: 'eve@gmail.com', name: 'Safari in Kenya', description: 'Wildlife and Nature', start_date: '2025-11-10', end_date: '2025-11-20' },
  { id: 3, userEmail: 'adam@gmail.com', name: 'Tokyo Exploration', description: 'Food & Culture', start_date: '2025-12-05', end_date: '2025-12-10' },
];

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [trip, setTrip] = useState<typeof DUMMY_TRIPS[0] | null>(null);

  useEffect(() => {
    if (currentUser) {
      const foundTrip = DUMMY_TRIPS.find(t => t.id === Number(id) && t.userEmail === currentUser.email);
      setTrip(foundTrip || null);
    }
  }, [id, currentUser]);

  if (!trip) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600 text-xl">Trip not found or you don't have access.</p>
          <Link to="/trips" className="ml-4 text-blue-600 underline">Go Back</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">{trip.name}</h1>
        <p className="text-gray-600 mb-4">{trip.description}</p>
        {trip.start_date && (
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={20} />
            <span>{new Date(trip.start_date).toLocaleDateString()}</span>
            {trip.end_date && (
              <>
                <span>-</span>
                <span>{new Date(trip.end_date).toLocaleDateString()}</span>
              </>
            )}
          </div>
        )}
        <div className="w-full h-64 bg-gradient-to-br from-[#0077b6] to-[#023e8a] rounded-xl flex items-center justify-center mt-6">
          <Map size={48} className="text-white" />
        </div>
        <Link to="/trips" className="text-blue-600 underline mt-4 block">Back to Trips</Link>
      </motion.div>
    </Layout>
  );
};

export default TripDetail;
