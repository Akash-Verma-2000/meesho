'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SecurityPage() {
    const router = useRouter();

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [paymentPasswordData, setPaymentPasswordData] = useState({
        oldPaymentPassword: '',
        newPaymentPassword: '',
        confirmNewPaymentPassword: '',
    });

    const [passwordErrors, setPasswordErrors] = useState({});
    const [paymentPasswordErrors, setPaymentPasswordErrors] = useState({});
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingPaymentPassword, setLoadingPaymentPassword] = useState(false);

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [showOldPaymentPassword, setShowOldPaymentPassword] = useState(false);
    const [showNewPaymentPassword, setShowNewPaymentPassword] = useState(false);
    const [showConfirmNewPaymentPassword, setShowConfirmNewPaymentPassword] = useState(false);

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePaymentPasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentPasswordData(prev => ({ ...prev, [name]: value }));
        if (paymentPasswordErrors[name]) {
            setPaymentPasswordErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validatePasswordForm = () => {
        const newErrors = {};
        if (!passwordData.oldPassword) newErrors.oldPassword = 'Old password is required.';
        if (!passwordData.newPassword) newErrors.newPassword = 'New password is required.';
        if (!passwordData.confirmNewPassword) newErrors.confirmNewPassword = 'Confirm new password is required.';

        if (passwordData.newPassword && passwordData.newPassword.length < 8) {
            newErrors.newPassword = 'New password must be at least 8 characters long.';
        }
        if (passwordData.newPassword && passwordData.confirmNewPassword && passwordData.newPassword !== passwordData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'New password and confirm new password do not match.';
        }
        setPasswordErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePaymentPasswordForm = () => {
        const newErrors = {};
        if (!paymentPasswordData.oldPaymentPassword) newErrors.oldPaymentPassword = 'Old payment password is required.';
        if (!paymentPasswordData.newPaymentPassword) newErrors.newPaymentPassword = 'New payment password is required.';
        if (!paymentPasswordData.confirmNewPaymentPassword) newErrors.confirmNewPaymentPassword = 'Confirm new payment password is required.';

        if (paymentPasswordData.newPaymentPassword && paymentPasswordData.newPaymentPassword.length < 8) {
            newErrors.newPaymentPassword = 'New payment password must be at least 8 characters long.';
        }
        if (paymentPasswordData.newPaymentPassword && paymentPasswordData.confirmNewPaymentPassword && paymentPasswordData.newPaymentPassword !== paymentPasswordData.confirmNewPaymentPassword) {
            newErrors.confirmNewPaymentPassword = 'New payment password and confirm new payment password do not match.';
        }
        setPaymentPasswordErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswordForm()) {
            return;
        }

        setLoadingPassword(true);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in.', { position: "top-right" });
                router.push('/login');
                return;
            }

            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(passwordData),
            });

            const data = await res.json();

            if (data.status === 'success') {
                toast.success(data.message, { position: "top-right" });
                setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
                setPasswordErrors({});
            } else {
                toast.error(data.message || 'Failed to update password.', { position: "top-right" });
                if (res.status === 401) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/login');
                }
            }
        } catch (err) {
            console.error('Error updating password:', err);
            toast.error('An unexpected error occurred while updating password.', { position: "top-right" });
        } finally {
            setLoadingPassword(false);
        }
    };

    const handlePaymentPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePaymentPasswordForm()) {
            return;
        }

        setLoadingPaymentPassword(true);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in.', { position: "top-right" });
                router.push('/login');
                return;
            }

            const res = await fetch('/api/user/payment-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(paymentPasswordData),
            });

            const data = await res.json();

            if (data.status === 'success') {
                toast.success(data.message, { position: "top-right" });
                setPaymentPasswordData({ oldPaymentPassword: '', newPaymentPassword: '', confirmNewPaymentPassword: '' });
                setPaymentPasswordErrors({});
            } else {
                toast.error(data.message || 'Failed to update payment password.', { position: "top-right" });
                if (res.status === 401) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/login');
                }
            }
        } catch (err) {
            console.error('Error updating payment password:', err);
            toast.error('An unexpected error occurred while updating payment password.', { position: "top-right" });
        } finally {
            setLoadingPaymentPassword(false);
        }
    };

    return (
        <WebsiteLayout>
            <div className="min-h-screen bg-gray-100 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
                    Security Settings
                </div>

                {/* Change Password Section */}
                <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg overflow-hidden p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Login Password</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="relative">
                            <label className="text-sm text-gray-600">Old Password</label>
                                    <input
                                type={showOldPassword ? "text" : "password"}
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordInputChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                disabled={loadingPassword}
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 cursor-pointer"
                                onClick={() => setShowOldPassword(!showOldPassword)}>
                                {showOldPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                            </span>
                            {passwordErrors.oldPassword && <p className="text-red-500 text-xs italic">{passwordErrors.oldPassword}</p>}
                                </div>

                        <div className="relative">
                            <label className="text-sm text-gray-600">New Password</label>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordInputChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                disabled={loadingPassword}
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 cursor-pointer"
                                onClick={() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                            </span>
                            {passwordErrors.newPassword && <p className="text-red-500 text-xs italic">{passwordErrors.newPassword}</p>}
                            </div>

                        <div className="relative">
                            <label className="text-sm text-gray-600">Confirm New Password</label>
                                    <input
                                type={showConfirmNewPassword ? "text" : "password"}
                                name="confirmNewPassword"
                                value={passwordData.confirmNewPassword}
                                onChange={handlePasswordInputChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                disabled={loadingPassword}
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 cursor-pointer"
                                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                                {showConfirmNewPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                            </span>
                            {passwordErrors.confirmNewPassword && <p className="text-red-500 text-xs italic">{passwordErrors.confirmNewPassword}</p>}
                        </div>

                            <button
                                type="submit"
                            disabled={loadingPassword}
                            className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
                                loadingPassword ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            >
                            {loadingPassword ? 'Updating Password...' : 'Update Login Password'}
                            </button>
                    </form>
                </div>

                {/* Change Payment Password Section */}
                <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg overflow-hidden p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Payment Password</h2>
                    <form onSubmit={handlePaymentPasswordSubmit} className="space-y-4">
                        <div className="relative">
                            <label className="text-sm text-gray-600">Old Payment Password</label>
                            <input
                                type={showOldPaymentPassword ? "text" : "password"}
                                name="oldPaymentPassword"
                                value={paymentPasswordData.oldPaymentPassword}
                                onChange={handlePaymentPasswordInputChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                disabled={loadingPaymentPassword}
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 cursor-pointer"
                                onClick={() => setShowOldPaymentPassword(!showOldPaymentPassword)}>
                                {showOldPaymentPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                            </span>
                            {paymentPasswordErrors.oldPaymentPassword && <p className="text-red-500 text-xs italic">{paymentPasswordErrors.oldPaymentPassword}</p>}
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-600">New Payment Password</label>
                            <input
                                type={showNewPaymentPassword ? "text" : "password"}
                                name="newPaymentPassword"
                                value={paymentPasswordData.newPaymentPassword}
                                onChange={handlePaymentPasswordInputChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                disabled={loadingPaymentPassword}
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 cursor-pointer"
                                onClick={() => setShowNewPaymentPassword(!showNewPaymentPassword)}>
                                {showNewPaymentPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                            </span>
                            {paymentPasswordErrors.newPaymentPassword && <p className="text-red-500 text-xs italic">{paymentPasswordErrors.newPaymentPassword}</p>}
                        </div>

                        <div className="relative">
                            <label className="text-sm text-gray-600">Confirm New Payment Password</label>
                            <input
                                type={showConfirmNewPaymentPassword ? "text" : "password"}
                                name="confirmNewPaymentPassword"
                                value={paymentPasswordData.confirmNewPaymentPassword}
                                onChange={handlePaymentPasswordInputChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                disabled={loadingPaymentPassword}
                            />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6 cursor-pointer"
                                onClick={() => setShowConfirmNewPaymentPassword(!showConfirmNewPaymentPassword)}>
                                {showConfirmNewPaymentPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                            </span>
                            {paymentPasswordErrors.confirmNewPaymentPassword && <p className="text-red-500 text-xs italic">{paymentPasswordErrors.confirmNewPaymentPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loadingPaymentPassword}
                            className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
                                loadingPaymentPassword ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {loadingPaymentPassword ? 'Updating Payment Password...' : 'Update Payment Password'}
                        </button>
                    </form>
                </div>
            </div>
        </WebsiteLayout>
    );
}
