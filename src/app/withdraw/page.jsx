'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState } from 'react';
import { FaMoneyBillWave, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function WithdrawalPage() {
  const router = useRouter();
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    paymentPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWithdrawalData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
      const newErrors = {};
      if (!withdrawalData.amount) {
          newErrors.amount = 'Amount is required.';
      } else if (isNaN(withdrawalData.amount) || parseFloat(withdrawalData.amount) <= 0) {
          newErrors.amount = 'Amount must be a positive number.';
      }
      if (!withdrawalData.paymentPassword) {
          newErrors.paymentPassword = 'Payment password is required.';
      } else if (withdrawalData.paymentPassword.length < 8) {
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
                type: "withdraw",
                amount: parseFloat(withdrawalData.amount),
                password: withdrawalData.paymentPassword // API expects 'password' for paymentPassword
            }),
        });

        const data = await res.json();

        if (data.status === 'success') {
            toast.success(data.message, { position: "top-right" });
            setWithdrawalData({ amount: '', paymentPassword: '' });
            setErrors({});
        } else {
            // Handle bank details not filled
            if (res.status === 400 && data.redirectTo === '/bank-details') {
                toast.error('Please fill the bank details first', { position: "top-right" });
                router.push('/bank-details');
                return;
            }
            toast.error(data.message || 'Failed to submit withdrawal request.', { position: "top-right" });
            if (res.status === 401) {
                sessionStorage.removeItem('jwtToken');
                router.push('/login');
            }
        }
    } catch (err) {
        console.error('Error submitting withdrawal request:', err);
        toast.error('An unexpected error occurred while submitting withdrawal request.', { position: "top-right" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
          Withdraw Funds
        </div>

        {/* Withdrawal Form */}
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
                    value={withdrawalData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter withdrawal amount"
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  {errors.amount && <p className="text-red-500 text-xs italic">{errors.amount}</p>}
                   <p className="text-red-500 text-xs italic">5% Will be deducted as the tax from the withdrawal amount</p>
                </div>
              </div>

              {/* Payment Password */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaLock className="text-blue-500 text-xl" />
                <div className="flex-1 relative">
                  <label htmlFor="paymentPassword" className="text-sm text-gray-600">Payment Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="paymentPassword"
                    name="paymentPassword"
                    value={withdrawalData.paymentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your payment password"
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-5 top-12 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
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
                {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </WebsiteLayout>
  );
} 