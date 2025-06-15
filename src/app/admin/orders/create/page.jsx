'use client';

import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function CreateOrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        _id: null,
        img: '',
        title: '',
        description: '',
        price: '',
        comission: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const response = await fetch(`/api/admin/order/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                const orderData = data.data;
                setFormData({
                    _id: orderData._id,
                    img: orderData.img || '',
                    title: orderData.title || '',
                    description: orderData.description || '',
                    price: orderData.price || '',
                    comission: orderData.comission || '',
                });
                setImagePreview(orderData.img || null);
            } else {
                setError(data.message || 'Failed to fetch order details');
                toast.error(data.message || 'Failed to fetch order details', { position: "top-right" });
                router.push('/admin/orders'); // Redirect back to orders list on error
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('An unexpected error occurred while fetching order details');
            toast.error('An unexpected error occurred while fetching order details', { position: "top-right" });
            router.push('/admin/orders'); // Redirect back to orders list on error
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error('File size exceeds 2MB limit.', { position: "top-right" });
                setImageFile(null);
                setImagePreview(null);
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({ ...prev, img: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
            setFormData(prev => ({ ...prev, img: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.img) newErrors.img = 'Image is required.';
        if (!formData.title) newErrors.title = 'Title is required.';
        if (!formData.description) newErrors.description = 'Description is required.';
        if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be a positive number.';
        if (!formData.comission || isNaN(formData.comission) || parseFloat(formData.comission) < 0) newErrors.comission = 'Commission must be a non-negative number.';
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('jwtToken');
            if (!token) {
                toast.error('No authentication token found. Please log in as admin.', { position: "top-right" });
                router.push('/admin-login');
                return;
            }

            const url = '/api/admin/order';
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.status === 'success') {
                toast.success(data.message, { position: "top-right" });
                router.push('/admin/orders');
            } else {
                setError(data.message || 'Failed to save order.');
                toast.error(data.message || 'Failed to save order.', { position: "top-right" });
                if (res.status === 401 || res.status === 403) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/admin-login');
                }
            }
        } catch (err) {
            console.error('Error saving order:', err);
            setError('An unexpected error occurred while saving order.');
            toast.error('An unexpected error occurred while saving order.', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 mb-5 text-center text-xl font-bold shadow-lg">
                {orderId ? 'Edit Order' : 'Create New Order'}
            </div>

            {/* Order Form */}
            <div className="bg-white mx-5 rounded-xl shadow-lg overflow-hidden p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="imageInput" className="block text-sm font-medium text-gray-700 mb-1">Order Image (Max 2MB):</label>
                        <input
                            type="file"
                            id="imageInput"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                            "
                        />
                        {formErrors.img && <p className="text-red-500 text-xs italic mt-1">{formErrors.img}</p>}
                        {(imagePreview || formData.img) && (
                            <div className="mt-4 flex items-center">
                                <Image
                                    src={imagePreview || formData.img}
                                    alt="Order Preview"
                                    width={100}
                                    height={100}
                                    objectFit="cover"
                                    className="rounded-md border border-gray-300"
                                />
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                            setFormData(prev => ({ ...prev, img: '' }));
                                            document.getElementById('imageInput').value = null;
                                        }}
                                        className="ml-3 text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        <FaTimesCircle className="inline-block mr-1" /> Clear
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {formErrors.title && <p className="text-red-500 text-xs italic mt-1">{formErrors.title}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                        {formErrors.description && <p className="text-red-500 text-xs italic mt-1">{formErrors.description}</p>}
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price:</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {formErrors.price && <p className="text-red-500 text-xs italic mt-1">{formErrors.price}</p>}
                    </div>

                    <div>
                        <label htmlFor="comission" className="block text-sm font-medium text-gray-700 mb-1">Commission:</label>
                        <input
                            type="number"
                            id="comission"
                            name="comission"
                            value={formData.comission}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {formErrors.comission && <p className="text-red-500 text-xs italic mt-1">{formErrors.comission}</p>}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-colors duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            {loading ? 'Saving...' : (orderId ? 'Update Order' : 'Create Order')}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/orders')}
                            className="flex-1 py-3 rounded-lg font-semibold transition-colors duration-300 bg-gray-300 text-gray-800 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 