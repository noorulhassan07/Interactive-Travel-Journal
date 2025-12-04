import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Users, Trophy, Search, MapPin } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  email: string;
  profilePic?: string;
  countriesVisited: number;
  isFollowing: boolean;
}

const Friends = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'leaderboard'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [leaderboard, setLeaderboard] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;


    const fetchFriendsAndLeaderboard = async () => {
      try {
        const friendsData: Friend[] = await fetch(`/api/friends?email=${currentUser.email}`)
          .then(res => res.json());
        const leaderboardData: Friend[] = await fetch(`/api/leaderboard`)
          .then(res => res.json());

        setFriends(friendsData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error(err);
        setFriends([]);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsAndLeaderboard();
  }, [currentUser]);

  const handleToggleFollow = async (friendId: string) => {
    try {
      await fetch(`/api/follow/${friendId}`, { method: 'POST' }); // toggle follow on backend
      setFriends(prev => prev.map(f => f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f));
      setLeaderboard(prev => prev.map(f => f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Layout><p className="p-8 text-gray-600">Loading community data...</p></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#1d3557] mb-2">Travel Community 🌎</h1>
          <p className="text-gray-600">Connect with fellow travelers and see who's leading the way</p>
        </motion.div>

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
            My Friends ({friends.filter(f => f.isFollowing).length})
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

        {activeTab === 'friends' && (
          <div className="space-y-6">
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
                <div key={friend.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={friend.profilePic || `https://i.pravatar.cc/150?img=${index + 1}`}
                      alt={friend.username}
                      className="w-16 h-16 rounded-full object-cover border-4 border-[#0077b6]/20"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#1d3557]">{friend.username}</h3>
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
                </div>
              ))}
            </div>

            {filteredFriends.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No friends found</h3>
                <p className="text-gray-500">Try adjusting your search or add new friends!</p>
              </div>
            )}
          </div>
        )}


        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#f77f00] to-[#d62828] p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-8 h-8"/>Top Travelers</h2>
              <p className="text-white/90">See who's explored the most countries</p>
            </div>

            <div className="p-6 space-y-4">
              {leaderboard.map((traveler, index) => (
                <div key={traveler.id} className={`flex items-center gap-4 p-4 rounded-xl ${index < 3 ? 'bg-gradient-to-r from-[#f77f00]/10 to-[#f77f00]/5' : 'bg-gray-50'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${
                    index === 0 ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white'
                    : index === 1 ? 'bg-gradient-to-br from-[#C0C0C0] to-[#808080] text-white'
                    : index === 2 ? 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513] text-white'
                    : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <img src={traveler.profilePic || `https://i.pravatar.cc/150?img=${index+10}`} alt={traveler.username} className="w-14 h-14 rounded-full object-cover flex-shrink-0"/>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1d3557] mb-1">
                      {traveler.username}
                      {traveler.id === currentUser?.id && <span className="ml-2 text-xs bg-[#0077b6] text-white px-2 py-1 rounded-full">You</span>}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-500"/>
                      <span>{traveler.countriesVisited} countries visited</span>
                    </div>
                  </div>
                  {traveler.id !== currentUser?.id && (
                    <button
                      onClick={() => handleToggleFollow(traveler.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex-shrink-0 ${
                        friends.find(f => f.id === traveler.id)?.isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        : 'bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white hover:shadow-lg'
                      }`}
                    >
                      {friends.find(f => f.id === traveler.id)?.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Friends;
