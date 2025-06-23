import { useEffect, useRef } from 'react';

// Utility to generate masked names and random amounts
function generateSampleWinners(count) {
    const names = [
        'Shivis', 'Karthik', 'Moumita', 'Rohit', 'Priya', 'Ankit', 'Sneha', 'Amit', 'Riya', 'Sourav',
        'Neha', 'Vikas', 'Pooja', 'Deepak', 'Anjali', 'Rahul', 'Simran', 'Arjun', 'Divya', 'Manish',
        'Ayesha', 'Nitin', 'Kiran', 'Suman', 'Rakesh', 'Meena', 'Sandeep', 'Komal', 'Vivek', 'Nisha',
        'Aman', 'Preeti', 'Sahil', 'Rashmi', 'Raj', 'Payal', 'Gaurav', 'Swati', 'Harsh', 'Tina',
        'Yash', 'Shreya', 'Abhishek', 'Isha', 'Varun', 'Tanvi', 'Rajat', 'Kavya', 'Siddharth', 'Juhi'
    ];
    const winners = [];
    for (let i = 0; i < count; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const masked = name.slice(0, 3) + '***' + name.slice(-1);
        const amount = (Math.floor(Math.random() * 900000) + 10000).toLocaleString('en-IN');
        winners.push({
            id: i,
            name: masked,
            message: 'Withdrawal to account',
            amount: `₹${amount}.00`,
        });
    }
    return winners;
}

const WINNERS = generateSampleWinners(1000);

export default function SampleWinnerSlider() {
    const listRef = useRef(null);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;
        let scrollAmount = 0;
        let animationFrame;
        let itemHeight = list.firstChild ? list.firstChild.offsetHeight : 0;
        let totalHeight = itemHeight * WINNERS.length;

        function animate() {
            scrollAmount += 0.5; // Adjust speed here
            if (scrollAmount >= totalHeight) {
                scrollAmount = 0;
            }
            list.style.transform = `translateY(-${scrollAmount}px)`;
            animationFrame = requestAnimationFrame(animate);
        }
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    // Duplicate the list for seamless infinite scroll
    const displayWinners = [...WINNERS, ...WINNERS.slice(0, 10)];

    return (
        <div className="bg-gray-100 my-8 md:my-12 px-4 sm:px-6 md:px-8 lg:px-20">
            <h2 className="text-xl font-semibold mb-3">Honor Roll</h2>
            <div className="overflow-hidden" style={{ height: 90 * 3 + 24 }}>
                <ul ref={listRef} className="transition-transform duration-300" style={{ willChange: 'transform' }}>
                    {displayWinners.map((winner, idx) => (
                        <li
                            key={winner.id + '-' + idx}
                            className="flex items-center bg-white rounded-xl shadow-sm mb-3 px-6 py-4 min-h-[90px]"
                            style={{ marginBottom: idx === displayWinners.length - 1 ? 0 : 12 }}
                        >
                            <div className="flex-1">
                                <div className="font-semibold text-gray-800">{winner.name} <span className="font-normal text-gray-600">{winner.message}</span></div>
                                <div className="text-orange-500 text-xl font-bold mt-1">{winner.amount}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}