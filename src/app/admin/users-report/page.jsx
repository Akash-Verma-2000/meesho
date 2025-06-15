'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { FaFileAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function UserReportPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, usersPerPage]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const response = await fetch(`/api/admin/user-report?page=${currentPage}&limit=${usersPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                setUsers(data.data.users);
                setTotalUsers(data.data.totalUsers);
            } else {
                setError(data.message || 'Failed to fetch user reports');
                toast.error(data.message || 'Failed to fetch user reports', { position: "top-right" });
                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/admin-login');
                }
            }
        } catch (err) {
            console.error('Error fetching user reports:', err);
            setError('An unexpected error occurred while fetching user reports');
            toast.error('An unexpected error occurred while fetching user reports', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (userId, currentBlockedStatus) => {
        const newBlockedStatus = !currentBlockedStatus;
        setLoading(true); // Set loading to true while toggling
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const res = await fetch('/api/admin/user-report', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: userId, isBlocked: newBlockedStatus }),
            });

            const data = await res.json();

            if (data.status === 'success') {
                toast.success(data.message, { position: "top-right" });
                // Optimistically update the UI or refetch data
                fetchUsers(); // Re-fetch to get the latest status and reflect it in UI
            } else {
                toast.error(data.message || 'Failed to update user block status.', { position: "top-right" });
                if (res.status === 401 || res.status === 403) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/admin-login');
                }
            }
        } catch (err) {
            console.error('Error toggling block status:', err);
            toast.error('An unexpected error occurred while toggling block status.', { position: "top-right" });
        } finally {
            setLoading(false); // Reset loading after toggle attempt
        }
    };

    const totalPages = Math.ceil(totalUsers / usersPerPage);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleUsersPerPageChange = (e) => {
        setUsersPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page on users per page change
    };

    const startUser = (currentPage - 1) * usersPerPage + 1;
    const endUser = Math.min(currentPage * usersPerPage, totalUsers);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p>Loading user reports...</p>
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
                    User Reports
                </div>

                {/* Users Table */}
                <div className="bg-white m-5 rounded-xl shadow-lg overflow-hidden">
                    {totalUsers === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <FaFileAlt className="text-gray-400 text-6xl mb-4" />
                            <p className="text-gray-600 text-lg font-medium">No user records found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl">
                            <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                                <thead className="bg-primary">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">S No</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">User ID</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Sponsor ID</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Balance</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user, index) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{startUser + index}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.userId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{typeof user.sponsorId === 'object' ? user.sponsorId.userId : user.sponsorId || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{user.balance.toFixed(2)}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${user.isBlocked ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <button
                                                    onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                                    className={`py-1 px-3 rounded-md text-white text-xs font-semibold ${user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                                        }`}
                                                    disabled={loading}
                                                >
                                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Responsive cards for small screens */}
                            <div className="sm:hidden">
                                {users.map((user, index) => (
                                    <div key={user._id} className="bg-white p-4 mb-4 rounded-lg shadow-md">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">S No:</span>
                                            <span className="text-sm font-medium text-gray-900">{startUser + index}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">User ID:</span>
                                            <span className="text-sm text-gray-700">{user.userId}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Name:</span>
                                            <span className="text-sm text-gray-700">{user.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Email:</span>
                                            <span className="text-sm text-gray-700">{user.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Phone:</span>
                                            <span className="text-sm text-gray-700">{user.phone}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Sponsor ID:</span>
                                            <span className="text-sm text-gray-700">{typeof user.sponsorId === 'object' ? user.sponsorId.userId : user.sponsorId || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Balance:</span>
                                            <span className="text-sm text-gray-700">₹{user.balance.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Status:</span>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Actions:</span>
                                            <button
                                                onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                                className={`py-1 px-3 rounded-md text-white text-xs font-semibold ${user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                                    }`}
                                                disabled={loading}
                                            >
                                                {user.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="px-4 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-200 gap-y-4">
                                <div className="text-sm text-gray-700 text-center sm:text-left w-full sm:w-auto">
                                    Showing <span className="font-semibold">{startUser}</span> to <span className="font-semibold">{endUser}</span> out of <span className="font-semibold">{totalUsers}</span> users
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex items-center gap-2 justify-center mb-2 sm:mb-0">
                                        <label htmlFor="usersPerPage" className="text-sm text-gray-700">Users per page:</label>
                                        <select
                                            id="usersPerPage"
                                            value={usersPerPage}
                                            onChange={handleUsersPerPageChange}
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
                    )
                    }
                </div>

            </div>
        </>
    );
}