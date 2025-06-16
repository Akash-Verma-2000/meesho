'use client'
import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaKey, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    sponsorId: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    paymentPassword: '',
    confirmPaymentPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPaymentPassword, setShowPaymentPassword] = useState(false);
  const [showConfirmPaymentPassword, setShowConfirmPaymentPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sponsorIdFromUrl = searchParams.get('sponsorId');
    if (sponsorIdFromUrl) {
      setFormData(prev => ({
        ...prev,
        sponsorId: sponsorIdFromUrl
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for the current field as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required.';
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number starting with 6-9.';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.paymentPassword) {
      newErrors.paymentPassword = 'Payment password is required.';
    } else if (formData.paymentPassword.length < 8) {
      newErrors.paymentPassword = 'Payment password must be at least 8 characters long.';
    }
    if (!formData.confirmPaymentPassword) {
      newErrors.confirmPaymentPassword = 'Confirm Payment Password is required.';
    } else if (formData.confirmPaymentPassword !== formData.paymentPassword) {
      newErrors.confirmPaymentPassword = 'Payment passwords do not match.';
    }
    if (!formData.sponsorId) newErrors.sponsorId = 'Sponsor ID is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsorId: formData.sponsorId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          paymentPassword: formData.paymentPassword,
        }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        // setMessage(data.message);

        toast.success(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        router.push('/login');
      } else {
        toast.error(data.message || 'Registration failed. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        // setMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(data.message || "An unexpected error occurred.Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-5 md:p-10 lg:p-20">
      <div className="max-w-md w-full space-y-8 bg-white px-5 py-10 md:px-10 md:py-14 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="sponsorId" className="block text-gray-700 text-sm font-bold mb-2">Sponsor ID:</label>
            <input
              type="text"
              id="sponsorId"
              name="sponsorId"
              value={formData.sponsorId}
              onChange={handleChange}
              readOnly={!!formData.sponsorId}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formData.sponsorId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {errors.sponsorId && <p className="text-red-500 text-xs italic">{errors.sponsorId}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
          </div>

          <div className="mb-4 relative">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password:</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && <p className="text-red-500 text-xs italic">{errors.confirmPassword}</p>}
          </div>

          <div className="mb-4 relative">
            <label htmlFor="paymentPassword" className="block text-gray-700 text-sm font-bold mb-2">Payment Password:</label>
            <input
              type={showPaymentPassword ? 'text' : 'password'}
              id="paymentPassword"
              name="paymentPassword"
              value={formData.paymentPassword}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              onClick={() => setShowPaymentPassword(!showPaymentPassword)}
              className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPaymentPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.paymentPassword && <p className="text-red-500 text-xs italic">{errors.paymentPassword}</p>}
          </div>

          <div className="mb-6 relative">
            <label htmlFor="confirmPaymentPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Payment Password:</label>
            <input
              type={showConfirmPaymentPassword ? 'text' : 'password'}
              id="confirmPaymentPassword"
              name="confirmPaymentPassword"
              value={formData.confirmPaymentPassword}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPaymentPassword(!showConfirmPaymentPassword)}
              className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPaymentPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPaymentPassword && <p className="text-red-500 text-xs italic">{errors.confirmPaymentPassword}</p>}
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
