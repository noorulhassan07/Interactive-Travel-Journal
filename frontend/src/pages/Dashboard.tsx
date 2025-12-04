import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import { Map, Heart, Award, Users, Plus, Calendar } from "lucide-react";
import api from "../services/api";

// ----------------------
// ✅ TypeScript Interfaces
// ----------------------
interface Trip {
  id: number;
  name: string;
  description: string;
  start_date?: string;
  end_date?: string;
}

interface DashboardStats {
  trips_count: number;
  countries_visited: number;
  followers_count: number;
}

interface WishlistItem {
  id: number;
  city: string;
  country: string;
  notes: string;
}

const Dashboard = () => {
  const { currentUser } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const email = currentUser.email;

        const [tripsRes, statsRes, wishlistRes] = await Promise.all([
          api.get(`/trips?email=${email}`),
          api.get(`/users/${email}/stats`),
          api.get(`/wishlist?email=${email}`),
        ]);

        setTrips(tripsRes.data);
        setStats(statsRes.data);
        setWishlist(wishlistRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <h2 className="text-2xl text-gray-600">Loading...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
 
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-gray-600">Ready for your next adventure?</p>
          </div>

          <Link to="/trips/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2"
            >
              <Plus size={20} />
              New Trip
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div className="bg-white rounded-2xl p-6 shadow-lg">
            <Map size={24} className="text-[#0077b6] mb-4" />
            <h3 className="text-3xl font-bold">{stats?.trips_count}</h3>
            <p className="text-gray-600">Total Trips</p>
          </motion.div>

          <motion.div className="bg-white rounded-2xl p-6 shadow-lg">
            <Award size={24} className="text-[#90be6d] mb-4" />
            <h3 className="text-3xl font-bold">{stats?.countries_visited}</h3>
            <p className="text-gray-600">Countries Visited</p>
          </motion.div>

          <motion.div className="bg-white rounded-2xl p-6 shadow-lg">
            <Users size={24} className="text-[#f77f00] mb-4" />
            <h3 className="text-3xl font-bold">{stats?.followers_count}</h3>
            <p className="text-gray-600">Followers</p>
          </motion.div>

          <motion.div className="bg-white rounded-2xl p-6 shadow-lg">
            <Heart size={24} className="text-[#d62828] mb-4" />
            <h3 className="text-3xl font-bold">{wishlist.length}</h3>
            <p className="text-gray-600">Wishlist Items</p>
          </motion.div>
        </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Trips</h2>
              <Link
                to="/trips"
                className="text-[#0077b6] font-semibold hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {trips.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                  <Map size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">No trips yet</p>
                  <Link to="/trips/new">
                    <button className="bg-[#0077b6] text-white px-6 py-2 rounded-lg">
                      Create Trip
                    </button>
                  </Link>
                </div>
              ) : (
                trips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Link to={`/trips/${trip.id}`}>
                      <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#0077b6]">
                        <h3 className="text-xl font-bold">{trip.name}</h3>
                        <p className="text-gray-600">{trip.description}</p>

                        {trip.start_date && (
                          <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
                            <Calendar size={16} />
                            <span>
                              {new Date(trip.start_date).toLocaleDateString()}
                            </span>
                            {trip.end_date && (
                              <>
                                <span>-</span>
                                <span>
                                  {new Date(trip.end_date).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Travel Wishlist</h2>
              <Link
                to="/wishlist"
                className="text-[#0077b6] font-semibold hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {wishlist.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                  <Heart size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">No wishlist items yet</p>
                  <Link to="/wishlist">
                    <button className="bg-[#f77f00] text-white px-6 py-2 rounded-lg">
                      Add Destination
                    </button>
                  </Link>
                </div>
              ) : (
                wishlist.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border-r-4 border-[#f77f00]"
                  >
                    <h3 className="text-xl font-bold">
                      {item.city}, {item.country}
                    </h3>
                    <p className="text-gray-600">{item.notes}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
