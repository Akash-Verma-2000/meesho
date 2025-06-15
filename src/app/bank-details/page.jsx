'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { FaUniversity, FaUser, FaBuilding, FaHashtag, FaBarcode, FaWallet } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function BankDetailsPage() {
    const router = useRouter();
    const [bankData, setBankData] = useState({
        bankName: "",
        accountHolderName: "",
        branchName: "",
        accountNumber: "",
        ifscCode: "",
        type: "savings"
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        const fetchBankDetails = async () => {
            setLoading(true);
            setApiError(null);
            try {
                const token = sessionStorage.getItem('jwtToken');
                if (!token) {
                    toast.error('No authentication token found. Please log in.', { position: "top-right" });
                    router.push('/login');
                    return;
                }

                const res = await fetch('/api/user/bank', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (data.status === 'success') {
                    setBankData(data.data);
                    setIsEditing(false); // If data exists, start in view mode
                } else if (res.status === 404) {
                    // No bank details found, user can add new ones
                    toast.info('No bank details found. Please add your bank details.', { position: "top-right" });
                    setIsEditing(true); // Allow user to add new details
                } else {
                    setApiError(data.message || 'Failed to fetch bank details.');
                    toast.error(data.message || 'Failed to fetch bank details.', { position: "top-right" });
                    if (res.status === 401) {
                        sessionStorage.removeItem('jwtToken');
                        router.push('/login');
                    }
                }
            } catch (err) {
                console.error('Error fetching bank details:', err);
                setApiError('An unexpected error occurred while fetching bank details.');
                toast.error('An unexpected error occurred while fetching bank details.', { position: "top-right" });
            } finally {
                setLoading(false);
            }
        };

        fetchBankDetails();
    }, [router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBankData(prev => ({
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
        if (!bankData.accountHolderName) newErrors.accountHolderName = 'Account Holder Name is required.';
        if (!bankData.bankName) newErrors.bankName = 'Bank Name is required.';
        if (!bankData.branchName) newErrors.branchName = 'Branch Name is required.';

        if (!bankData.accountNumber) {
            newErrors.accountNumber = 'Account Number is required.';
        } else if (!/^\d{9,18}$/.test(bankData.accountNumber)) {
            newErrors.accountNumber = 'Please enter a valid account number (9-18 digits).';
        }

        if (!bankData.ifscCode) {
            newErrors.ifscCode = 'IFSC Code is required.';
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankData.ifscCode.toUpperCase())) {
            newErrors.ifscCode = 'Please enter a valid IFSC code (e.g., ABCD0123456).';
        }

        if (!bankData.type) {
            newErrors.type = 'Account Type is required.';
        } else if (bankData.type !== 'savings' && bankData.type !== 'current') {
            newErrors.type = 'Invalid account type. Must be savings or current.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

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

            const res = await fetch('/api/user/bank', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(bankData),
            });

            const data = await res.json();

            if (data.status === 'success') {
                toast.success(data.message, { position: "top-right" });
                setBankData(data.data);
                setIsEditing(false);
            } else {
                setApiError(data.message || 'Failed to save bank details.');
                toast.error(data.message || 'Failed to save bank details.', { position: "top-right" });
                if (res.status === 401) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/login');
                }
            }
        } catch (err) {
            console.error('Error saving bank details:', err);
            setApiError('An unexpected error occurred while saving bank details.');
            toast.error('An unexpected error occurred while saving bank details.', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <WebsiteLayout>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <p>Loading bank details...</p>
                </div>
            </WebsiteLayout>
        );
    }

    if (apiError) {
        return (
            <WebsiteLayout>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <p className="text-red-600">Error: {apiError}</p>
                </div>
            </WebsiteLayout>
        );
    }

    return (
        <WebsiteLayout>
            <div className="min-h-screen bg-gray-100 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
                    Bank Details
                </div>

                {/* Bank Details Form */}
                <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-1 md:px-5 py-5 lg:py-10">
                        {/* Bank Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <FaUniversity className="text-blue-500 text-xl" />
                                <div className="flex-1">
                                    <label className="text-sm text-gray-600">Bank Name</label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={bankData.bankName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    {errors.bankName && <p className="text-red-500 text-xs italic">{errors.bankName}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <FaUser className="text-blue-500 text-xl" />
                                <div className="flex-1">
                                    <label className="text-sm text-gray-600">Account Holder Name</label>
                                    <input
                                        type="text"
                                        name="accountHolderName"
                                        value={bankData.accountHolderName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    {errors.accountHolderName && <p className="text-red-500 text-xs italic">{errors.accountHolderName}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <FaBuilding className="text-blue-500 text-xl" />
                                <div className="flex-1">
                                    <label className="text-sm text-gray-600">Branch Name</label>
                                    <input
                                        type="text"
                                        name="branchName"
                                        value={bankData.branchName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    {errors.branchName && <p className="text-red-500 text-xs italic">{errors.branchName}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <FaHashtag className="text-blue-500 text-xl" />
                                <div className="flex-1">
                                    <label className="text-sm text-gray-600">Account Number</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={bankData.accountNumber}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    {errors.accountNumber && <p className="text-red-500 text-xs italic">{errors.accountNumber}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <FaBarcode className="text-blue-500 text-xl" />
                                <div className="flex-1">
                                    <label className="text-sm text-gray-600">IFSC Code</label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        value={bankData.ifscCode}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    {errors.ifscCode && <p className="text-red-500 text-xs italic">{errors.ifscCode}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <FaWallet className="text-blue-500 text-xl" />
                                <div className="flex-1">
                                    <label className="text-sm text-gray-600">Account Type</label>
                                    <select
                                        name="type"
                                        value={bankData.type}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    >
                                        <option value="savings">Savings</option>
                                        <option value="current">Current</option>
                                    </select>
                                    {errors.type && <p className="text-red-500 text-xs italic">{errors.type}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3 m-3">
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-300"
                                >
                                    Edit Details
                                </button>
                            )}

                            {isEditing && (
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                                >
                                    Save Changes
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </WebsiteLayout>
    );
}
