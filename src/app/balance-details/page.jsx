'use client'
import WebsiteLayout from "@/components/WebsiteLayout";
import { FaRegCopy } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function Home() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 mb-5 text-center text-xl font-bold shadow-lg">
                Grab
            </div>
            <div className="min-h-screen bg-gray-100 my-8 md:my-12 lg:my-16 px-4 sm:px-6 md:px-8 lg:px-20">
                {/* Header */}
                <div className=" bg-white p-6 sm:p-8 shadow-lg rounded-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-md font-extrabold text-gray-900">{userData.name}</p>
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

                    <button className="w-full bg-primary my-5  py-2 md:py-5 rounded-xl text-white" onClick={() => {
                        router.push("/grab")
                    }}>
                        Auto Grab

                    </button>
                </div>
            </div>
        </WebsiteLayout>
    );
}
