import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate random stars for the galaxy background - reduced count for performance
    const newStars = Array.from({ length: 40 }).map(() => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 30 + 15,
      delay: Math.random() * 5
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none bg-[#020617]">
      {/* Dynamic Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full opacity-50"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            willChange: "transform, opacity"
          }}
          animate={{
            y: ['0%', '-30%', '0%'],
            opacity: [0.1, 0.8, 0.1]
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "linear",
            delay: star.delay
          }}
        />
      ))}

      {/* Animated Glowing Orbs (Nebula effect) */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute top-[30%] right-[-10%] w-[35%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-blue-600/20 blur-[150px] rounded-full"
        animate={{ scale: [1, 1.3, 1], y: [0, -50, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[60%] left-[10%] w-[30%] h-[30%] bg-teal-600/10 blur-[100px] rounded-full"
        animate={{ scale: [1, 1.5, 1], x: [0, 50, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default AnimatedBackground;
