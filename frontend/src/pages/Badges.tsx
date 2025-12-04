import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Award, Lock, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface Badge {
  id: string;
  name: string;
  description: string;
  requiredTrips: number;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

const MASTER_BADGES: Omit<Badge, "unlocked" | "unlockedDate">[] = [
  { id: "exp", name: "Explorer", description: "Complete your first trip.", requiredTrips: 1, icon: "🗺️" },
  { id: "adv", name: "Adventurer", description: "Log 3 trips.", requiredTrips: 3, icon: "🧭" },
  { id: "globetrot", name: "Globetrotter", description: "Reach 5 trips.", requiredTrips: 5, icon: "🌐" },
  { id: "world_trav", name: "World Traveler", description: "Achieve 8+ trips.", requiredTrips: 8, icon: "🌟" },
  { id: "frequent_flier", name: "Frequent Flier", description: "Travel a lot.", requiredTrips: 12, icon: "✈️" },
];

const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#0077b6", "#f77f00", "#90be6d", "#d62828"],
  });
};

const Badges: React.FC = () => {
  const { currentUser } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const userTrips = (currentUser as any)?.tripsCompleted || 0;

  useEffect(() => {
    if (!currentUser) return;

    const prevCount = parseInt(sessionStorage.getItem("badgeCount") || "0", 10);
    let newCount = 0;

    const badges = MASTER_BADGES.map((b) => {
      const unlocked = userTrips >= b.requiredTrips;
      if (unlocked) newCount++;
      return {
        ...b,
        unlocked,
        unlockedDate: unlocked ? new Date().toISOString() : undefined, // optionally fetch real date from backend
      };
    });

    setAllBadges(badges);

    if (newCount > prevCount) triggerConfetti();
    sessionStorage.setItem("badgeCount", newCount.toString());
  }, [currentUser, userTrips]);

  const unlocked = allBadges.filter((b) => b.unlocked);
  const locked = allBadges.filter((b) => !b.unlocked);
  const progress = allBadges.length ? Math.round((unlocked.length / allBadges.length) * 100) : 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#1d3557] mb-2">Achievements & Badges 🏆</h1>
          <p className="text-gray-600">You've completed {userTrips} trips.</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-[#0077b6] to-[#90be6d] rounded-2xl p-8 mb-12 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
              <p className="text-white/90">{unlocked.length} of {allBadges.length} badges unlocked</p>
            </div>
            <div className="text-5xl font-extrabold">{progress}%</div>
          </div>
          <div className="mt-6 h-4 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-white rounded-full shadow-inner"
            />
          </div>
        </motion.div>

        {unlocked.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6 border-b pb-3 border-gray-200">
              <Sparkles className="w-6 h-6 text-[#f77f00]" />
              <h2 className="text-2xl font-bold text-[#1d3557]">Unlocked Badges</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {unlocked.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                  onHoverStart={() => setHoveredBadge(b.id)}
                  onHoverEnd={() => setHoveredBadge(null)}
                  className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-6 cursor-pointer group"
                >
                  <div className="relative z-10 text-center">
                    <div className="text-6xl mb-3">{b.icon}</div>
                    <h3 className="text-lg font-bold text-[#1d3557] mb-2">{b.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{b.description}</p>
                    {b.unlockedDate && (
                      <p className="text-xs text-[#0077b6] font-medium">
                        Unlocked: {new Date(b.unlockedDate).toLocaleDateString()}
                      </p>
                    )}
                    {hoveredBadge === b.id && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-3 -right-3">
                        <Award className="w-8 h-8 text-[#f77f00]" fill="#f77f00" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {locked.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6 border-b pb-3 border-gray-200">
              <Lock className="w-6 h-6 text-gray-400" />
              <h2 className="text-2xl font-bold text-[#1d3557]">Locked Badges</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {locked.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md p-6 opacity-70 cursor-not-allowed group"
                >
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="text-6xl mb-3 text-center grayscale opacity-80">{b.icon}</div>
                  <h3 className="text-lg font-bold text-gray-600 text-center mb-2">{b.name}</h3>
                  <p className="text-sm text-gray-500 text-center">
                    {b.requiredTrips - userTrips} more trips to unlock!
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
