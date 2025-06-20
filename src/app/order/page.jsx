'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { FaFileAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage, setOrdersPerPage] = useState(10);
    const [totalOrders, setTotalOrders] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, ordersPerPage]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('Please login to view your orders', { position: "top-right" });
                router.push('/login');
                return;
            }

            console.log("Fetching orders with token:", token);

            const response = await fetch(`/api/user/orders?page=${currentPage}&limit=${ordersPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            console.log("API Response:", data);

            if (data.status === 'success') {
                setOrders(data.data.orders);
                setTotalOrders(data.data.totalOrders);
                console.log("Set orders:", data.data.orders);
                console.log("Set total orders:", data.data.totalOrders);
            } else {
                if (response.status === 401) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/login');
                    return;
                }
                setError(data.message || 'Failed to fetch orders');
                toast.error(data.message || 'Failed to fetch orders', { position: "top-right" });
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleOrdersPerPageChange = (e) => {
        setOrdersPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page on orders per page change
    };

    const startOrder = (currentPage - 1) * ordersPerPage + 1;
    const endOrder = Math.min(currentPage * ordersPerPage, totalOrders);

    if (loading) {
        return (
            <WebsiteLayout>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <p>Loading orders...</p>
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
                    My Grabbed Orders
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden m-5">
                    {totalOrders === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <FaFileAlt className="text-gray-400 text-6xl mb-4" />
                            <p className="text-gray-600 text-lg font-medium">No orders found</p>
                            <p className="text-gray-500 text-sm mt-2">Start grabbing orders to see them here!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl">
                            <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                                <thead className="bg-primary">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">S No</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Commission</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Commission Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order, index) => (
                                        <tr key={order._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{startOrder + index}</td>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{order.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.comission.toFixed(2)}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                ₹{((order.price * order.comission) / 100).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Responsive cards for small screens */}
                            <div className="sm:hidden">
                                {orders.map((order, index) => (
                                    <div key={order._id} className="bg-white p-4 mb-4 rounded-lg shadow-md">

                                        <div className="flex justify-between items-center mb-2">
                                            {order.img && (
                                                <Image
                                                    src={order.img}
                                                    alt={order.title}
                                                    width={1920}
                                                    height={1920}
                                                    objectFit="cover"
                                                    className="rounded-md"
                                                />
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">S No:</span>
                                            <span className="text-sm font-medium text-gray-900">{startOrder + index}</span>
                                        </div>

                                        <div className="flex gap-2 justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-500">Title:</span>
                                            <span className="text-sm text-gray-700">{order.title}</span>
                                        </div>
                                        { /*
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Description:</span>
                                            <span className="text-sm text-gray-700 break-words max-w-[calc(100%-100px)] text-right">{order.description}</span>
                                        </div>*/ }

                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Price:</span>
                                            <span className="text-sm text-gray-700">₹{order.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Commission:</span>
                                            <span className="text-sm text-gray-700">{order.comission.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Commission Amount:</span>
                                            <span className="text-sm text-green-600 font-medium">
                                                ₹{((order.price * order.comission) / 100).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="px-4 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-200 gap-y-4">
                                <div className="text-sm text-gray-700 text-center sm:text-left w-full sm:w-auto">
                                    Showing <span className="font-semibold">{startOrder}</span> to <span className="font-semibold">{endOrder}</span> out of <span className="font-semibold">{totalOrders}</span> orders
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex items-center gap-2 justify-center mb-2 sm:mb-0">
                                        <label htmlFor="ordersPerPage" className="text-sm text-gray-700">Orders per page:</label>
                                        <select
                                            id="ordersPerPage"
                                            value={ordersPerPage}
                                            onChange={handleOrdersPerPageChange}
                                            className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="50">50</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center">
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            <FaChevronLeft className="text-sm" />
                                        </button>
                                        <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            <FaChevronRight className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </WebsiteLayout>
    );
} 