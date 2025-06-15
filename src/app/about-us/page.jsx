'use client'
import WebsiteLayout from '@/components/WebsiteLayout';

export default function AboutUsPage() {
  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-gray-100 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 text-center text-xl font-bold shadow-lg">
          About Us
        </div>

        {/* Content */}
        <div className="bg-white mx-5 md:mx-10 lg:mx-20 mt-6 rounded-xl shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-3">Welcome to Jio!</h2>
          <p className="mb-3">Jio is an Indian e-commerce company, headquartered in Bengaluru, Karnataka, India. It was founded by Vidit Aatrey and Sanjeev Barnwal in December 2015.</p>
          <p className="mb-3">Our mission is to enable anyone to start their online business with zero investment.</p>
          <p className="mb-3">We provide a platform that connects suppliers and resellers, empowering individuals to become entrepreneurs and achieve financial independence.</p>
          <p className="mb-3">Thank you for being a part of our journey.</p>
        </div>
      </div>
    </WebsiteLayout>
  );
} 