// frontend/src/pages/Friends.tsx
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
  const [activeTab, setActiveTab] = useState<"friends" | "leaderboard">(
    "friends"
  );
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

        const [friendsRes, leaderboardRes] = await Promise.all([
          api.get(`/friends?email=${email}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/leaderboard?user_id=${currentUser.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setFriends(friendsRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (err) {
        console.error(err);
        setFriends([]);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // 🔍 GLOBAL SEARCH (search any username)
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setGlobalSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/search-users?username=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGlobalSearchResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleToggleFollow = async (friendId: string) => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        `/follow/${friendId}?follower_id=${currentUser?.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update friends list
      setFriends((prev) =>
        prev.map((f) =>
          f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f
        )
      );

      // Update leaderboard
      setLeaderboard((prev) =>
        prev.map((f) =>
          f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f
        )
      );

      // Update global search results
      setGlobalSearchResults((prev) =>
        prev.map((f) =>
          f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <Layout>
        <p className="p-8 text-gray-600">Loading community data...</p>
      </Layout>
    );

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

        {/* Tabs */}
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

        {/* FRIENDS TAB */}
        {activeTab === "friends" && (
          <div className="space-y-6">
            {/* Search Bar */}
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

              {/* Global Search Results */}
              {globalSearchResults.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {globalSearchResults.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white rounded-xl shadow-lg p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={user.profilePic || "/default-profile.png"}
                          alt={user.username}
                          className="w-16 h-16 rounded-full object-cover border-4 border-[#0077b6]/20"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-[#1d3557]">
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
                              : "bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white"
                          }`}
                        >
                          {user.isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* YOUR FOLLOWING LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends
                .filter((f) => f.isFollowing)
                .map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={friend.profilePic || "/default-profile.png"}
                        alt={friend.username}
                        className="w-16 h-16 rounded-full object-cover border-4 border-[#0077b6]/20"
                      />
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
                      className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300"
                    >
                      Unfollow
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#f77f00] to-[#d62828] p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                Top Travelers
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {leaderboard.map((traveler, index) => (
                <div
                  key={traveler.id}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    index < 3
                      ? "bg-gradient-to-r from-[#f77f00]/10 to-[#f77f00]/5"
                      : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
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

                  <img
                    src={traveler.profilePic || "/default-profile.png"}
                    className="w-14 h-14 rounded-full object-cover"
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
                      <span>{traveler.countriesVisited} countries</span>
                    </div>
                  </div>

                  {traveler.id !== currentUser?.id && (
                    <button
                      onClick={() => handleToggleFollow(traveler.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        traveler.isFollowing
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                          : "bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white"
                      }`}
                    >
                      {traveler.isFollowing ? "Following" : "Follow"}
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
