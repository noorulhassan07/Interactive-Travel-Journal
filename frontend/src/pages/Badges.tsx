// src/pages/Badges.tsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Trophy } from 'lucide-react';

interface Badge {
  name: string;
  requiredTrips: number;
  color: string;
}

const BADGES: Badge[] = [
  { name: 'Explorer', requiredTrips: 1, color: 'bg-blue-400' },
  { name: 'Adventurer', requiredTrips: 3, color: 'bg-green-400' },
  { name: 'Globetrotter', requiredTrips: 5, color: 'bg-yellow-400' },
  { name: 'World Traveler', requiredTrips: 8, color: 'bg-orange-400' },
];

const Badges = () => {
  const { currentUser } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [userTrips, setUserTrips] = useState(0);

  // Dummy trips count for users
  const DUMMY_USER_TRIPS: Record<string, number> = {
    'adam@gmail.com': 5,
    'eve@gmail.com': 2,
    'john@gmail.com': 7,
    'alice@gmail.com': 1,
  };

  useEffect(() => {
    if (!currentUser) return;

    const trips = DUMMY_USER_TRIPS[currentUser.email] || 0;
    setUserTrips(trips);

    const badges = BADGES.filter((badge) => trips >= badge.requiredTrips);
    setEarnedBadges(badges);
  }, [currentUser]);

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Your Badges</h1>
        <p className="text-gray-600 mb-6">
          You have completed <strong>{userTrips}</strong> trips.
        </p>

        {earnedBadges.length === 0 ? (
          <p className="text-gray-600">No badges earned yet. Go on more trips!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {earnedBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg ${badge.color} text-white`}
              >
                <Trophy size={48} className="mb-2" />
                <h3 className="text-xl font-bold">{badge.name}</h3>
                <p className="text-sm">Requires {badge.requiredTrips} trips</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Badges;
