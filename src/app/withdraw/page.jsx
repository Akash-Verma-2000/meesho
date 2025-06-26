'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState } from 'react';
import { FaMoneyBillWave, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GiTakeMyMoney } from "react-icons/gi";
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ title: '', description: '' });

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
        setPopupMessage({
          title: 'Error!',
          description: 'No authentication token found. Please log in.'
        });
        setShowErrorPopup(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
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
        setWithdrawalData({ amount: '', paymentPassword: '' });
        setErrors({});
        setPopupMessage({
          title: 'Request submitted successfully.',
          description: 'Your withdrawal request has been submitted. You will receive your money very soon.'
        });
        setShowSuccessPopup(true);
      } else {
        // Handle bank details not filled
        if (res.status === 400 && data.redirectTo === '/bank-details') {
          setPopupMessage({
            title: 'Withdrawal Failed',
            description: 'Please fill the bank details first.'
          });
          setShowErrorPopup(true);
          setTimeout(() => {
            router.push('/bank-details');
          }, 3000);
          return;
        }
        setPopupMessage({
          title: 'Withdrawal Failed!',
          description: data.message || 'Failed to submit withdrawal request.'
        });
        setShowErrorPopup(true);
        // if (res.status === 401) {
        //   sessionStorage.removeItem('jwtToken');
        //   // setTimeout(() => {
        //   //   router.push('/login');
        //   // }, 3000);
        // }
      }
    } catch (err) {
      console.error('Error submitting withdrawal request:', err);
      setPopupMessage({
        title: 'Error!',
        description: 'An unexpected error occurred while submitting withdrawal request.'
      });
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 relative w-full max-w-sm text-center">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 rounded-full h-20 w-20 flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-8">SUCCESS</h2>
              <p className="text-gray-600 mt-2">{popupMessage.title}</p>
              <p className="text-gray-600">{popupMessage.description}</p>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessPopup(false);
                  router.push('/');
                }}
                className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Error Popup */}
        {showErrorPopup && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 relative w-full max-w-sm text-center">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 rounded-full h-20 w-20 flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-8">ERROR!</h2>
              <p className="text-gray-600 mt-2">{popupMessage.title}</p>
              <p className="text-gray-600">{popupMessage.description}</p>
              {popupMessage.description === "Insufficient balance." ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowErrorPopup(false);
                    router.push('/recharge');
                  }}
                  className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Recharge
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowErrorPopup(false);
                  }}
                  className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

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
                  <p className="text-red-500 text-xs italic">Minimum ₹200.00 and Maximum ₹999999.00</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <GiTakeMyMoney className="text-blue-500 text-xl" />
                <div className="flex-1">
                  <label htmlFor="amount" className="text-sm text-gray-600">Actual amount on account</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={(withdrawalData.amount) - (withdrawalData.amount * 5 / 100)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                  <p className="text-red-500 text-xs italic">Withdrawal Rate is 5%</p>
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
                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
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