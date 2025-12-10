// Updated frontend/src/pages/TripDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Calendar, Map, User, Trash2, ArrowLeft, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { getTripPhoto } from '../services/api';

interface Trip {
  _id: string;
  id?: string;
  user_id: string;
  user_email: string;
  username: string;
  country: string;
  place_name: string;
  description: string;
  photo_url?: string;
  thumbnail_url?: string;
  photo_filename?: string;
  photo_size?: number;
  created_at: string;
}

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchTrip = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/trips/${id}`);
        const tripData = data.trip || data;
        
        try {
          const photoResponse = await getTripPhoto(id);
          const photoBlob = new Blob([photoResponse.data], { type: 'image/jpeg' });
          const photoObjectUrl = URL.createObjectURL(photoBlob);
          setPhotoUrl(photoObjectUrl);
        } catch (photoError) {
          console.warn('Could not load photo from HDFS:', photoError);
          if (tripData.photo_url) {
            setPhotoUrl(tripData.photo_url);
          }
        }
        
        setTrip(tripData);
      } catch (error) {
        console.error('Failed to fetch trip:', error);
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [id]);

  const handleDelete = async () => {
    if (!trip || !currentUser || !window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    if (trip.user_id !== currentUser.id && trip.user_email !== currentUser.email) {
      alert('You can only delete your own trips');
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/trips/${id}`);
      alert('Trip deleted successfully');
      navigate('/trips');
    } catch (error: any) {
      console.error('Delete failed:', error);
      alert(error.response?.data?.detail || 'Failed to delete trip');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-xl">Loading trip details...</p>
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-gradient-to-br from-red-100 to-red-50 p-8 rounded-2xl text-center max-w-md">
            <Map className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Not Found</h2>
            <p className="text-gray-600 mb-6">The trip you're looking for doesn't exist or you don't have access to it.</p>
            <Link 
              to="/trips" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Trips
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwner = currentUser && (
    trip.user_id === currentUser.id || 
    trip.user_email === currentUser.email
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <Link 
              to="/trips" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6"
            >
              <ArrowLeft size={20} />
              Back to Trips
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {photoUrl ? (
              <div className="relative h-96 md:h-[500px]">
                <img
                  src={photoUrl}
                  alt={`${trip.place_name}, ${trip.country}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{trip.place_name}</h1>
                    <div className="flex items-center gap-2 text-lg">
                      <Globe className="w-5 h-5" />
                      <span>{trip.country}</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  HDFS Storage
                </div>
              </div>
            ) : (
              <div className="h-96 md:h-[500px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <Map className="w-20 h-20 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-2">{trip.place_name}</h1>
                  <p className="text-xl">{trip.country}</p>
                </div>
              </div>
            )}

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {trip.description}
                    </p>
                  </div>

                  {trip.photo_filename && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Photo Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Filename</p>
                          <p className="font-medium">{trip.photo_filename}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Size</p>
                          <p className="font-medium">{formatFileSize(trip.photo_size)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Storage</p>
                          <p className="font-medium text-green-600">HDFS Distributed Storage</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Upload Date</p>
                          <p className="font-medium">{formatDate(trip.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Trip Owner
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {trip.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{trip.username}</p>
                        <p className="text-sm text-gray-500">{trip.user_email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Trip Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Country</p>
                          <p className="font-medium">{trip.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Map className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Place</p>
                          <p className="font-medium">{trip.place_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-medium">{formatDate(trip.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
                      <p className="text-sm text-red-600 mb-4">
                        Deleting this trip will remove it from HDFS storage and cannot be undone.
                      </p>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={20} />
                            Delete Trip
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TripDetail;
