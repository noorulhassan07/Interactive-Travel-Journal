import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import getUserWishlist from '../services/api';

interface WishlistItem {
  id: string;
  city: string;
  country: string;
  notes?: string;
  priority: number;
}

const Wishlist = () => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadWishlist = async () => {
      try {
        const { data } = await getUserWishlist(currentUser.email);
        setWishlist(data);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [currentUser]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full text-2xl text-gray-600">
          Loading wishlist...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">My Wishlist</h1>
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Heart size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No destinations in your wishlist yet</p>
            <Link to="/trips/new">
              <button className="bg-[#f77f00] text-white px-8 py-3 rounded-lg hover:bg-[#d62828] transition-colors font-semibold">
                Add Destinations
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#f77f00]"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {item.city}, {item.country}
                </h3>
                {item.notes && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.notes}</p>}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-lg ${i < item.priority ? 'text-[#f77f00]' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Wishlist;
