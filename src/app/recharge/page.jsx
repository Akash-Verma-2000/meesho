'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaBarcode, FaLock, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function RechargePage() {
  const router = useRouter();
  const [rechargeData, setRechargeData] = useState({
    amount: '',
    transactionId: '',
    paymentPassword: '',
  });
  const [qrCode, setQrCode] = useState(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(true);
  const [qrCodeError, setQrCodeError] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQrCode();
  }, []);

  const fetchQrCode = async () => {
    setQrCodeLoading(true);
    setQrCodeError(null);
    try {
      const response = await fetch('/api/user/payment-settings');
      const data = await response.json();

      if (data.status === 'success' && data.data && data.data.qrCodeBase64) {
        setQrCode(data.data.qrCodeBase64);
      } else {
        setQrCodeError(data.message || 'Failed to fetch QR code.');
        toast.error(data.message || 'Failed to fetch QR code.', { position: "top-right" });
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setQrCodeError('An unexpected error occurred while fetching QR code.');
      toast.error('An unexpected error occurred while fetching QR code.', { position: "top-right" });
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRechargeData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
      const newErrors = {};
      if (!rechargeData.amount) {
          newErrors.amount = 'Amount is required.';
      } else if (isNaN(rechargeData.amount) || parseFloat(rechargeData.amount) <= 0) {
          newErrors.amount = 'Amount must be a positive number.';
      }
      if (!rechargeData.transactionId) newErrors.transactionId = 'Transaction ID is required.';
      if (!rechargeData.paymentPassword) {
          newErrors.paymentPassword = 'Payment password is required.';
      } else if (rechargeData.paymentPassword.length < 8) {
          newErrors.paymentPassword = 'Payment password must be at least 8 characters long.';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }

    setLoading(true);
    try {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
            toast.error('No authentication token found. Please log in.', { position: "top-right" });
            router.push('/login');
            return;
        }

        const res = await fetch('/api/user/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                type: "recharge",
                amount: parseFloat(rechargeData.amount),
                transactionId: rechargeData.transactionId,
                password: rechargeData.paymentPassword // API expects 'password' for paymentPassword
            }),
        });

        const data = await res.json();

        if (data.status === 'success') {
            toast.success(data.message, { position: "top-right" });
            setRechargeData({ amount: '', transactionId: '', paymentPassword: '' });
            setErrors({});
        } else {
            toast.error(data.message || 'Failed to submit recharge request.', { position: "top-right" });
            if (res.status === 401) {
                sessionStorage.removeItem('jwtToken');
                router.push('/login');
            }
        }
    } catch (err) {
        console.error('Error submitting recharge request:', err);
        toast.error('An unexpected error occurred while submitting recharge request.', { position: "top-right" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
          Recharge Account
        </div>

        {/* QR Code Section */}
        <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg flex flex-col items-center py-10 px-4">
          <p className="text-lg font-semibold text-gray-800 mb-4">Scan to Recharge</p>
          {
            qrCodeLoading ? (
                <p>Loading QR Code...</p>
            ) : qrCodeError ? (
                <p className="text-red-600">Error loading QR Code: {qrCodeError}</p>
            ) : qrCode ? (
                <div className="w-full max-w-xs aspect-square bg-gray-200 flex items-center justify-center p-4 rounded-lg">
                    <Image
                        src={qrCode}
                        alt="QR Code for Recharge"
                        width={300}
                        height={300}
                        priority
                        className="w-full h-full object-contain"
                    />
                </div>
            ) : (
                <div className="w-full max-w-xs aspect-square bg-gray-200 flex items-center justify-center p-4 rounded-lg">
                    <FaTimesCircle className="text-gray-400 text-6xl" />
                    <p className="text-gray-600 text-lg font-medium">No QR code available</p>
                </div>
            )
          }
          <p className="text-sm text-gray-600 mt-4 text-center">Please scan the QR code to make your payment.</p>
        </div>

        {/* Recharge Form */}
        <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-1 md:px-5 py-5 lg:py-10">
            <div className="space-y-4">
              {/* Amount */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaMoneyBillWave className="text-blue-500 text-xl" />
                <div className="flex-1">
                  <label htmlFor="amount" className="text-sm text-gray-600">Amount</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={rechargeData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter recharge amount"
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  {errors.amount && <p className="text-red-500 text-xs italic">{errors.amount}</p>}
                </div>
              </div>

              {/* Transaction ID */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaBarcode className="text-blue-500 text-xl" />
                <div className="flex-1">
                  <label htmlFor="transactionId" className="text-sm text-gray-600">Transaction ID</label>
                  <input
                    type="text"
                    id="transactionId"
                    name="transactionId"
                    value={rechargeData.transactionId}
                    onChange={handleInputChange}
                    placeholder="Enter transaction ID"
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  {errors.transactionId && <p className="text-red-500 text-xs italic">{errors.transactionId}</p>}
                </div>
              </div>

              {/* Payment Password */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaLock className="text-blue-500 text-xl" />
                <div className="flex-1">
                  <label htmlFor="paymentPassword" className="text-sm text-gray-600">Payment Password</label>
                  <input
                    type="password"
                    id="paymentPassword"
                    name="paymentPassword"
                    value={rechargeData.paymentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your payment password"
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  {errors.paymentPassword && <p className="text-red-500 text-xs italic">{errors.paymentPassword}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 m-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Recharge Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </WebsiteLayout>
  );
} 