'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect, useRef } from 'react';
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
    const [bankModalOpen, setBankModalOpen] = useState(false);
    const [bankDetails, setBankDetails] = useState(null);
    const [bankLoading, setBankLoading] = useState(false);
    const [bankError, setBankError] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [releaseOrderLoadingId, setReleaseOrderLoadingId] = useState(null);
    const [blockUserLoadingId, setBlockUserLoadingId] = useState(null);
    const [releaseFrozenLoadingId, setReleaseFrozenLoadingId] = useState(null);
    const [viewBankLoadingId, setViewBankLoadingId] = useState(null);
    const modalRef = useRef();

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
        setBlockUserLoadingId(userId);
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
            setBlockUserLoadingId(null);
        }
    };

    const handleViewBank = async (userId) => {
        setSelectedUserId(userId);
        setBankModalOpen(true);
        setBankDetails(null);
        setBankError(null);
        setViewBankLoadingId(userId);
        setBankLoading(true);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }
            const res = await fetch(`/api/admin/user-bank-details?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.status === 'success') {
                setBankDetails(data.data);
            } else {
                setBankError(data.message || 'Failed to fetch bank details.');
            }
        } catch (err) {
            setBankError('An unexpected error occurred while fetching bank details.');
        } finally {
            setBankLoading(false);
            setViewBankLoadingId(null);
        }
    };

    const closeBankModal = () => {
        setBankModalOpen(false);
        setBankDetails(null);
        setBankError(null);
        setSelectedUserId(null);
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

    function canReleaseOrder(user) {
        if (!user.lastOrderGrabbedAt) return true;
        const grabbedAt = new Date(user.lastOrderGrabbedAt);
        const now = new Date();
        const diffMs = now - grabbedAt;
        return diffMs >= 60 * 60 * 1000;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p>Loading user reports...</p>
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
            {/* Bank Details Modal */}
            {bankModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40">
                    <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fadeIn m-5">
                        <button onClick={closeBankModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                        <h2 className="text-lg font-bold mb-4 text-center">Bank Details</h2>
                        {bankLoading ? (
                            <div className="text-center py-8">Loading bank details...</div>
                        ) : bankError ? (
                            <div className="text-center text-red-600 py-8">{bankError}</div>
                        ) : bankDetails ? (
                            <div className="space-y-2">
                                <div><span className="font-semibold">Account Holder Name:</span> {bankDetails.accountHolderName}</div>
                                <div><span className="font-semibold">Bank Name:</span> {bankDetails.bankName}</div>
                                <div><span className="font-semibold">Branch Name:</span> {bankDetails.branchName}</div>
                                <div><span className="font-semibold">Account Number:</span> {bankDetails.accountNumber}</div>
                                <div><span className="font-semibold">IFSC Code:</span> {bankDetails.ifscCode}</div>
                                <div><span className="font-semibold">Account Type:</span> {bankDetails.type}</div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No bank details found for this user.</div>
                        )}
                    </div>
                </div>
            )}
            <div className="min-h-screen bg-white pb-20">
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
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Password</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Payment Password</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Sponsor ID</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Balance</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Frozen Balance</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Release Order</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Block User</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">Release Balance</th>
                                        <th className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">View Details</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user, index) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{startUser + index}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.userId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.password}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.paymentPassword}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{typeof user.sponsorId === 'object' ? user.sponsorId.userId : user.sponsorId || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{user.balance.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{user.frozenBalance.toFixed(2)}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-semibold ${user.isBlocked ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <button
                                                    className={`py-1 px-3 rounded-md text-white text-xs font-semibold ${!canReleaseOrder(user) ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                                                    disabled={!canReleaseOrder(user) || releaseOrderLoadingId === user._id}
                                                    onClick={async () => {
                                                        setReleaseOrderLoadingId(user._id);
                                                        try {
                                                            const token = sessionStorage.getItem('jwtToken');
                                                            if (!token) {
                                                                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                                                                router.push('/admin-login');
                                                                return;
                                                            }
                                                            const res = await fetch('/api/admin/unfrozOrder', {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'Authorization': `Bearer ${token}`,
                                                                },
                                                                body: JSON.stringify({ _id: user._id }),
                                                            });
                                                            const data = await res.json();
                                                            if (data.status === 'success') {
                                                                toast.success(data.message, { position: "top-right" });
                                                                fetchUsers();
                                                            } else {
                                                                toast.error(data.message || 'Failed to release order.', { position: "top-right" });
                                                            }
                                                        } catch (err) {
                                                            toast.error('An unexpected error occurred while releasing order.', { position: "top-right" });
                                                        } finally {
                                                            setReleaseOrderLoadingId(null);
                                                        }
                                                    }}
                                                >
                                                    {releaseOrderLoadingId === user._id ? 'Processing...' : 'Release'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                                    className={`py-1 px-3 rounded-md text-white text-xs font-semibold ${user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                                    disabled={blockUserLoadingId === user._id}
                                                >
                                                    {blockUserLoadingId === user._id ? 'Processing...' : (user.isBlocked ? 'Unblock' : 'Block')}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <button
                                                    className={`py-1 px-3 rounded-md text-white text-xs font-semibold ${user.frozenBalance === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
                                                    disabled={user.frozenBalance === 0 || releaseFrozenLoadingId === user._id}
                                                    onClick={async () => {
                                                        setReleaseFrozenLoadingId(user._id);
                                                        try {
                                                            const token = sessionStorage.getItem('jwtToken');
                                                            if (!token) {
                                                                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                                                                router.push('/admin-login');
                                                                return;
                                                            }
                                                            const res = await fetch('/api/admin/release-frozen', {
                                                                method: 'PUT',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'Authorization': `Bearer ${token}`,
                                                                },
                                                                body: JSON.stringify({ _id: user._id }),
                                                            });
                                                            const data = await res.json();
                                                            if (data.status === 'success') {
                                                                toast.success(data.message, { position: "top-right" });
                                                                fetchUsers();
                                                            } else {
                                                                toast.error(data.message || 'Failed to release frozen balance.', { position: "top-right" });
                                                            }
                                                        } catch (err) {
                                                            toast.error('An unexpected error occurred while releasing frozen balance.', { position: "top-right" });
                                                        } finally {
                                                            setReleaseFrozenLoadingId(null);
                                                        }
                                                    }}
                                                >
                                                    {releaseFrozenLoadingId === user._id ? 'Processing...' : 'Release'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex gap-2">
                                                <button
                                                    onClick={() => handleViewBank(user._id)}
                                                    className="py-1 px-3 rounded-md text-white text-xs font-semibold bg-blue-500 hover:bg-blue-600"
                                                    disabled={viewBankLoadingId === user._id}
                                                >
                                                    {viewBankLoadingId === user._id ? 'Processing...' : 'View Bank'}
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
                                            <span className="text-sm font-medium text-gray-500">Password:</span>
                                            <span className="text-sm text-gray-700">{user.password}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Payment Password:</span>
                                            <span className="text-sm text-gray-700">{user.paymentPassword}</span>
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
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Release Order:</span>
                                            <button
                                                className={`py-1 px-3 rounded-md text-white text-xs font-semibold ${!canReleaseOrder(user) ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                                                disabled={!canReleaseOrder(user) || releaseOrderLoadingId === user._id}
                                                onClick={async () => {
                                                    setReleaseOrderLoadingId(user._id);
                                                    try {
                                                        const token = sessionStorage.getItem('jwtToken');
                                                        if (!token) {
                                                            toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                                                            router.push('/admin-login');
                                                            return;
                                                        }
                                                        const res = await fetch('/api/admin/unfrozOrder', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${token}`,
                                                            },
                                                            body: JSON.stringify({ _id: user._id }),
                                                        });
                                                        const data = await res.json();
                                                        if (data.status === 'success') {
                                                            toast.success(data.message, { position: "top-right" });
                                                            fetchUsers();
                                                        } else {
                                                            toast.error(data.message || 'Failed to release order.', { position: "top-right" });
                                                        }
                                                    } catch (err) {
                                                        toast.error('An unexpected error occurred while releasing order.', { position: "top-right" });
                                                    } finally {
                                                        setReleaseOrderLoadingId(null);
                                                    }
                                                }}
                                            >
                                                {releaseOrderLoadingId === user._id ? 'Processing...' : 'Release'}
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Actions:</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                                    className={`py-1 px-3 rounded-md text-white text-xs font-semibold ${user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                                    disabled={blockUserLoadingId === user._id}
                                                >
                                                    {blockUserLoadingId === user._id ? 'Processing...' : (user.isBlocked ? 'Unblock' : 'Block')}
                                                </button>
                                                <button
                                                    className={`py-1 px-3 rounded-md text-white text-xs font-semibold ${user.frozenBalance === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'}`}
                                                    disabled={user.frozenBalance === 0 || releaseFrozenLoadingId === user._id}
                                                    onClick={async () => {
                                                        setReleaseFrozenLoadingId(user._id);
                                                        try {
                                                            const token = sessionStorage.getItem('jwtToken');
                                                            if (!token) {
                                                                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                                                                router.push('/admin-login');
                                                                return;
                                                            }
                                                            const res = await fetch('/api/admin/release-frozen', {
                                                                method: 'PUT',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'Authorization': `Bearer ${token}`,
                                                                },
                                                                body: JSON.stringify({ _id: user._id }),
                                                            });
                                                            const data = await res.json();
                                                            if (data.status === 'success') {
                                                                toast.success(data.message, { position: "top-right" });
                                                                fetchUsers();
                                                            } else {
                                                                toast.error(data.message || 'Failed to release frozen balance.', { position: "top-right" });
                                                            }
                                                        } catch (err) {
                                                            toast.error('An unexpected error occurred while releasing frozen balance.', { position: "top-right" });
                                                        } finally {
                                                            setReleaseFrozenLoadingId(null);
                                                        }
                                                    }}
                                                >
                                                    {releaseFrozenLoadingId === user._id ? 'Processing...' : 'Release'}
                                                </button>
                                                <button
                                                    onClick={() => handleViewBank(user._id)}
                                                    className="py-1 px-3 rounded-md text-white text-xs font-semibold bg-blue-500 hover:bg-blue-600"
                                                    disabled={viewBankLoadingId === user._id}
                                                >
                                                    {viewBankLoadingId === user._id ? 'Processing...' : 'View Bank'}
                                                </button>
                                            </div>
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