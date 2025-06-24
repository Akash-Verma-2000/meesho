import { useEffect, useRef, useState } from 'react';

export default function SampleWinnerSlider() {
    const listRef = useRef(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupImage, setPopupImage] = useState('');
    const [scrollAmount, setScrollAmount] = useState(0);

    // Duplicate the list for seamless infinite scroll
    const originalWinners = [
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
        {
            id: 1,
            name: "MACHA***NA",
            message: 'Withdrawal to account',
            amount: `₹${380423}.00`,
            image: "/images/Transaction1.jpg"
        },
        {
            id: 2,
            name: "Yash***AL",
            message: 'Withdrawal to account',
            amount: `₹${696023}.00`,
            image: "/images/Transaction2.jpg"
        },
        {
            id: 3,
            name: "Adit***K",
            message: 'Withdrawal to account',
            amount: `₹${36800}.00`,
            image: "/images/Transaction3.jpg"
        },
        {
            id: 4,
            name: "VISH***MA",
            message: 'Withdrawal to account',
            amount: `₹${41601}.00`,
            image: "/images/Transaction4.jpg"
        },
        {
            id: 5,
            name: "SAVI***RI",
            message: 'Withdrawal to account',
            amount: `₹${99880}.00`,
            image: "/images/Transaction5.jpg"
        },
        {
            id: 6,
            name: "Papp**AV",
            message: 'Withdrawal to account',
            amount: `₹${14000}.00`,
            image: "/images/Transaction6.jpg"
        },
    ];

    const displayWinners = [...originalWinners, ...originalWinners]; // Duplicate for infinite scroll

    useEffect(() => {
        if (!listRef.current) return;

        const itemHeight = 90 + 12; // Height of item + margin-bottom

        const interval = setInterval(() => {
            setScrollAmount(prevScrollAmount => {
                const newScrollAmount = prevScrollAmount + itemHeight;
                // If we scroll past the original list length, reset to create loop
                if (newScrollAmount >= originalWinners.length * itemHeight) {
                    return 0; // Reset to start
                }
                return newScrollAmount;
            });
        }, 2000); // Adjust scroll speed as needed

        return () => clearInterval(interval);
    }, [originalWinners.length]);

    return (
        <div className="bg-gray-100 my-8 md:my-12 px-4 sm:px-6 md:px-8 lg:px-20">
            <h2 className="text-xl font-semibold mb-3">Honor Roll</h2>
            <div className="overflow-hidden" style={{ height: 90 * 3 + 24 }}>
                <ul ref={listRef} className="transition-transform duration-300" style={{ transform: `translateY(-${scrollAmount}px)`, willChange: 'transform' }}>
                    {displayWinners.map((winner, idx) => (
                        <li
                            key={winner.id + '-' + idx}
                            className="flex items-center bg-white rounded-xl shadow-sm mb-3 px-6 py-4 min-h-[90px]"
                            style={{ marginBottom: idx === displayWinners.length - 1 ? 0 : 12 }}
                            onClick={() => {
                                setPopupImage(winner.image);
                                setShowPopup(true);
                            }}
                        >
                            <div className="flex-1">
                                <div className="font-semibold text-gray-800">{winner.name} <span className="font-normal text-gray-600">{winner.message}</span></div>
                                <div className="text-orange-500 text-xl font-bold mt-1">{winner.amount}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50">
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="relative p-4 rounded-lg max-w-full max-h-full">
                            <img src={popupImage} alt="Winner Transaction" className="max-w-full max-h-[80vh] object-contain" />
                        </div>
                    </div>
                    <button
                        className="absolute top-2 right-2 text-white text-3xl font-bold"
                        onClick={() => setShowPopup(false)}
                    >
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
}