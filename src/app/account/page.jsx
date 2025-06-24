'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { FaUserCircle, FaWallet, FaClipboardList, FaFileAlt, FaLock, FaAddressBook, FaUserFriends, FaClipboardCheck, FaQuestionCircle, FaLanguage, FaSignOutAlt, FaRegCopy, FaChevronRight, FaTimes, FaMoneyBillWave, FaMoneyCheckAlt } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('jwtToken');
    console.log("Token removed, redirecting...");
    router.push('/login');
  };

  const handleCopyLink = () => {
    if (userData && userData.userId) {
      const baseUrl = window.location.origin;
      const referralLink = `${baseUrl}/register?sponsorId=${userData.userId}`;
      navigator.clipboard.writeText(referralLink)
        .then(() => {
          toast.success('Referral link copied to clipboard!', { position: "top-right" });
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast.error('Failed to copy link. Please try again.', { position: "top-right" });
        });
    } else {
      toast.error('User ID not available to generate referral link.', { position: "top-right" });
    }
  };

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
          Account Detail
        </div>

        {/* User Info Section */}
        <div className="bg-white p-5 flex items-center justify-between shadow-lg mb-4 rounded-b-xl">
          <div className="flex items-center gap-3">
            <FaUserCircle className="text-6xl text-blue-400" />
            <div>
              <p className="font-extrabold text-xl text-gray-900">{userData.name}</p>
              <p className="text-sm text-gray-600">User ID: <span className="font-medium">{userData.userId}</span></p>
            </div>
          </div>
          <button
            className="text-blue-600 text-sm py-1 px-3 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200 flex items-center gap-1"
            onClick={handleCopyLink}
          >
            Copy link <FaRegCopy className="text-xs" />
          </button>
        </div>

        {/* Balance Section */}
        <div className="bg-white p-5 lg:p-10 mx-5 md:mx-10 lg:mx-20 rounded-xl shadow-lg mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-extrabold text-gray-900">₹{userData.balance.toFixed(2)}</p>
            <Link href="/withdraw" className="bg-blue-600 text-white text-sm py-1 px-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
              Withdrawal
            </Link>
          </div>
          <p className="text-base text-gray-600">Balance</p>
        </div>

        {/* Navigation List */}
        <div className="bg-white mx-5 md:mx-10 lg:mx-20 rounded-xl shadow-lg overflow-hidden">
          {[
            { icon: FaUserCircle, label: 'Profile', href: '/profile' },
            { icon: FaMoneyCheckAlt, label: 'Bank Details', href: '/bank-details' },
            { icon: FaMoneyBillWave, label: 'Recharge Record', href: '/recharge-record' },
            { icon: FaWallet, label: 'Withdrawal Record', href: '/withdrawal-record' },
            { icon: FaClipboardCheck, label: 'Commission Record', href: '/commissions' },
            { icon: FaAddressBook, label: 'Address', href: '/address' },
            { icon: FaLock, label: 'Security', href: '/security' },
            { icon: FaQuestionCircle, label: 'About Us', href: '/about-us' },
            { icon: FaSignOutAlt, label: 'Logout', onClick: handleLogout }
          ].map((item, index) => (
            <Link
              key={index}
              href={item.href || '#'}
              onClick={item.onClick ? (e) => item.onClick(e) : (() => { })}
              className="cursor-pointer flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <item.icon className={`text-xl ${item.label === 'Logout' ? 'text-red-500' : 'text-gray-600'}`} />
                <span className={`text-base ${item.label === 'Logout' ? 'text-red-500' : 'text-gray-800'}`}>{item.label}</span>
              </div>
              <FaChevronRight className="text-gray-400 text-sm" />
            </Link>
          ))}
        </div>
      </div>
    </WebsiteLayout>
  );
}
