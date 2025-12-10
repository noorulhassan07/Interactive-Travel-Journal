import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Users, Trophy, Search, MapPin } from "lucide-react";
import api from "../services/api";

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
  const [activeTab, setActiveTab] = useState<"friends" | "leaderboard">("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [leaderboard, setLeaderboard] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const email = currentUser.email;
        const token = localStorage.getItem("token");

        console.log("Fetching friends data for:", email);

        const [friendsRes, leaderboardRes] = await Promise.all([
          api.get(`/friends?email=${email}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/friends/leaderboard?user_id=${currentUser.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Friends response:", friendsRes.data);
        console.log("Leaderboard response:", leaderboardRes.data);

        setFriends(friendsRes.data || []);
        setLeaderboard(leaderboardRes.data || []);
      } catch (err) {
        console.error("Error fetching friends data:", err);
        setFriends([]);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setGlobalSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Searching for:", query);
      
      const res = await api.get(`/friends/search?username=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Search results:", res.data);
      setGlobalSearchResults(res.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setGlobalSearchResults([]);
    }
  };

  const handleToggleFollow = async (friendId: string) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Toggling follow for:", friendId, "user:", currentUser?.id);

      await api.post(
        `/friends/follow/${friendId}?user_id=${currentUser?.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updateFollowingStatus = (list: Friend[]) =>
        list.map((f) =>
          f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f
        );

      setFriends(updateFollowingStatus);
      setLeaderboard(updateFollowingStatus);
      setGlobalSearchResults(updateFollowingStatus);

      alert("Follow status updated!");
    } catch (err: any) {
      console.error("Follow error:", err);
      alert(err.response?.data?.detail || "Failed to update follow status");
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading community data...</p>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1d3557] mb-2">
            Travel Community 
          </h1>
          <p className="text-gray-600">
            Connect with fellow travelers and see who's leading the way
          </p>
        </motion.div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
            <p>User ID: {currentUser?.id}</p>
            <p>Friends count: {friends.length}</p>
            <p>Following: {friends.filter(f => f.isFollowing).length}</p>
          </div>
        )}

        <div className="mb-8 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold transition-all border-b-4 ${
              activeTab === "friends"
                ? "border-[#0077b6] text-[#0077b6]"
                : "border-transparent text-gray-700 hover:text-[#0077b6]"
            }`}
          >
            <Users className="w-5 h-5" />
            My Friends ({friends.filter((f) => f.isFollowing).length})
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold transition-all border-b-4 ${
              activeTab === "leaderboard"
                ? "border-[#f77f00] text-[#f77f00]"
                : "border-transparent text-gray-700 hover:text-[#f77f00]"
            }`}
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </div>

        {activeTab === "friends" && (
          <div className="space-y-6">
   
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search any user by username..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
                />
              </div>

              {globalSearchResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Search Results ({globalSearchResults.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {globalSearchResults.map((user) => (
                      <div
                        key={user.id}
                        className="bg-gray-50 rounded-xl shadow p-4"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#0077b6] flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[#1d3557]">
                              {user.username}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="w-4 h-4 text-[#0077b6]" />
                              <span>{user.countriesVisited} countries</span>
                            </div>
                          </div>
                        </div>

                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleToggleFollow(user.id)}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                              user.isFollowing
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                                : "bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white hover:from-[#023e8a] hover:to-[#0077b6]"
                            }`}
                          >
                            {user.isFollowing ? "Following" : "Follow"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && globalSearchResults.length === 0 && (
                <p className="mt-4 text-gray-500 text-center">
                  No users found matching "{searchQuery}"
                </p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1d3557] mb-4">
                People You Follow ({friends.filter(f => f.isFollowing).length})
              </h3>
              
              {friends.filter(f => f.isFollowing).length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">You're not following anyone yet</p>
                  <p className="text-gray-500 text-sm">
                    Search for users above and click "Follow" to add them to your friends
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends
                    .filter((f) => f.isFollowing)
                    .map((friend) => (
                      <div
                        key={friend.id}
                        className="bg-white rounded-xl shadow-lg p-6"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0077b6] to-[#023e8a] flex items-center justify-center text-white font-bold text-2xl">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[#1d3557]">
                              {friend.username}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="w-4 h-4 text-[#0077b6]" />
                              <span>{friend.countriesVisited} countries</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleFollow(friend.id)}
                          className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg border border-red-200 font-medium transition-colors"
                        >
                          Unfollow
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "leaderboard" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#f77f00] to-[#d62828] p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                Top Travelers
              </h2>
              <p className="text-white/80 mt-1">Ranked by countries visited</p>
            </div>

            <div className="p-6 space-y-4">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No leaderboard data available
                </div>
              ) : (
                leaderboard.map((traveler, index) => (
                  <div
                    key={traveler.id}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      index < 3
                        ? "bg-gradient-to-r from-[#f77f00]/10 to-[#f77f00]/5 border border-[#f77f00]/20"
                        : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0
                          ? "bg-yellow-400 text-white"
                          : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                          ? "bg-amber-700 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0077b6] to-[#023e8a] flex items-center justify-center text-white font-bold text-xl">
                      {traveler.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#1d3557]">
                          {traveler.username}
                        </h3>
                        {traveler.id === currentUser?.id && (
                          <span className="text-xs bg-[#0077b6] text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{traveler.countriesVisited} countries</span>
                      </div>
                    </div>

                    {traveler.id !== currentUser?.id && (
                      <button
                        onClick={() => handleToggleFollow(traveler.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm min-w-[100px] ${
                          traveler.isFollowing
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            : "bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white hover:from-[#023e8a] hover:to-[#0077b6]"
                        }`}
                      >
                        {traveler.isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Friends;
