// frontend/src/pages/TripDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Calendar, Map } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTripById } from '../services/api';

interface Trip {
  id: number;
  userEmail: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!currentUser || !id) return;

      try {
        const { data } = await getTripById(Number(id));
        if (data.userEmail === currentUser.email) {
          setTrip(data);
        } else {
          setTrip(null);
        }
      } catch (error) {
        console.error('Failed to fetch trip:', error);
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, currentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600 text-xl">Loading trip details...</p>
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full flex-col">
          <p className="text-gray-600 text-xl mb-4">
            Trip not found or you don't have access.
          </p>
          <Link to="/trips" className="text-blue-600 underline">
            Go Back
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">{trip.name}</h1>
        {trip.description && <p className="text-gray-600 mb-4">{trip.description}</p>}

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

        <Link to="/trips" className="text-blue-600 underline mt-4 block">
          Back to Trips
        </Link>
      </motion.div>
    </Layout>
  );
};

export default TripDetail;
