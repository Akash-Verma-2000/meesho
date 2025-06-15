'use client'
import { useState } from 'react';
import AdminHeader from "@/components/AdminHeader";
import AdminTopBar from "@/components/AdminTopBar";

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-200">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar - always fixed, slides for mobile, visible on desktop */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-white z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <AdminHeader setSidebarOpen={setSidebarOpen} />
            </div>

            {/* Main Content Area - shifts to right on desktop to clear fixed sidebar */}
            <div className="flex-1 flex flex-col md:ml-64">
                {/* Top Bar - sticky at the top, spans full width of flex-1 parent */}
                <div className="sticky top-0 z-20 bg-white shadow-md p-4 flex justify-between items-center h-20 w-full">
                    <AdminTopBar setSidebarOpen={setSidebarOpen} />
                </div>

                {/* Content Section - occupies remaining vertical space */}
                <section className="flex-1 p-2 md:p-5">
                    {/* Inner Content Container */}
                    <div className="bg-white shadow rounded-lg min-h-screen p-5">
                        {children}
                    </div>
                </section>
            </div>
        </div>
    );
} 