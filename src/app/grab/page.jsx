'use client';

import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import { HiSpeakerWave } from "react-icons/hi2";

export default function GrabPage() {
    const router = useRouter();
    const [loadingProfile, setLoadingProfile]=useState(false);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInsufficientBalancePopup, setShowInsufficientBalancePopup] = useState(false);
    const [notice, setNotice] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const [timer, setTimer] = useState('60:00');
    const timerIntervalRef = useRef();

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
        fetchNextOrder();
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

    // Fetch user profile to get lastOrderGrabbedAt
    useEffect(() => {
        setLoadingProfile(true);

        const fetchUserProfile = async () => {
            try {
                const token = sessionStorage.getItem('jwtToken');
                if (!token) return;
                const res = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setUserProfile(data.data);
                }
            } catch (err) {
                // ignore
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchUserProfile();
    }, [setOrder, order]);

    // Timer logic
    useEffect(() => {
        if (!userProfile || !userProfile.lastOrderGrabbedAt) {
            setTimer('60:00');
            return;
        }
        function updateTimer() {
            const grabbedAt = new Date(userProfile.lastOrderGrabbedAt);
            const now = new Date();
            const diffMs = 60 * 60 * 1000 - (now - grabbedAt);
            if (diffMs <= 0) {
                setTimer('00:00');
                return;
            }
            const mins = Math.floor(diffMs / 60000);
            const secs = Math.floor((diffMs % 60000) / 1000);
            setTimer(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
        updateTimer();
        timerIntervalRef.current = setInterval(updateTimer, 1000);
        return () => clearInterval(timerIntervalRef.current);
    }, [userProfile]);

    const fetchNextOrder = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('Please login to view orders', { position: "top-right" });
                router.push('/login');
                return;
            }

            const response = await fetch('/api/orders/next', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                setOrder(data.data);
            } else {
                if (response.status === 401) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/login');
                    return;
                }
                setError(data.message || 'Failed to fetch order');
                toast.error(data.message || 'Failed to fetch order', { position: "top-right" });
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleGrabOrder = async () => {
        if (!order) return;

        setLoading(true);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('Please login to grab orders', { position: "top-right" });
                router.push('/login');
                return;
            }

            const response = await fetch('/api/orders/grab', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ orderId: order._id }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Update the token with the new grabbed orders
                if (data.data.token) {
                    sessionStorage.setItem('jwtToken', data.data.token);
                }
                setNotice(data.notice);
                toast.success(data.message, { position: "top-right" });
                // Fetch the next order
                fetchNextOrder();
            } else {
                if (response.status === 401) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/login');
                    return;
                }
                if (data.message == 'Insufficient balance') {
                    setShowInsufficientBalancePopup(true);
                }
                if (data.message != 'Insufficient balance') {
                    toast.error(data.message || 'Failed to grab order', { position: "top-right" });
                }
            }
        } catch (err) {
            console.error('Error grabbing order:', err);
            toast.error('An unexpected error occurred', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    if (loading ||loadingProfile) {
        return (
            <WebsiteLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <p>Loading order...</p>
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

    if (!order) {
        return (
            <WebsiteLayout>
                {
                    notice ?
                        <div className='bg-green-500'>
                            <p className='text-white text-2xl font-semibold text-center m-5 p-5'>{notice}</p>
                        </div> : null
                }
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Available</h2>
                        <p className="text-gray-600">Check back later for new orders!</p>
                    </div>
                </div>
            </WebsiteLayout>
        );
    }

    return (
        <WebsiteLayout>
            {
                notice ?
                    <div className='bg-green-500'>
                        <p className='text-white text-2xl font-semibold text-center m-5 p-5'>{notice}</p>
                    </div> : null
            }

            {showInsufficientBalancePopup && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center  z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center relative m-5">
                        <button
                            onClick={() => setShowInsufficientBalancePopup(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Insufficient Balance</h3>
                        <p className="text-gray-600 mb-6">
                            You do not have enough balance to grab the orders, Please recharge to continue.
                        </p>
                        <button
                            onClick={() => {
                                setShowInsufficientBalancePopup(false);
                                router.push('/recharge');
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                        >
                            Recharge Now
                        </button>
                    </div>
                </div>
            )}
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Order Image */}
                        <div className="relative h-64 w-full mt-5">
                            <Image
                                src={order.img}
                                alt={order.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Order Details */}
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{order.title}</h2>
                            <p className="text-gray-600 mb-4">{order.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Price</p>
                                    <p className="text-xl font-semibold text-gray-800">₹{order.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Commission</p>
                                    <p className="text-xl font-semibold text-green-600">₹{(order.price * order.comission / 100)} ({order.comission}%)</p>
                                </div>
                            </div>

                            <button
                                onClick={handleGrabOrder}
                                disabled={loading || timer == '00:00'}
                                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${loading || timer == '00:00'
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {loading ? 'Processing...' : `Grab Now${userProfile && userProfile.lastOrderGrabbedAt ? ` (Only ${timer} Mins Left)` : ''}`}
                            </button>
                            {timer == '00:00' ?

                                <p className='text-red-500 text-center text-sm mb-5 mt-2 '>

                                    Your orders are frozen, please contact to support team
                                </p> : null
                            }

                            <p className='text-gray-500 text-sm my-5 flex gap-2 items-center'>
                                <HiSpeakerWave />  {currentName + '****'} has grabbed ₹{currentAmount}.00
                            </p>

                            <p className='text-gray-500 text-sm my-5'>
                                Note:-
                                When you click auto grab, the mall will automatically issue an order task you need to complete the payment for the order. The order task needs to be completed within 60 minutes. After grabbing the order please complete the task as soon as possible. If you have any questions, please contact support service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </WebsiteLayout>
    );
}