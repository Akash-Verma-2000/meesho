'use client'
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Sample banner images array
    const banners = [
        "/images/Banner.jpg",
        "/images/Banner.jpg",
        "/images/Banner.jpg",
        "/images/Banner.jpg"
    ];

    // Auto slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) =>
                prevSlide === banners.length - 1 ? 0 : prevSlide + 1
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative overflow-hidden">
            <div
                className="flex transition-transform duration-500 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {banners.map((banner, index) => (
                    <div
                        key={index}
                        className="min-w-full h-full"
                    >
                        <Image
                            width={1920}
                            height={1920}
                            src={banner}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}