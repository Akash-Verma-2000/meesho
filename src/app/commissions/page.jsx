'use client';

import WebsiteLayout from "@/components/WebsiteLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {toast} from "react-toastify";

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [commissionsPerPage, setCommissionsPerPage] = useState(10);
    const [totalCommissions, setTotalCommissions] = useState(0);
    const [totalCommission, setTotalCommission] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/user/commissions?page=${currentPage}&limit=${commissionsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.status === "success") {
                setCommissions(data.data.commissions);
                setTotalCommissions(data.data.pagination.totalCommissions);
                setTotalCommission(data.data.pagination.totalCommission);
            } else {
                setError(data.message);
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching commissions:', error);
            setError('Failed to fetch commissions');
            toast.error('Failed to fetch commissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [currentPage, commissionsPerPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleCommissionsPerPageChange = (e) => {
        setCommissionsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <WebsiteLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Commission History</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-blue-800">Total Commissions</h2>
                            <p className="text-2xl font-bold text-blue-600">₹{totalCommission.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-green-800">Total Orders</h2>
                            <p className="text-2xl font-bold text-green-600">{totalCommissions}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading commissions...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : commissions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No commissions found</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S No.</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission %</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {commissions.map((commission, index) => (
                                            <tr key={commission.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(currentPage - 1) * commissionsPerPage + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{commission.price.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{commission.commissionPercentage}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{commission.commissionAmount.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(commission.date).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden space-y-4">
                                {commissions.map((commission, index) => (
                                    <div key={commission.id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-2">
                                            <p className="text-sm text-gray-600">S No.:</p>
                                            <p className="text-sm font-medium">{(currentPage - 1) * commissionsPerPage + index + 1}</p>
                                            <p className="text-sm text-gray-600">Price:</p>
                                            <p className="text-sm font-medium">₹{commission.price.toFixed(2)}</p>
                                            <p className="text-sm text-gray-600">Commission %:</p>
                                            <p className="text-sm font-medium">{commission.commissionPercentage}%</p>
                                            <p className="text-sm text-gray-600">Commission Amount:</p>
                                            <p className="text-sm font-medium">₹{commission.commissionAmount.toFixed(2)}</p>
                                            <p className="text-sm text-gray-600">Date:</p>
                                            <p className="text-sm font-medium">
                                                {new Date(commission.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="perPage" className="text-sm text-gray-600">Show:</label>
                                    <select
                                        id="perPage"
                                        value={commissionsPerPage}
                                        onChange={handleCommissionsPerPageChange}
                                        className="border rounded px-2 py-1 text-sm"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                    </select>
                                    <span className="text-sm text-gray-600">entries</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {Math.ceil(totalCommissions / commissionsPerPage)}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= Math.ceil(totalCommissions / commissionsPerPage)}
                                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </WebsiteLayout>
    );
} 