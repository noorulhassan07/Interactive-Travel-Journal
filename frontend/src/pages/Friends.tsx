// src/pages/Friends.tsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Users, MapPin } from 'lucide-react';

interface Friend {
  username: string;
  email: string;
  trips: number;
  country?: string;
}

// Dummy friends data
const DUMMY_FRIENDS: Record<string, Friend[]> = {
  'adam@gmail.com': [
    { username: 'Eve', email: 'eve@gmail.com', trips: 2, country: 'France' },
    { username: 'John', email: 'john@gmail.com', trips: 7, country: 'USA' },
  ],
  'eve@gmail.com': [
    { username: 'Adam', email: 'adam@gmail.com', trips: 5, country: 'Germany' },
    { username: 'Alice', email: 'alice@gmail.com', trips: 1, country: 'Italy' },
  ],
  'john@gmail.com': [
    { username: 'Adam', email: 'adam@gmail.com', trips: 5, country: 'Germany' },
  ],
  'alice@gmail.com': [
    { username: 'Eve', email: 'eve@gmail.com', trips: 2, country: 'France' },
  ],
};

const Friends = () => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const userFriends = DUMMY_FRIENDS[currentUser.email] || [];
    setFriends(userFriends);
  }, [currentUser]);

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Your Friends</h1>
        {friends.length === 0 ? (
          <p className="text-gray-600">You have no friends added yet. Add some friends to see their travel journeys!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {friends.map((friend, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center"
              >
                <Users size={48} className="mb-2 text-[#0077b6]" />
                <h3 className="text-xl font-bold">{friend.username}</h3>
                <p className="text-gray-600 text-sm mb-2">{friend.email}</p>
                <p className="text-gray-800 font-medium">{friend.trips} Trips</p>
                {friend.country && (
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {friend.country}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Friends;
