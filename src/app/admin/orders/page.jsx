'use client';

import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { FaFileAlt, FaChevronLeft, FaChevronRight, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage, setOrdersPerPage] = useState(10);
    const [totalOrders, setTotalOrders] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, ordersPerPage]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const response = await fetch(`/api/admin/order?page=${currentPage}&limit=${ordersPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                setOrders(data.data.orders);
                setTotalOrders(data.data.totalOrders);
            } else {
                setError(data.message || 'Failed to fetch order reports');
                toast.error(data.message || 'Failed to fetch order reports', { position: "top-right" });
                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/admin-login');
                }
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('An unexpected error occurred while fetching orders');
            toast.error('An unexpected error occurred while fetching orders', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (orderId) => {
        setOrderToDelete(orderId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const res = await fetch('/api/admin/order', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id: orderToDelete }),
            });

            const data = await res.json();

            if (data.status === 'success') {
                toast.success(data.message, { position: "top-right" });
                fetchOrders(); // Re-fetch orders after deletion
            } else {
                setError(data.message || 'Failed to delete order.');
                toast.error(data.message || 'Failed to delete order.', { position: "top-right" });
                if (res.status === 401 || res.status === 403) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/admin-login');
                }
            }
        } catch (err) {
            console.error('Error deleting order:', err);
            setError('An unexpected error occurred while deleting order.');
            toast.error('An unexpected error occurred while deleting order.', { position: "top-right" });
        } finally {
            setLoading(false);
            setOrderToDelete(null);
        }
    };

    const cancelDelete = () => {
        setOrderToDelete(null);
        setShowDeleteConfirm(false);
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p>Loading orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-100 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 mb-5 text-center text-xl font-bold shadow-lg">
                    Admin Order Management
                </div>

                {/* Add New Order Button */}
                <div className="mx-5 mb-5">
                                        <button
                        onClick={() => router.push('/admin/orders/create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300"
                    >
                        <FaPlus className="text-sm" />
                        Add New Order
                            </button>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden m-5">
                    {totalOrders === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <FaFileAlt className="text-gray-400 text-6xl mb-4" />
                            <p className="text-gray-600 text-lg font-medium">No order records found</p>
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
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{order.comission.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => router.push(`/admin/orders/create?id=${order._id}`)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    <FaEdit className="inline-block mr-1" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(order._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash className="inline-block mr-1" /> Delete
                                                </button>
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
                                            <span className="text-sm font-medium text-gray-500">S No:</span>
                                            <span className="text-sm font-medium text-gray-900">{startOrder + index}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Image:</span>
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
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Title:</span>
                                            <span className="text-sm text-gray-700">{order.title}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Description:</span>
                                            <span className="text-sm text-gray-700 break-words max-w-[calc(100%-100px)] text-right">{order.description}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Price:</span>
                                            <span className="text-sm text-gray-700">₹{order.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Commission:</span>
                                            <span className="text-sm text-gray-700">₹{order.comission.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-end items-center mt-4">
                                            <button
                                                onClick={() => router.push(`/admin/orders/create?id=${order._id}`)}
                                                className="text-blue-600 hover:text-blue-900 mr-4 text-sm"
                                            >
                                                <FaEdit className="inline-block mr-1" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(order._id)}
                                                className="text-red-600 hover:text-red-900 text-sm"
                                            >
                                                <FaTrash className="inline-block mr-1" /> Delete
                                            </button>
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

            {/* Delete Confirmation Popup */}
            {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
                            <p className="text-sm text-gray-700 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
            )}
        </>
    );
}
