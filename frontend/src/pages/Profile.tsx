import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Heart, Award, Calendar } from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
  contactNumber: string;
  trips: number;
  badges: number;
  favoritePlaces: string[];
  address: string;
  image?: string;
}

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      try {
        const data: UserProfile = await fetch(`/api/users/${currentUser.id}`).then(res => res.json());
        setProfile(data);
      } catch (err) {
        console.error(err);
        setProfile(null);
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (!profile) return <Layout><p className="p-8 text-gray-600">Profile not found.</p></Layout>;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{profile.fullName}</h2>
            <span className="text-gray-500 text-sm">{profile.email}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2"><Calendar size={20} className="text-[#0077b6]" /><span><strong>Trips:</strong> {profile.trips}</span></div>
            <div className="flex items-center gap-2"><Award size={20} className="text-[#f77f00]" /><span><strong>Badges:</strong> {profile.badges}</span></div>
            <div className="flex items-center gap-2"><Heart size={20} className="text-[#d62828]" /><span><strong>Favorite Places:</strong> {profile.favoritePlaces.join(', ')}</span></div>
            <div className="flex items-center gap-2"><MapPin size={20} className="text-[#90be6d]" /><span><strong>Address:</strong> {profile.address}</span></div>
            <div className="flex items-center gap-2"><span className="text-[#0077b6] font-bold">Contact:</span><span>{profile.contactNumber}</span></div>
          </div>

          {profile.image && (
            <div className='w-32 h-32 md:w-40 md:h-40 flex-shrink-0'>
              <img src={profile.image} alt={`${profile.fullName} avatar`} className="w-full h-full object-cover rounded-full shadow-lg" />
            </div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
};

export default Profile;
