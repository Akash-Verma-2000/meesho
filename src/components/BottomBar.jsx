'use client'
import Link from 'next/link';
import { FaHome, FaFileAlt, FaBolt, FaPlusCircle, FaUser } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

export default function BottomBar() {
    const pathname = usePathname();
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-xl border-t border-gray-100 z-50 h-20 py-2">
            <div className="flex justify-around items-center h-full max-w-lg mx-auto relative">
                {/* Home */}
                <Link href="/" className={`flex flex-col items-center justify-center text-xs font-extrabold w-1/5 pt-4 ${pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600 transition-colors duration-200'}`}>
                    <FaHome className="text-xl mb-1" />
                    <span>Home</span>
                </Link>

                {/* Order */}
                <Link href="/order" className={`flex flex-col items-center justify-center text-xs font-medium w-1/5 pt-4 ${pathname.startsWith('/order') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600 transition-colors duration-200'}`}>
                    <FaFileAlt className="text-xl mb-1" />
                    <span>Order</span>
                </Link>

                {/* Center Button */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-8 flex items-center justify-center">
                    <Link href="/grab" className={`flex items-center justify-center w-16 h-16 rounded-full shadow-2xl text-white transition-transform duration-200 hover:scale-110 border-4 border-white ${pathname.startsWith('/grab') ? 'bg-blue-700' : 'bg-blue-600'}`}>
                        <span className='text-2xl font-semibold'>
                            GO
                        </span>
                    </Link>
                </div>

                {/* Recharge */}
                <Link href="/recharge" className={`flex flex-col items-center justify-center text-xs font-medium w-1/5 pt-4 ${pathname.startsWith('/recharge') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600 transition-colors duration-200'}`}>
                    <FaPlusCircle className="text-xl mb-1" />
                    <span>Recharge</span>
                </Link>

                {/* Account */}
                <Link href="/account" className={`flex flex-col items-center justify-center text-xs font-medium w-1/5 pt-4 ${pathname.startsWith('/account') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600 transition-colors duration-200'}`}>
                    <FaUser className="text-xl mb-1" />
                    <span>Account</span>
                </Link>
            </div>
        </div>
    );
}