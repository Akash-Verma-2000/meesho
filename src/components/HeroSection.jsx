'use client'
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [autoSlide, setAutoSlide] = useState(true);

    // Sample banner images array
    const banners = [
        "/images/Banner4.jpg",
        "/images/Banner2.jpg",
        "/images/Banner3.jpg",
        "/images/Banner5.jpg",
        "/images/Banner1.jpg",
    ];

    // Auto slide functionality
    useEffect(() => {
        if (!autoSlide) return;
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) =>
                prevSlide === banners.length - 1 ? 0 : prevSlide + 1
            );
        }, 3000);
        return () => clearInterval(interval);
    }, [autoSlide, banners.length]);

    // Drag/Swipe Handlers
    const handleDragStart = (e) => {
        setIsDragging(true);
        setAutoSlide(false);
        setStartX(e.type === 'touchstart' ? e.touches[0].clientX : e.clientX);
    };
    const handleDragMove = (e) => {
        if (!isDragging) return;
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        setTranslateX(clientX - startX);
    };
    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (translateX > 50 && currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        } else if (translateX < -50 && currentSlide < banners.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
        setTranslateX(0);
        setTimeout(() => setAutoSlide(true), 500); // Resume auto-slide after short delay
    };

    return (
        <div
            className="relative overflow-hidden"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(calc(-${currentSlide * 100}% + ${isDragging ? translateX : 0}px))` }}
            >
                {banners.map((banner, index) => (
                    <div
                        key={index}
                        className="min-w-full h-[150px] md:h-[250px] lg:h-[350px] xl:h-[500px]"
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