'use client';

import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaUpload, FaTimesCircle } from 'react-icons/fa';

export default function AdminPaymentSettingsPage() {
    const router = useRouter();
    const [qrCodeFile, setQrCodeFile] = useState(null);
    const [qrCodePreview, setQrCodePreview] = useState(null);
    const [existingQrCode, setExistingQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPaymentSettings();
    }, []);

    const fetchPaymentSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const response = await fetch('/api/admin/payment-settings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.status === 'success') {
                if (data.data && data.data.qrCodeBase64) {
                    setExistingQrCode(data.data.qrCodeBase64);
                }
            } else {
                setError(data.message || 'Failed to fetch existing payment settings.');
                toast.error(data.message || 'Failed to fetch existing payment settings.', { position: "top-right" });
                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/admin-login');
                }
            }
        } catch (err) {
            console.error('Error fetching payment settings:', err);
            setError('An unexpected error occurred while fetching payment settings.');
            toast.error('An unexpected error occurred while fetching payment settings.', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error('File size exceeds 2MB limit.', { position: "top-right" });
                setQrCodeFile(null);
                setQrCodePreview(null);
                return;
            }
            setQrCodeFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrCodePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setExistingQrCode(null); // Clear existing QR when a new one is selected
        } else {
            setQrCodeFile(null);
            setQrCodePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!qrCodeFile) {
            toast.error('Please select a QR code image to upload.', { position: "top-right" });
            return;
        }

        setUploading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(qrCodeFile);
            reader.onloadend = async () => {
                const base64String = reader.result;

                const res = await fetch('/api/admin/payment-settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ qrCodeBase64: base64String }),
                });

                const data = await res.json();

                if (data.status === 'success') {
                    toast.success(data.message, { position: "top-right" });
                    setExistingQrCode(data.data.qrCodeBase64);
                    setQrCodeFile(null);
                    setQrCodePreview(null);
                } else {
                    setError(data.message || 'Failed to upload QR code.');
                    toast.error(data.message || 'Failed to upload QR code.', { position: "top-right" });
                    if (res.status === 401 || res.status === 403) {
                        sessionStorage.removeItem('jwtToken');
                        router.push('/admin-login');
                    }
                }
                setUploading(false);
            };
            reader.onerror = () => {
                setError('Failed to read file.');
                toast.error('Failed to read file.', { position: "top-right" });
                setUploading(false);
            };

        } catch (err) {
            console.error('Error uploading QR code:', err);
            setError('An unexpected error occurred while uploading QR code.');
            toast.error('An unexpected error occurred while uploading QR code.', { position: "top-right" });
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p>Loading payment settings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 mb-5 text-center text-xl font-bold shadow-lg">
                Admin Payment Settings
            </div>

            {/* Upload QR Code Section */}
            <div className="bg-white mx-5 rounded-xl shadow-lg overflow-hidden p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload QR Code for Recharge</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="qrCodeInput" className="block text-sm font-medium text-gray-700 mb-2">Select QR Code Image (Max 2MB):</label>
                        <input
                            type="file"
                            id="qrCodeInput"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                "
                        />
                    </div>

                    {(qrCodePreview || existingQrCode) && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 flex flex-col items-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">Current QR Code:</p>
                            <div className="w-48 h-48 relative border border-gray-300 flex items-center justify-center bg-white rounded-md">
                                <Image
                                    src={qrCodePreview || existingQrCode}
                                    alt="QR Code Preview"
                                    layout="fill"
                                    objectFit="contain"
                                    className="rounded-md"
                                />
                            </div>
                            {qrCodePreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQrCodeFile(null);
                                        setQrCodePreview(null);
                                        document.getElementById('qrCodeInput').value = null;
                                        fetchPaymentSettings(); // Re-fetch to show existing if any
                                    }}
                                    className="mt-3 flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors duration-200"
                                >
                                    <FaTimesCircle className="mr-2" /> Clear Selected
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || !qrCodeFile}
                        className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${uploading || !qrCodeFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {uploading ? 'Uploading...' : 'Upload QR Code'}
                    </button>
                </form>
            </div>
        </div>
    );
}