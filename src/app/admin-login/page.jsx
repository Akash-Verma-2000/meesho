'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Page() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
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
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.status === 'success') {
                sessionStorage.setItem('jwtToken', data.data.token);
                toast.success(data.message, { position: "top-right" });
                router.push('/admin');
            } else {
                toast.error(data.message || 'Login failed. Please check your credentials.', { position: "top-right" });
            }
        } catch (err) {
            console.error('Error during admin login:', err);
            toast.error(err.message, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <Image
                        src="/images/logo.png" // Assuming you have a logo at this path
                        alt="Logo"
                        width={80}
                        height={80}
                        priority
                    />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 flex items-center border border-gray-300 rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 text-gray-500 sm:text-sm">
                                <FaEnvelope />
                            </span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="admin@example.com"
                                className="flex-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                disabled={loading}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="mt-1 flex items-center border border-gray-300 rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 text-gray-500 sm:text-sm">
                                <FaLock />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                className="flex-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 pr-10"
                                disabled={loading}
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer top-7"
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    For support, please contact <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">Support Team</Link>.
                </p>
            </div>
        </div>
    );
} 