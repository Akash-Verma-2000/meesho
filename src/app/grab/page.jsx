'use client';

import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function GrabPage() {
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNextOrder();
    }, []);

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
                toast.success(data.message, { position: "top-right" });
                // Fetch the next order
                fetchNextOrder();
            } else {
                if (response.status === 401) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/login');
                    return;
                }
                toast.error(data.message || 'Failed to grab order', { position: "top-right" });
            }
        } catch (err) {
            console.error('Error grabbing order:', err);
            toast.error('An unexpected error occurred', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <WebsiteLayout>

                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <p>Loading...</p>
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
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Order Image */}
                        <div className="relative h-64 w-full">
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
                                    <p className="text-xl font-semibold text-green-600">{order.comission.toFixed(2)}%</p>
                                </div>
                            </div>

                            <button
                                onClick={handleGrabOrder}
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {loading ? 'Processing...' : 'Grab Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </WebsiteLayout>
    );
}