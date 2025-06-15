'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaGlobe, FaMapMarkedAlt, FaCity, FaMapPin, FaRoad, FaBuilding } from 'react-icons/fa';

export default function AddressPage() {
    const router = useRouter();
    const [addressData, setAddressData] = useState({
        country: "",
        state: "",
        city: "",
        pinCode: "",
        addressLine1: "",
        addressLine2: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        const fetchAddressDetails = async () => {
            setLoading(true);
            setApiError(null);
            try {
                const token = sessionStorage.getItem('jwtToken');
                if (!token) {
                    toast.error('No authentication token found. Please log in.', { position: "top-right" });
                    router.push('/login');
                    return;
                }

                const res = await fetch('/api/user/address', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (data.status === 'success') {
                    setAddressData(data.data);
                    setIsEditing(false); // If data exists, start in view mode
                } else if (res.status === 404) {
                    // No address details found, user can add new ones
                    toast.info('No address details found. Please add your address.', { position: "top-right" });
                    setIsEditing(true); // Allow user to add new details
                } else {
                    setApiError(data.message || 'Failed to fetch address details.');
                    toast.error(data.message || 'Failed to fetch address details.', { position: "top-right" });
                    if (res.status === 401) {
                        sessionStorage.removeItem('jwtToken');
                        router.push('/login');
                    }
                }
            } catch (err) {
                console.error('Error fetching address details:', err);
                setApiError('An unexpected error occurred while fetching address details.');
                toast.error('An unexpected error occurred while fetching address details.', { position: "top-right" });
            } finally {
                setLoading(false);
            }
        };

        fetchAddressDetails();
    }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
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
        if (!addressData.country) newErrors.country = 'Country is required.';
        if (!addressData.state) newErrors.state = 'State is required.';
        if (!addressData.city) newErrors.city = 'City is required.';

        if (!addressData.pinCode) {
            newErrors.pinCode = 'PIN Code is required.';
        } else if (!/^[0-9]{6}$/.test(addressData.pinCode)) {
            newErrors.pinCode = 'Please enter a valid 6-digit PIN code.';
        }

        if (!addressData.addressLine1) newErrors.addressLine1 = 'Address Line 1 is required.';

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

            const res = await fetch('/api/user/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(addressData),
            });

            const data = await res.json();

            if (data.status === 'success') {
                toast.success(data.message, { position: "top-right" });
                setAddressData(data.data);
                setIsEditing(false);
            } else {
                setApiError(data.message || 'Failed to save address details.');
                toast.error(data.message || 'Failed to save address details.', { position: "top-right" });
                if (res.status === 401) {
                    sessionStorage.removeItem('jwtToken');
                    router.push('/login');
                }
            }
        } catch (err) {
            console.error('Error saving address details:', err);
            setApiError('An unexpected error occurred while saving address details.');
            toast.error('An unexpected error occurred while saving address details.', { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <WebsiteLayout>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <p>Loading address details...</p>
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
                    Address Details
        </div>

                {/* Address Details Form */}
        <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-1 md:px-5 py-5 lg:py-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaGlobe className="text-blue-500 text-xl" />
                <div className="flex-1">
                                    <label className="text-sm text-gray-600">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={addressData.country}
                    onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                                    {errors.country && <p className="text-red-500 text-xs italic">{errors.country}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <FaMapMarkedAlt className="text-blue-500 text-xl" />
                <div className="flex-1">
                                    <label className="text-sm text-gray-600">State</label>
                  <input
                    type="text"
                    name="state"
                    value={addressData.state}
                    onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                                    {errors.state && <p className="text-red-500 text-xs italic">{errors.state}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaCity className="text-blue-500 text-xl" />
                <div className="flex-1">
                                    <label className="text-sm text-gray-600">City</label>
                  <input
                    type="text"
                    name="city"
                    value={addressData.city}
                    onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                                    {errors.city && <p className="text-red-500 text-xs italic">{errors.city}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <FaMapPin className="text-blue-500 text-xl" />
                <div className="flex-1">
                                    <label className="text-sm text-gray-600">PIN Code</label>
                  <input
                    type="text"
                                        name="pinCode"
                                        value={addressData.pinCode}
                    onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                                    {errors.pinCode && <p className="text-red-500 text-xs italic">{errors.pinCode}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <FaRoad className="text-blue-500 text-xl" />
                <div className="flex-1">
                                    <label className="text-sm text-gray-600">Address Line 1</label>
                                    <input
                                        type="text"
                    name="addressLine1"
                    value={addressData.addressLine1}
                    onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    {errors.addressLine1 && <p className="text-red-500 text-xs italic">{errors.addressLine1}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <FaBuilding className="text-blue-500 text-xl" />
                <div className="flex-1">
                                    <label className="text-sm text-gray-600">Address Line 2 (Optional)</label>
                                    <input
                                        type="text"
                    name="addressLine2"
                    value={addressData.addressLine2}
                    onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    />
                                    {errors.addressLine2 && <p className="text-red-500 text-xs italic">{errors.addressLine2}</p>}
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
                                    Edit Address
                                </button>
                            )}

                            {isEditing && (
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
              >
                Save Address
              </button>
                            )}
            </div>
          </form>
        </div>
      </div>
    </WebsiteLayout>
  );
}
