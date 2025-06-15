'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import Image from 'next/image';
import { FaChevronLeft, FaRegCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function InvitePage() {
    const invitationCode = "cff885";

    const handleCopy = () => {
        navigator.clipboard.writeText(invitationCode);
        toast.success('Copied successful!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    };

    return (
        <WebsiteLayout>
            <div className="min-h-screen bg-gray-100 pb-20">
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex items-center justify-center relative shadow-lg">
                    <span className="text-xl font-bold">Invite friend</span>
                </div>

                {/* QR Code Section */}
                <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg flex flex-col items-center py-10 px-4">
                    <div className="w-full max-w-xs aspect-square bg-gray-200 flex items-center justify-center p-4 rounded-lg">
                        <Image
                            src="/images/qr-code.png"
                            alt="QR Code"
                            width={300}
                            height={300}
                            priority
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <p className="text-gray-600 text-sm mt-6 mb-8 text-center">Invite friends and earn money together</p>

                    <div className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div>
                            <p className="text-lg font-bold text-gray-900">{invitationCode}</p>
                            <p className="text-sm text-gray-600">Invitation Code</p>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 flex items-center gap-2"
                        >
                            Copy <FaRegCopy className="text-xs" />
                        </button>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 mt-6">
                        Invite now
                    </button>
                </div>
            </div>
        </WebsiteLayout>
    );
}
