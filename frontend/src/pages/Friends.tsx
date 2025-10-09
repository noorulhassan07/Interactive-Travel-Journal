// src/pages/Friends.tsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout'; // Import Layout
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Users, Trophy, Search, MapPin } from 'lucide-react'; // Added Trophy and Search

// --- INTERFACES ---
interface Friend {
  id: string; // Added ID for easier state management (like toggling follow)
  username: string;
  email: string;
  profilePic: string; // Added profile pic for the visual design
  countriesVisited: number; // Added for the Leaderboard/Friend card
  isFollowing: boolean; // Added for the Follow feature
}

// Traveler interface is the same as Friend, just semantically different for the leaderboard
interface Traveler extends Friend {
  // Can add specific leaderboard props here if needed, but Friend is sufficient
}

// --- DUMMY DATA & SERVICE FUNCTIONS (to replace ../services/dummyData) ---

const ALL_USERS: Friend[] = [
  { id: 'u1', username: 'Adam Smith', email: 'adam@gmail.com', profilePic: '/path/to/adam.jpg', countriesVisited: 5, isFollowing: true },
  { id: 'u2', username: 'Eve Johnson', email: 'eve@gmail.com', profilePic: '/path/to/eve.jpg', countriesVisited: 12, isFollowing: true },
  { id: 'u3', username: 'John Doe', email: 'john@gmail.com', profilePic: '/path/to/joe.jpg', countriesVisited: 7, isFollowing: false },
  { id: 'u4', username: 'Alice Brown', email: 'alice@gmail.com', profilePic: '/path/to/alice.jpeg', countriesVisited: 3, isFollowing: false },
  { id: 'u5', username: 'Grace Hopper', email: 'grace@gmail.com', profilePic: '/path/to/grace.jpg', countriesVisited: 25, isFollowing: false },
];

const getUserFriends = (userEmail: string): Friend[] => {
  // Logic to simulate which users a specific user is following
  // Here, we'll just filter out the current user and provide the list
  const currentUser = ALL_USERS.find(u => u.email === userEmail);
  
  if (!currentUser) return [];
  
  // Example: Adam follows Eve and John. Eve follows Adam and Alice.
  const friendEmailsMap: Record<string, string[]> = {
    'adam@gmail.com': ['eve@gmail.com', 'john@gmail.com'],
    'eve@gmail.com': ['adam@gmail.com', 'alice@gmail.com'],
    'john@gmail.com': ['adam@gmail.com'],
    'alice@gmail.com': ['eve@gmail.com'],
    'grace@gmail.com': ['eve@gmail.com', 'adam@gmail.com'],
  };
  
  const friendEmails = friendEmailsMap[userEmail] || [];
  
  return ALL_USERS
    .filter(user => user.email !== userEmail) // Don't list self
    .map(user => ({
      ...user,
      // Set the isFollowing status based on the dummy map
      isFollowing: friendEmails.includes(user.email) 
    }));
};

const getLeaderboard = (): Traveler[] => {
  // Sort all users by countries visited descending
  return [...ALL_USERS].sort((a, b) => b.countriesVisited - a.countriesVisited);
};

// NOTE: Since state is managed locally in the component, this function
// doesn't need to update a global state/DB for this example.
const toggleFollow = async (friendId: string) => {
  // Simulate an API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Toggled follow status for user: ${friendId}`);
  // In a real app, you would make a PUT/POST request here
};

// --- COMPONENT START ---

