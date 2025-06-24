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
    const [isfrozen, setIsFrozen] = useState(false);

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
                setIsFrozen(data.orderFrozen);
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
                    Frozen Order
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
                <div className="overflow-hidden m-5">
                    {!order || isfrozen ?
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <FaFileAlt className="text-gray-400 text-6xl mb-4" />
                            <p className="text-gray-600 text-lg font-medium">No pending order found</p>
                        </div>
                        : null
                    }

                    {order && !isfrozen ?
                        <div className="overflow-x-auto rounded-xl cursor-pointer" onClick={() => { router.push("/grab") }}>
                            <table className="min-w-full divide-y divide-gray-200">

                                <div className="divide-y divide-gray-200">
                                    <div className="flex flex-col bg-white my-5 py-2 sm:py-5 pe-2 sm:pe-5  rounded-xl shadow-lg">

                                        <div className='flex flex-row items-center justify-between'>

                                            <div className="flex w-full sm:w-auto">
                                                <div className="flex-shrink-0 -me-20 sm:-me-16">
                                                    {order.img && (
                                                        <Image
                                                            src={order.img}
                                                            alt={order.title}
                                                            width={200}
                                                            height={200}
                                                            className="rounded-md -ms-9 sm:-ms-8"
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold  text-gray-900">{order?.title}</span>
                                                    <span className="text-sm text-gray-700">Price: <span className="font-semibold">₹{order.price.toFixed(2)}</span></span>
                                                    <span className="text-sm text-gray-700">Commission: <span className="font-semibold">{order.comission.toFixed(2)}%</span></span>
                                                    <span className="text-sm text-gray-700">Earning: <span className="font-semibold">₹{((order.price * order.comission) / 100).toFixed(2)}</span></span>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>

                            </table>

                        </div>
                        : null
                    }
                </div>
            </div>
        </WebsiteLayout>
    );
}
