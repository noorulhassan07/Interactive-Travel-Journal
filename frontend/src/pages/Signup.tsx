import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext'; // Ensure this path matches your project
import { Plane, Globe, Camera } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [travelStyle, setTravelStyle] = useState('Explorer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const travelStyles = ['Explorer', 'Adventure', 'Luxury', 'Budget', 'Cultural', 'Beach Lover', 'Foodie', 'Backpacker'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(username, email, password, travelStyle); // dummy signup
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f77f00] via-[#d62828] to-[#0077b6] relative overflow-hidden py-12">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-20 animate-float">
          <Camera size={70} className="text-white" />
        </div>
        <div className="absolute bottom-10 right-10 animate-float-delayed">
          <Globe size={120} className="text-white" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float">
          <Plane size={80} className="text-white transform -rotate-12" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative z-10 m-4"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block p-4 bg-gradient-to-r from-[#f77f00] to-[#0077b6] rounded-full mb-4"
          >
            <Globe size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Start Your Journey</h1>
          <p className="text-gray-600">Create your travel journal account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0077b6] focus:outline-none transition-colors"
              placeholder="traveler123"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0077b6] focus:outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0077b6] focus:outline-none transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0077b6] focus:outline-none transition-colors"
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Style</label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0077b6] focus:outline-none transition-colors"
            >
              {travelStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#f77f00] to-[#d62828] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0077b6] font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Signup;
