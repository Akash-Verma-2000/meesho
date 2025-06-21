'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function PendingOrdersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingOrder();
    }, []);

    const fetchPendingOrder = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('Please login to view your pending orders', { position: "top-right" });
                router.push('/login');
                return;
            }
            const response = await fetch('/api/orders/next', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                setOrder(data.data);
            } else {
                setOrder(null);
            }
        } catch (err) {
            console.error('Error fetching pending order:', err);
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <WebsiteLayout>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <p>Loading pending order...</p>
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

    return (
        <WebsiteLayout>
            <div className="min-h-screen bg-gray-100 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 mb-5 text-center text-xl font-bold shadow-lg">
                    Pending Order
                </div>
                {/* Tabs */}
                <div className="flex gap-2 justify-center mb-6">
                    <button
                        className={`cursor-pointer px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors duration-200 ${pathname === '/pending-orders' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                        onClick={() => router.push('/pending-orders')}
                    >
                        Pending
                    </button>
                    <button
                        className={`cursor-pointer px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors duration-200 ${pathname === '/order' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                        onClick={() => router.push('/order')}
                    >
                        Completed
                    </button>
                    <button
                        className={`cursor-pointer px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors duration-200 ${pathname === '/frozen-orders' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                        onClick={() => router.push('/frozen-orders')}
                    >
                        Frozen
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden m-5">
                    {!order ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <FaFileAlt className="text-gray-400 text-6xl mb-4" />
                            <p className="text-gray-600 text-lg font-medium">No pending order found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-primary">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Commission</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Commission Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className='cursor-pointer'  onClick={() => {
                                        router.push("/grab")
                                    }}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {order.img && (
                                                <Image
                                                    src={order.img}
                                                    alt={order.title}
                                                    width={50}
                                                    height={50}
                                                    objectFit="cover"
                                                    className="rounded-md"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs overflow-hidden truncate">{order.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{order.price?.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.comission?.toFixed(2)}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                            ₹{((order.price * order.comission) / 100).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </WebsiteLayout>
    );
}
