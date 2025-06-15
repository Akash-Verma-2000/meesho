'use client'
import WebsiteLayout from '@/components/WebsiteLayout';
import { FaRegFileAlt } from 'react-icons/fa';

export default function MessagePage() {
  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
          Messages
        </div>

        {/* No Records Section */}
        <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg flex flex-col items-center justify-center py-20 px-4">
          <FaRegFileAlt className="text-gray-400 text-6xl mb-4" />
          <p className="text-gray-600 text-lg font-medium">No records</p>
        </div>
      </div>
    </WebsiteLayout>
  );
}
