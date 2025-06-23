'use client';

import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaUsers, FaFileAlt, FaHandshake, FaMoneyBillWave, FaClock, FaArrowRight } from 'react-icons/fa';
import Image from 'next/image';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalGrabbedOrders: 0,
        totalCommissionDistributed: 0,
        pendingTransactions: 0,
        recentTransactions: [],
        recentOrders: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                setDashboardData(data.data);
            } else {
                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/admin-login');
                    return;
                }
                setError(data.message || 'Failed to fetch dashboard data');
                toast.error(data.message || 'Failed to fetch dashboard data', { position: "top-right" });
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-white pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 mb-5 text-center text-xl font-bold shadow-lg">
                    Admin Dashboard
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                    {/* Total Users */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Users</p>
                                <p className="text-2xl font-bold text-gray-800">{dashboardData.totalUsers}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FaUsers className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-800">{dashboardData.totalOrders}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <FaFileAlt className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Grabbed Orders */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Grabbed Orders</p>
                                <p className="text-2xl font-bold text-gray-800">{dashboardData.totalGrabbedOrders}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <FaHandshake className="text-purple-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Total Commission */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Commission</p>
                                <p className="text-2xl font-bold text-gray-800">₹{dashboardData.totalCommissionDistributed.toFixed(2)}</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <FaMoneyBillWave className="text-yellow-600 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                    {/* Recent Transactions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {dashboardData.pendingTransactions} Pending
                            </span>
                        </div>
                        <div className="space-y-4">
                            {dashboardData.recentTransactions.map((transaction) => (
                                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-800">{transaction.userId?.name || 'Unknown User'}</p>
                                        <p className="text-sm text-gray-500">{transaction.type} - ₹{transaction.amount}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {transaction.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                            <button
                                onClick={() => router.push('/admin/orders')}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                            >
                                View All <FaArrowRight className="text-xs" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {dashboardData.recentOrders.map((order) => (
                                <div key={order._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    {order.img && (
                                        <div className="relative w-16 h-16">
                                            <Image
                                                src={order.img}
                                                alt={order.title}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{order.title}</p>
                                        <p className="text-sm text-gray-500">₹{order.price} - {order.comission}% Commission</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}