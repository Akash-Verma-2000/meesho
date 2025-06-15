'use client'
import HeroSection from "@/components/HeroSection";
import WebsiteLayout from "@/components/WebsiteLayout";
import { FaMoneyBillWave, FaWallet } from 'react-icons/fa';
import { FaRegCopy } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const partnerLogos = Array(6).fill("/images/Brand-Image.jpg");

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

  if (loading) {
    return (
      <WebsiteLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading user data...</p>
        </div>
      </WebsiteLayout>
    );
  }

  if (error) {
    return (
      <WebsiteLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </WebsiteLayout>
    );
  }

  if (!userData) {
    return (
      <WebsiteLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>No user data available. Please log in.</p>
        </div>
      </WebsiteLayout>
    );
  }

  return (
    <WebsiteLayout>
      <HeroSection />
      <section className="my-8 md:my-12 lg:my-16 px-4 sm:px-6 md:px-8 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Recharge Section */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <FaMoneyBillWave className="text-blue-600 text-xl sm:text-2xl" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Recharge</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Add funds to your account instantly with our secure recharge options.
            </p>
            <Link href="/recharge" className="bg-blue-600 cursor-pointer text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 w-full text-sm sm:text-base text-center">
              Recharge Now
            </Link>
          </div>

          {/* Withdrawal Section */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <FaWallet className="text-green-600 text-xl sm:text-2xl" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Withdrawal</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Withdraw your funds securely to your preferred payment method.
            </p>
            <Link href="/withdraw" className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 w-full text-sm sm:text-base text-center">
              Withdraw Now
            </Link>
          </div>
        </div>
      </section>

      <section className="my-8 md:my-12 lg:my-16 px-4 sm:px-6 md:px-8 lg:px-20">
        <div className=" bg-white p-6 sm:p-8 shadow-lg rounded-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{userData.name}</p>
              <div className="flex items-center gap-3">
                <span className="text-gray-700 text-base sm:text-lg font-medium">{userData.userId}</span>
                <FaRegCopy 
                  className="text-gray-600 cursor-pointer text-lg hover:text-blue-600 transition-colors duration-200"
                  onClick={handleCopyLink}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div>
                <p className="text-gray-700 text-sm sm:text-base mb-1">Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">₹{userData.balance.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-700 text-sm sm:text-base mb-1">Total Commission</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">₹100.00</p>
              </div>
              <div>
                <p className="text-gray-700 text-xs sm:text-sm mb-1">Today Earnings</p>
                <p className="text-base sm:text-lg text-gray-800 font-medium">₹0.00</p>
              </div>
              <div className="text-right">
                <p className="text-gray-700 text-xs sm:text-sm mb-1">Today's Withdrawal</p>
                <p className="text-base sm:text-lg text-gray-800 font-medium">₹0.00</p>
              </div>
              <div>
                <p className="text-gray-700 text-xs sm:text-sm mb-1">Yesterday's Earnings</p>
                <p className="text-base sm:text-lg text-gray-800 font-medium">₹0.00</p>
              </div>
              <div className="text-right">
                <p className="text-gray-700 text-xs sm:text-sm mb-1">Yesterday's withdrawal</p>
                <p className="text-base sm:text-lg text-gray-800 font-medium">₹0.00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="my-8 md:my-12 lg:my-16 px-4 sm:px-6 md:px-8 lg:px-20">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900 mb-10">Our Valued Partners</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 sm:gap-8">
          {partnerLogos.map((src, index) => (
            <div
              key={index}
              className="bg-white p-2 sm:p-2 rounded-3xl shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center h-32 sm:h-40 border border-gray-200"
            >
              <Image
                src={src}
                alt={`Partner Logo ${index + 1}`}
                width={200}
                height={100}
              // objectFit="contain"
              />
            </div>
          ))}
        </div>
      </section>

    </WebsiteLayout>
  );
}
