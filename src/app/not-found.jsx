import Link from 'next/link';
import Image from 'next/image';
import WebsiteLayout from '@/components/WebsiteLayout';

export default function NotFound() {
    return (
        <WebsiteLayout>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div>

                        <h2 className="mt-6 text-6xl font-extrabold text-gray-900">
                            404
                        </h2>
                        <p className="mt-2 text-2xl font-semibold text-gray-600">
                            Page Not Found
                        </p>
                        <p className="mt-2 text-gray-500">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                    </div>

                    <div className="mt-8">
                        <Link
                            href="/"
                            className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
                        >
                            <span className=" left-0 inset-y-0 flex items-center me-1">
                                <svg
                                    className="h-5 w-5 text-white group-hover:text-white/90"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </span>
                            Back to Home
                        </Link>
                    </div>

                
                </div>
            </div>
        </WebsiteLayout>
    );
} 