const Friends = () => {
  // Changed 'user' to 'currentUser' to match your AuthContext usage in other files
  const { currentUser } = useAuth(); 
  const [activeTab, setActiveTab] = useState<'friends' | 'leaderboard'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [leaderboard, setLeaderboard] = useState<Traveler[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    if (currentUser) {
      setFriends(getUserFriends(currentUser.email));
      setLeaderboard(getLeaderboard());
    } else {
      setFriends([]);
      setLeaderboard(getLeaderboard()); // Show global leaderboard even if not logged in?
    }
    setLoading(false);
  }, [currentUser]);

  const handleToggleFollow = async (friendId: string) => {
    await toggleFollow(friendId);
    setFriends(
      friends.map((f) =>
        f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f
      )
    );
    // Also update the leaderboard's follow status if the user is present there
    setLeaderboard(
      leaderboard.map((t) => 
        t.id === friendId ? { ...t, isFollowing: !t.isFollowing } : t
      )
    );
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery === ''
  );
  
  if (loading) {
    return <Layout><p className="p-8 text-gray-600">Loading community data...</p></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1d3557] mb-2">
            Travel Community 🌎
          </h1>
          <p className="text-gray-600">
            Connect with fellow travelers and see who's leading the way
          </p>
        </motion.div>

        {/* --- TABS --- */}
        <div className="mb-8 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold transition-all border-b-4 ${
              activeTab === 'friends'
                ? 'border-[#0077b6] text-[#0077b6]'
                : 'border-transparent text-gray-700 hover:text-[#0077b6]'
            }`}
          >
            <Users className="w-5 h-5" />
            My Friends ({friends.filter((f) => f.isFollowing).length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold transition-all border-b-4 ${
              activeTab === 'leaderboard'
                ? 'border-[#f77f00] text-[#f77f00]'
                : 'border-transparent text-gray-700 hover:text-[#f77f00]'
            }`}
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </div>

        {/* --- FRIENDS TAB CONTENT --- */}
        {activeTab === 'friends' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends by username..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.map((friend, index) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      // Dummy path. Replace this with a real image path or avatar logic.
                      src={friend.profilePic.includes('path/to') ? `https://i.pravatar.cc/150?img=${index + 1}` : friend.profilePic} 
                      alt={friend.username}
                      className="w-16 h-16 rounded-full object-cover border-4 border-[#0077b6]/20"
                    />

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#1d3557]">
                        {friend.username}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 text-[#0077b6]" />
                        <span>{friend.countriesVisited} countries visited</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleFollow(friend.id)}
                    className={`mt-auto px-4 py-2 rounded-lg font-medium transition-all w-full ${
                      friend.isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        : 'bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white hover:shadow-lg'
                    }`}
                  >
                    {friend.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </motion.div>
              ))}
            </div>

            {filteredFriends.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No friends found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or add new friends!
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* --- LEADERBOARD TAB CONTENT --- */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#f77f00] to-[#d62828] p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Top Travelers</h2>
              </div>
              <p className="text-white/90">
                See who's explored the most countries
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {leaderboard.map((traveler, index) => (
                  <motion.div
                    key={traveler.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      index < 3
                        ? 'bg-gradient-to-r from-[#f77f00]/10 to-[#f77f00]/5'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${
                        index === 0
                          ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white'
                          : index === 1
                          ? 'bg-gradient-to-br from-[#C0C0C0] to-[#808080] text-white'
                          : index === 2
                          ? 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513] text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <img
                      // Dummy path. Replace this with a real image path or avatar logic.
                      src={traveler.profilePic.includes('path/to') ? `https://i.pravatar.cc/150?img=${index + 10}` : traveler.profilePic} 
                      alt={traveler.username}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />

                    <div className="flex-1">
                      <h3 className="font-bold text-[#1d3557] mb-1">
                        {traveler.username}
                        {traveler.id === currentUser?.id && (
                          <span className="ml-2 text-xs bg-[#0077b6] text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{traveler.countriesVisited} countries visited</span>
                      </div>
                    </div>

                    {traveler.id !== currentUser?.id && (
                      <button
                        onClick={() => handleToggleFollow(traveler.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex-shrink-0 ${
                          // Check follow status in the 'friends' array, not the temporary traveler object
                          friends.find(f => f.id === traveler.id)?.isFollowing
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            : 'bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white hover:shadow-lg'
                        }`}
                      >
                        {friends.find(f => f.id === traveler.id)?.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Friends;
