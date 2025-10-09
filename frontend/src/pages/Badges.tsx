// src/pages/Badges.tsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
// @ts-ignore: Assuming you'll install canvas-confetti: npm install canvas-confetti
import confetti from 'canvas-confetti';
import { Award, Lock, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// --- INTERFACE & DATA ---

interface Badge {
  id: string; // Unique ID for keying/hover state
  name: string;
  description: string;
  requiredTrips: number;
  icon: string; // Using a string for emoji/custom icon
  unlocked: boolean; // Calculated status
  unlockedDate?: string; // Optional unlock date
}

// NOTE: This array is the MASTER LIST of all possible badges
const MASTER_BADGES: Omit<Badge, 'unlocked' | 'unlockedDate'>[] = [
  { id: 'exp', name: 'Explorer', description: 'Complete your very first trip.', requiredTrips: 1, icon: '🗺️' },
  { id: 'adv', name: 'Adventurer', description: 'Log 3 trips to different locations.', requiredTrips: 3, icon: '🧭' },
  { id: 'globetrot', name: 'Globetrotter', description: 'Reach 5 total logged trips.', requiredTrips: 5, icon: '🌐' },
  { id: 'world_trav', name: 'World Traveler', description: 'Achieve 8 or more total trips.', requiredTrips: 8, icon: '🌟' },
  { id: 'frequent_flier', name: 'Frequent Flier', description: 'Travel a lot this year.', requiredTrips: 12, icon: '✈️' },
];

// Dummy trips count for users (from your original code)
const DUMMY_USER_TRIPS: Record<string, number> = {
  'adam@gmail.com': 5,
  'eve@gmail.com': 2,
  'john@gmail.com': 7,
  'alice@gmail.com': 1,
};

// --- CONFETTI EFFECT ---

const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#0077b6', '#f77f00', '#90be6d', '#d62828'], // Your app's theme colors
  });
};

// --- COMPONENT START ---

const Badges = () => {
  // Switched 'user' to 'currentUser' to match your AuthContext usage
  const { currentUser } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userTrips, setUserTrips] = useState(0);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // --- DATA LOADING & LOGIC ---
  useEffect(() => {
    if (!currentUser) return;

    const currentTrips = DUMMY_USER_TRIPS[currentUser.email] || 0;
    setUserTrips(currentTrips);

    let hadPrevBadgeCount = parseInt(sessionStorage.getItem('badgeCount') || '0', 10);
    let newBadgeCount = 0;

    const badgesWithStatus = MASTER_BADGES.map((badge) => {
      const unlocked = currentTrips >= badge.requiredTrips;
      if (unlocked) {
        newBadgeCount++;
      }
      return {
        ...badge,
        unlocked,
        // Using a dummy date for unlocked badges for the display
        unlockedDate: unlocked ? '2025-01-01' : undefined,
      };
    });

    setAllBadges(badgesWithStatus);
    
    // --- NEW BADGE CONFETTI LOGIC ---
    if (newBadgeCount > hadPrevBadgeCount) {
      triggerConfetti();
      // Store the new count in session storage
      sessionStorage.setItem('badgeCount', newBadgeCount.toString());
    } else if (newBadgeCount < hadPrevBadgeCount) {
        // Handle case where trips count might decrease (for robustness)
        sessionStorage.setItem('badgeCount', newBadgeCount.toString());
    }

  }, [currentUser]);

  // --- DERIVED STATE ---
  const unlockedBadges = allBadges.filter((b) => b.unlocked);
  const lockedBadges = allBadges.filter((b) => !b.unlocked);
  const totalBadges = allBadges.length;
  const progressPercent = totalBadges > 0 ? Math.round((unlockedBadges.length / totalBadges) * 100) : 0;


  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1d3557] mb-2">
            Achievements & Badges 🏆
          </h1>
          <p className="text-gray-600">
            Unlock badges by exploring the world and completing challenges. You've completed **{userTrips}** trips.
          </p>
        </motion.div>

        {/* --- PROGRESS BAR SECTION --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-[#0077b6] to-[#90be6d] rounded-2xl p-8 mb-12 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
              <p className="text-white/90">
                **{unlockedBadges.length} of {totalBadges}** badges unlocked
              </p>
            </div>
            <div className="text-5xl font-extrabold">
              {progressPercent}%
            </div>
          </div>
          <div className="mt-6 h-4 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-white rounded-full shadow-inner"
            ></motion.div>
          </div>
        </motion.div>

        {/* --- UNLOCKED BADGES --- */}
        {unlockedBadges.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6 border-b pb-3 border-gray-200">
              <Sparkles className="w-6 h-6 text-[#f77f00]" />
              <h2 className="text-2xl font-bold text-[#1d3557]">
                Unlocked Badges
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {unlockedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                  onHoverStart={() => setHoveredBadge(badge.id)}
                  onHoverEnd={() => setHoveredBadge(null)}
                  className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 cursor-pointer group transition-all duration-300"
                >
                  <div className="relative z-10">
                    <div className="text-6xl mb-3 text-center">{badge.icon}</div>
                    <h3 className="text-lg font-bold text-[#1d3557] text-center mb-2">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-3">
                      {badge.description}
                    </p>
                    {badge.unlockedDate && (
                      <p className="text-xs text-[#0077b6] text-center font-medium">
                        Unlocked: {new Date(badge.unlockedDate).toLocaleDateString()}
                      </p>
                    )}

                    {hoveredBadge === badge.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-3 -right-3"
                      >
                        <Award className="w-8 h-8 text-[#f77f00]" fill="#f77f00" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* --- LOCKED BADGES --- */}
        {lockedBadges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6 border-b pb-3 border-gray-200">
              <Lock className="w-6 h-6 text-gray-400" />
              <h2 className="text-2xl font-bold text-[#1d3557]">Locked Badges</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {lockedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md p-6 opacity-70 cursor-not-allowed group"
                >
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>

                  <div className="text-6xl mb-3 text-center grayscale opacity-80">
                    {badge.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-600 text-center mb-2">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
                    **{badge.requiredTrips - userTrips} more trips** to unlock!
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Badges;
