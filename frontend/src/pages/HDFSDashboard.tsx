// frontend/src/pages/HDFSDashboard.tsx (Optional)
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Database, HardDrive, Upload, Download, BarChart3, Users } from 'lucide-react';
import api from '../services/api';

interface HDFSStats {
  status: string;
  hdfs_capacity: number;
  hdfs_used: number;
  hdfs_remaining: number;
  photos_count: number;
  total_photo_size: number;
  base_path: string;
}

const HDFSDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<HDFSStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.isAdmin) return;

    const fetchStats = async () => {
      try {
        const response = await api.get('/trips/hdfs/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch HDFS stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  if (!currentUser?.isAdmin) {
    return (
      <Layout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Access Required</h2>
          <p>You need administrator privileges to access the HDFS dashboard.</p>
        </div>
      </Layout>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculatePercentage = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">HDFS Storage Dashboard</h1>
          <p className="text-gray-600">Monitor your Hadoop Distributed File System storage</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading HDFS statistics...</p>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Status Card */}
            <div className={`rounded-xl p-6 ${stats.status === 'connected' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stats.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-semibold">HDFS Status: {stats.status.toUpperCase()}</span>
                </div>
                <span className="text-sm text-gray-500">{stats.base_path}</span>
              </div>
            </div>

            {/* Storage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <HardDrive className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-semibold">Total Capacity</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatBytes(stats.hdfs_capacity)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-semibold">Used Storage</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatBytes(stats.hdfs_used)}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {calculatePercentage(stats.hdfs_used, stats.hdfs_capacity)}% of total
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-8 h-8 text-purple-600" />
                  <h3 className="text-lg font-semibold">Available</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatBytes(stats.hdfs_remaining)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-8 h-8 text-orange-600" />
                  <h3 className="text-lg font-semibold">Travel Photos</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.photos_count.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-2">{formatBytes(stats.total_photo_size)} total</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Storage Usage</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used: {formatBytes(stats.hdfs_used)}</span>
                  <span>{calculatePercentage(stats.hdfs_used, stats.hdfs_capacity)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercentage(stats.hdfs_used, stats.hdfs_capacity)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Free: {formatBytes(stats.hdfs_remaining)}</span>
                  <span>Total: {formatBytes(stats.hdfs_capacity)}</span>
                </div>
              </div>
            </div>

            {/* Photo Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Photo Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{stats.photos_count}</p>
                  <p className="text-gray-600">Total Photos</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{formatBytes(stats.total_photo_size)}</p>
                  <p className="text-gray-600">Total Size</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">
                    {stats.photos_count > 0 ? formatBytes(stats.total_photo_size / stats.photos_count) : '0 Bytes'}
                  </p>
                  <p className="text-gray-600">Average Size</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Unable to connect to HDFS</h3>
            <p className="text-gray-600">Please check if HDFS services are running.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HDFSDashboard;
