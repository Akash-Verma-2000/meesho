'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { FaFileAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function RechargeReportPage() {
    const router = useRouter();
    const [recharges, setRecharges] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rechargesPerPage, setRechargesPerPage] = useState(10);
    const [totalRecharges, setTotalRecharges] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

    useEffect(() => {
        fetchRecharges();
    }, [currentPage, rechargesPerPage, selectedStatusFilter]);

    const fetchRecharges = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            let url = `/api/admin/recharge-report?page=${currentPage}&limit=${rechargesPerPage}`;
            if (selectedStatusFilter !== 'all') {
                url += `&status=${selectedStatusFilter}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                setRecharges(data.data.recharges);
                setTotalRecharges(data.data.totalRecharges);
            } else {
                setError(data.message || 'Failed to fetch recharge reports');
                toast.error(data.message || 'Failed to fetch recharge reports', { position: "top-right" });
                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/admin-login');
                }
            }
        } catch (err) {
            console.error('Error fetching recharge reports:', err);
            setError('An unexpected error occurred while fetching recharge reports');
            toast.error('An unexpected error occurred while fetching recharge reports', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (transactionId, newStatus) => {
        setLoading(true); // Set loading to true while updating status
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const res = await fetch('/api/admin/recharge-report', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ transactionId, status: newStatus }),
            });

            const data = await res.json();

            if (data.status === 'success') {
                toast.success(data.message, { position: "top-right" });
                fetchRecharges(); // Re-fetch to get the latest status
            } else {
                toast.error(data.message || 'Failed to update recharge status.', { position: "top-right" });
                if (res.status === 401 || res.status === 403) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/admin-login');
                }
            }
        } catch (err) {
            console.error('Error updating recharge status:', err);
            toast.error('An unexpected error occurred while updating recharge status.', { position: "top-right" });
        } finally {
            setLoading(false); // Reset loading after update attempt
        }
    };

    const totalPages = Math.ceil(totalRecharges / rechargesPerPage);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleRechargesPerPageChange = (e) => {
        setRechargesPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page on recharges per page change
    };

    const startRecharge = (currentPage - 1) * rechargesPerPage + 1;
    const endRecharge = Math.min(currentPage * rechargesPerPage, totalRecharges);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p>Loading recharge reports...</p>
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
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
                Recharge Reports
            </div>

            {/* Filters */}
            <div className="bg-white m-5 rounded-xl shadow-lg p-5 my-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-auto">
                        <label htmlFor="statusFilter" className="text-sm text-gray-700 block mb-1">Filter by Status:</label>
                        <select
                            id="statusFilter"
                            value={selectedStatusFilter}
                            onChange={(e) => setSelectedStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Recharges Table */}
            <div className="bg-white m-5 rounded-xl shadow-lg overflow-hidden">
                {totalRecharges === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <FaFileAlt className="text-gray-400 text-6xl mb-4" />
                        <p className="text-gray-600 text-lg font-medium">No recharge records found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                            <thead className="bg-primary">
                                <tr>
                                    <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">S No</th>
                                    <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recharges.map((recharge, index) => (
                                    <tr key={recharge._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{startRecharge + index}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{recharge.userId.userId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{recharge.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(recharge.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(recharge.createdAt).toLocaleTimeString()}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                            recharge.status === 'approved' ? 'text-green-600' :
                                            recharge.status === 'pending' ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {recharge.status.charAt(0).toUpperCase() + recharge.status.slice(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <select
                                                value={recharge.status}
                                                onChange={(e) => handleStatusChange(recharge._id, e.target.value)}
                                                className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={loading}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Responsive cards for small screens */}
                        <div className="sm:hidden">
                            {recharges.map((recharge, index) => (
                                <div key={recharge._id} className="bg-white p-4 mb-4 rounded-lg shadow-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-500">S No:</span>
                                        <span className="text-sm font-medium text-gray-900">{startRecharge + index}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-500">User ID:</span>
                                        <span className="text-sm text-gray-700">{recharge.userId.userId}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-500">Amount:</span>
                                        <span className="text-sm text-gray-700">₹{recharge.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-500">Date:</span>
                                        <span className="text-sm text-gray-700">{new Date(recharge.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-500">Time:</span>
                                        <span className="text-sm text-gray-700">{new Date(recharge.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-500">Status:</span>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            recharge.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            recharge.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {recharge.status.charAt(0).toUpperCase() + recharge.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Actions:</span>
                                        <select
                                            value={recharge.status}
                                            onChange={(e) => handleStatusChange(recharge._id, e.target.value)}
                                            className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={loading}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="px-4 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-200 gap-y-4">
                            <div className="text-sm text-gray-700 text-center sm:text-left w-full sm:w-auto">
                                Showing <span className="font-semibold">{startRecharge}</span> to <span className="font-semibold">{endRecharge}</span> out of <span className="font-semibold">{totalRecharges}</span> recharges
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full sm:w-auto mt-2 sm:mt-0">
                                <div className="flex items-center gap-2 justify-center mb-2 sm:mb-0">
                                    <label htmlFor="rechargesPerPage" className="text-sm text-gray-700">Recharges per page:</label>
                                    <select
                                        id="rechargesPerPage"
                                        value={rechargesPerPage}
                                        onChange={handleRechargesPerPageChange}
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
    );
}