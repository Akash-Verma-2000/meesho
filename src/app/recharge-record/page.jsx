'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { FaFileAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function RechargeRecordPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, [currentPage, recordsPerPage]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('jwtToken');
      if (!token) {
        toast.error('No authentication token found. Please log in.', { position: "top-right" });
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/user/transaction?page=${currentPage}&limit=${recordsPerPage}&type=recharge`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        setRecords(data.data.transactions);
        setTotalRecords(data.data.totalTransactions);
      } else {
        setError(data.message || 'Failed to fetch recharge records');
        toast.error(data.message || 'Failed to fetch recharge records', { position: "top-right" });
        if (response.status === 401) {
          sessionStorage.removeItem('jwtToken');
          router.push('/login');
        }
      }
    } catch (err) {
      console.error('Error fetching recharge records:', err);
      setError('An unexpected error occurred while fetching recharge records');
      toast.error('An unexpected error occurred while fetching recharge records', { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page on records per page change
  };

  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  if (loading) {
    return (
      <WebsiteLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p>Loading recharge records...</p>
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
          Recharge Records
        </div>

        {/* Records Table */}
        <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg overflow-hidden">
          {totalRecords === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <FaFileAlt className="text-gray-400 text-6xl mb-4" />
              <p className="text-gray-600 text-lg font-medium">No recharge records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record, index) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{startRecord + index}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(record.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{record.amount.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        record.status === 'approved' ? 'text-green-600' : 
                        record.status === 'pending' ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="px-4 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 gap-y-4">
                <div className="text-sm text-gray-700 text-center sm:text-left w-full sm:w-auto">
                  Showing <span className="font-semibold">{startRecord}</span> to <span className="font-semibold">{endRecord}</span> out of <span className="font-semibold">{totalRecords}</span> records
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex items-center gap-2 justify-center mb-2 sm:mb-0">
                    <label htmlFor="recordsPerPage" className="text-sm text-gray-700">Records per page:</label>
                    <select
                      id="recordsPerPage"
                      value={recordsPerPage}
                      onChange={handleRecordsPerPageChange}
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
