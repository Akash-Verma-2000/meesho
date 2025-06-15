'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { FaUserCircle, FaIdCard, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
          toast.error('No authentication token found. Please log in.', { position: "top-right" });
          router.push('/login');
          return;
        }

        const res = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.status === 'success') {
          setUserData(data.data);
        } else {
          setError(data.message || 'Failed to fetch user profile.');
          toast.error(data.message || 'Failed to fetch user profile.', { position: "top-right" });
          if (res.status === 401) {
            sessionStorage.removeItem('jwtToken');
            router.push('/login');
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('An unexpected error occurred while fetching profile.');
        toast.error('An unexpected error occurred while fetching profile.', { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return (
      <WebsiteLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p>Loading user data...</p>
        </div>
      </WebsiteLayout>
    );
  }

  if (error) {
    return (
      <WebsiteLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </WebsiteLayout>
    );
  }

  if (!userData) {
    return (
      <WebsiteLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p>No user data available. Please log in.</p>
        </div>
      </WebsiteLayout>
    );
  }

  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
          Profile Information
        </div>

        {/* Profile Content */}
        <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Profile Icon */}
            <div className="flex justify-center mb-6">
              <FaUserCircle className="text-8xl text-blue-400" />
            </div>

            {/* User Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaIdCard className="text-blue-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-semibold text-gray-800">{userData.userId}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaUserCircle className="text-blue-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">User Name</p>
                  <p className="font-semibold text-gray-800">{userData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaEnvelope className="text-blue-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaPhone className="text-blue-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-800">{userData.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}