import React, { useState, useEffect } from 'react';

const Carousel = ({ components, headers }: { components: React.ReactNode[], headers: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animationClass, setAnimationClass] = useState('');

    const handlePrev = () => {
        setAnimationClass('slide-out-to-right');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex === 0 ? components.length - 1 : prevIndex - 1));
            setAnimationClass('slide-in-from-left');
        }, 500); // Match the duration of the animation
    };

    const handleNext = () => {
        setAnimationClass('slide-out-to-left');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex === components.length - 1 ? 0 : prevIndex + 1));
            setAnimationClass('slide-in-from-right');
        }, 500); // Match the duration of the animation
    };

    useEffect(() => {
        if (animationClass.includes('slide-in')) {
            const timer = setTimeout(() => {
                setAnimationClass('');
            }, 500); // Match the duration of the animation
            return () => clearTimeout(timer);
        }
    }, [animationClass]);

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center px-8"> {/* Added flex-col */}
            <h2 className="text-2xl font-bold mb-4 text-muted-foreground">{headers[currentIndex]}</h2> {/* Header */}
            <div className="relative w-full h-full flex items-center justify-center">
                <button 
                    onClick={handlePrev} 
                    className="absolute left-8 transform -translate-y-1/2 z-10" // Adjusted left position
                    style={{ top: '50%' }}
                >
                    <span className="material-icons transition duration-300 ease-in-out hover:scale-110 text-foreground" style={{ fontSize: '45px' }}>arrow_back_ios</span>
                </button>
                <div className={`flex justify-center items-center w-full ${animationClass}`}>
                    {components[currentIndex]}
                </div>
                <button 
                    onClick={handleNext} 
                    className="absolute right-8 transform -translate-y-1/2 z-10" // Adjusted right position
                    style={{ top: '50%' }}
                >
                    <span className="material-icons transition duration-300 ease-in-out hover:scale-110 text-foreground" style={{ fontSize: '45px' }}>arrow_forward_ios</span>
                </button>
            </div>
        </div>
    );
};

export default Carousel;