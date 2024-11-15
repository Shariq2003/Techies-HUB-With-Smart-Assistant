import React, { useEffect, useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

let scrollInterval; // Global variable to store the scroll interval

const ScrollBottomToTop = () => {
    const [showButton, setShowButton] = useState(false);

    const scrollToTop = () => {
        // Clear any existing scroll intervals before starting a new one
        if (scrollInterval) clearInterval(scrollInterval);

        scrollInterval = setInterval(() => {
            if (window.scrollY === 0) {
                clearInterval(scrollInterval);
            } else {
                window.scrollBy(0, -50); // Scroll by 50px at a time
            }
        }, 15); // Smooth scrolling with 15ms interval
    };

    const handleScroll = () => {
        if (window.scrollY > 100) {
            setShowButton(true);
        } else {
            setShowButton(false);
        }
    };

    // Stop automatic scrolling on manual scroll
    const stopAutoScrollOnManualScroll = () => {
        if (scrollInterval) clearInterval(scrollInterval);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("wheel", stopAutoScrollOnManualScroll); // Detect wheel scroll
        window.addEventListener("touchmove", stopAutoScrollOnManualScroll); // Detect touch scroll
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("wheel", stopAutoScrollOnManualScroll);
            window.removeEventListener("touchmove", stopAutoScrollOnManualScroll);
        };
    }, []);

    return (
        showButton && (
            <button
                onClick={scrollToTop}
                className="fixed bottom-[80px] right-[20px] bg-blue-600 text-white rounded-lg p-2 cursor-pointer shadow-lg opacity-80 hover:bg-blue-800 hover:opacity-100 transition-opacity duration-300 z-50"
            >
                <FaArrowUp />
            </button>
        )
    );
};

const ScrollTopToBottom = () => {
    const [showButton, setShowButton] = useState(false);

    const scrollToBottom = () => {
        // Clear any existing scroll intervals before starting a new one
        if (scrollInterval) clearInterval(scrollInterval);

        const totalHeight = document.documentElement.scrollHeight;
        const currentScroll = window.scrollY;
        const scrollStep = (totalHeight - currentScroll) / (500 / 5); // Divide by a fixed value for smoother scroll speed

        scrollInterval = setInterval(() => {
            const newScroll = window.scrollY + scrollStep;
            window.scrollTo(0, newScroll);

            if (window.scrollY >= totalHeight - window.innerHeight) {
                clearInterval(scrollInterval);
            }
        }, 15); // Interval for smooth scroll
    };

    const handleScroll = () => {
        const bottomThreshold =
            document.documentElement.scrollHeight - window.innerHeight - 100;
        if (window.scrollY < bottomThreshold) {
            setShowButton(true);
        } else {
            setShowButton(false);
        }
    };

    // Stop automatic scrolling on manual scroll
    const stopAutoScrollOnManualScroll = () => {
        if (scrollInterval) clearInterval(scrollInterval);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("wheel", stopAutoScrollOnManualScroll); // Detect wheel scroll
        window.addEventListener("touchmove", stopAutoScrollOnManualScroll); // Detect touch scroll
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("wheel", stopAutoScrollOnManualScroll);
            window.removeEventListener("touchmove", stopAutoScrollOnManualScroll);
        };
    }, []);

    return (
        <>
            {showButton && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-[20px] right-[20px] bg-blue-600 text-white rounded-lg p-2 cursor-pointer shadow-lg opacity-80 hover:bg-blue-800 hover:opacity-100 transition-opacity duration-300 z-50"
                >
                    <FaArrowDown />
                </button>
            )}
            <div id="scroll-target" style={{ height: '1px' }} />
        </>
    );
};

export { ScrollBottomToTop, ScrollTopToBottom };
