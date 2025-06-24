'use client'
import HeroSection from "@/components/HeroSection";
import WebsiteLayout from "@/components/WebsiteLayout";
import { FaMoneyBillWave, FaWallet, FaRegBell, FaRegSmile } from 'react-icons/fa';
import { FaRegCopy } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import SampleWinnerSlider from "@/components/WinnerSampleSlider";

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const partnerLogos = ["/images/Bank1.png", "/images/Bank2.png", "/images/Bank3.png", "/images/Bank4.png", "/images/Bank5.png", "/images/Bank6.png", "/images/Bank7.jpg", "/images/Bank8.png", "/images/Bank9.png", "/images/Bank10.png", "/images/Bank11.jpeg", "/images/Bank12.png", "/images/Bank13.jpg", "/images/Bank14.jpg", "/images/Bank15.jpg", "/images/Bank16.jpg", "/images/Bank17.png", "/images/Bank18.jpg", "/images/Bank19.jpg", "/images/Bank20.jpg",];

  useEffect(() => {
    const fetchDashboardData = async (token) => {
      try {
        const res = await fetch('/api/user/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.status === 'success') {
          setDashboardData(data.data);
        } else {
          setError(data.message || 'Failed to fetch dashboard data.');
          toast.error(data.message || 'Failed to fetch dashboard data.', { position: "top-right" });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('An unexpected error occurred while fetching dashboard data.');
        toast.error('An unexpected error occurred while fetching dashboard data.', { position: "top-right" });
      }
    };

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
          fetchDashboardData(token);
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
      <div className="bg-primary p-2">
        <h1 className="text-white font-semibold text-3xl text-center">Jio</h1>
      </div>
      <HeroSection />
      <section className="my-8 md:my-12 px-4 sm:px-6 md:px-8 lg:px-20">

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">

          {/* Recharge Section */}
          <Link href="/recharge" className="flex items-center justify-center gap-2 py-3 md:py-5 bg-blue-600 cursor-pointer text-white px-4 rounded-lg hover:bg-blue-700 text-center">
            <FaMoneyBillWave className="text-white" />
            <span className="font-semibold !text-md">Recharge</span>
          </Link>

          {/* Withdrawal Section */}
          <Link href="/withdraw" className="flex items-center justify-center gap-2 py-3 md:py-5 bg-green-600 cursor-pointer text-white px-4 rounded-lg hover:bg-green-700 text-center">
            <FaWallet className="text-white" />
            <span className="font-semibold  !text-md">Withdraw</span>
          </Link>

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
                <p className="text-lg font-bold text-gray-900">₹{userData.balance.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-700 text-sm sm:text-base mb-1">Total Commission</p>
                <p className="text-lg font-bold text-gray-900">₹{dashboardData?.totalEarnings?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-gray-700 text-xs sm:text-sm mb-1">Frozen Balance</p>
                <p className="text-sm text-gray-800 font-medium mb-4">₹{userData?.frozenBalance?.toFixed(2) || '0.00'}</p>
                <p className="text-gray-700 text-xs sm:text-sm mb-1">Today Recharge</p>
                <p className="text-sm text-gray-800 font-medium">₹{dashboardData?.totalRecharge?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-700 text-xs sm:text-sm mb-1">Total Withdrawal</p>
                <p className="text-sm text-gray-800 font-medium">₹{dashboardData?.totalWithdrawals?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SampleWinnerSlider />

      <section className="my-8 md:my-12 px-4 sm:px-6 md:px-8 lg:px-20">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">

          <Link href="/notice" className="flex items-center justify-center gap-2 py-3 md:py-5  bg-white cursor-pointer text-black px-4 rounded-lg  text-center">
            <FaRegBell className="text-primary text-2xl" />
            <span className="font-semibold text-lg">Notice</span>
          </Link>

          <Link href="/welcome" className="flex items-center justify-center gap-2 py-3 md:py-5 bg-white  cursor-pointer text-black px-4 rounded-lg  text-center">
            <FaRegSmile className="text-primary text-2xl" />
            <span className="font-semibold text-lg">Welcome</span>
          </Link>

        </div>
      </section>


      <section className="my-8 md:my-12 lg:my-16 px-4 sm:px-6 md:px-8 lg:px-20">
        <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-10">Our Valued Partners</h2>
        <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 lg:gap-5">
          {partnerLogos.map((src, index) => (
            <div
              key={index}
              className="bg-white p-2 rounded-3xl shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center border border-gray-200"
            >
              <Image
                src={src}
                alt={`Partner Logo ${index + 1}`}
                width={1920}
                height={1920}
              // objectFit="contain"
              />
            </div>
          ))}
        </div>
      </section>

    </WebsiteLayout>
  );
}
