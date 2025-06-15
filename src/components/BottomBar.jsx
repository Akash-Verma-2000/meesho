import Link from 'next/link';
import { FaHome, FaFileAlt, FaBolt, FaPlusCircle, FaUser } from 'react-icons/fa';

export default function BottomBar(){
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-xl border-t border-gray-100 z-50 h-20 py-2">
            <div className="flex justify-around items-center h-full max-w-lg mx-auto relative">
                {/* Home */}
                <Link href="/" className="flex flex-col items-center justify-center text-blue-600 text-xs font-extrabold w-1/5 pt-4">
                    <FaHome className="text-xl mb-1" />
                    <span>Home</span>
                </Link>

                {/* Order */}
                <Link href="/order" className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors duration-200 text-xs font-medium w-1/5 pt-4">
                    <FaFileAlt className="text-xl mb-1" />
                    <span>Order</span>
                </Link>

                {/* Center Button */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-8 flex items-center justify-center">
                    <Link href="/grab" className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 shadow-2xl text-white transition-transform duration-200 hover:scale-110 border-4 border-white">
                        <FaBolt className="text-3xl" />
                    </Link>
                </div>

                {/* Recharge */}
                <Link href="/recharge" className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors duration-200 text-xs font-medium w-1/5 pt-4">
                    <FaPlusCircle className="text-xl mb-1" />
                    <span>Recharge</span>
                </Link>

                {/* Account */}
                <Link href="/account" className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors duration-200 text-xs font-medium w-1/5 pt-4">
                    <FaUser className="text-xl mb-1" />
                    <span>Account</span>
                </Link>
            </div>
        </div>
    );
}