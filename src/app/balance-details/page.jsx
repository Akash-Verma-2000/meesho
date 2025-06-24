'use client'
import WebsiteLayout from "@/components/WebsiteLayout";
import { FaRegCopy } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { HiSpeakerWave } from "react-icons/hi2";
import { IoMdCart } from "react-icons/io";


export default function Home() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Add for random names and amounts ---
    const indianNames = [
        'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
        'Shaurya', 'Atharv', 'Dhruv', 'Kabir', 'Ritvik', 'Aarush', 'Aryan', 'Ansh', 'Om', 'Laksh',
        'Advait', 'Pranav', 'Rudra', 'Yuvaan', 'Arnav', 'Samarth', 'Parth', 'Divit', 'Ayan', 'Veer',
        'Harsh', 'Rohan', 'Kartik', 'Manav', 'Dev', 'Tanish', 'Aaditya', 'Aadi', 'Aarav', 'Aarush',
        'Aaryan', 'Abhay', 'Abhinav', 'Advaith', 'Agastya', 'Ajay', 'Akash', 'Akhil', 'Alok', 'Aman',
        'Ameya', 'Aniket', 'Anirudh', 'Anish', 'Ankit', 'Anmol', 'Anshul', 'Anuj', 'Anup', 'Anurag',
        'Arav', 'Arhaan', 'Arin', 'Arnav', 'Arush', 'Aryan', 'Ashwin', 'Atul', 'Ayansh', 'Ayush',
        'Bhavesh', 'Chaitanya', 'Daksh', 'Darsh', 'Deep', 'Devansh', 'Dhanush', 'Dheeraj', 'Gaurav', 'Girish',
        'Harshad', 'Hriday', 'Ishan', 'Jatin', 'Jay', 'Jeet', 'Kairav', 'Karan', 'Karthik', 'Kavin',
        'Keshav', 'Krish', 'Kunal', 'Madhav', 'Manan', 'Mayank', 'Mihir', 'Naksh', 'Neil', 'Nikhil'
    ];
    const amounts = [100.67, 150.65, 200.5, 250.67, 300.78, 350.76, 400.54, 450.55, 500.76, 600.12, 700.34, 800.65, 900.78, 1000, 1200, 1500, 1800, 2000, 2500.78, 3000.65];
    const [currentName, setCurrentName] = useState('Akash');
    const [currentAmount, setCurrentAmount] = useState(250);
    const intervalRef = useRef();



    useEffect(() => {
        intervalRef.current = setInterval(() => {
            const name = indianNames[Math.floor(Math.random() * indianNames.length)];
            const amount = amounts[Math.floor(Math.random() * amounts.length)];
            setCurrentName(name);
            setCurrentAmount(amount);
        }, 2000);
        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

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

                    <div className="bg-primary p-3 -m-6 sm:-m-8">

                        <div className="flex text-white items-center gap-2">

                            <span className="text-5xl"> <IoMdCart /> </span>
                            <div>

                                <p className="text-white text-lg ">
                                    <span>AMAZON Flagship store</span>
                                </p>
                                <p className="text-gray-200 text-sm">
                                    Commission 30.00%
                                </p>
                            </div>
                        </div>

                    </div>

                    <div className="relative z-10 mt-14">
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

                <p className='text-gray-500 text-sm my-5 flex gap-2 items-center'>
                    <HiSpeakerWave />  {currentName + '****'} has grabbed ₹{currentAmount}.00
                </p>

                <p className='text-gray-500 text-sm my-5'>
                    Note:-
                    When you click auto grab, the mall will automatically issue an order task you need to complete the payment for the order. The order task needs to be completed within 60 minutes. After grabbing the order please complete the task as soon as possible. If you have any questions, please contact support service.
                </p>
            </div>
        </WebsiteLayout>
    );
}
