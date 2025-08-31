import React, { useState, useEffect } from 'react';

interface DollarSplashProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function DollarSplash({ isVisible, onComplete }: DollarSplashProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="relative">
        {/* Multiple dollar signs with different animations */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute text-4xl font-bold text-primary animate-bounce select-none`}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s',
              transform: `rotate(${i * 45}deg) translateY(-${50 + i * 20}px)`,
              left: `${Math.cos((i * Math.PI) / 4) * 60}px`,
              top: `${Math.sin((i * Math.PI) / 4) * 60}px`,
            }}
          >
            $
          </div>
        ))}
        
        {/* Center burst effect */}
        <div className="absolute inset-0 animate-ping">
          <div className="w-16 h-16 bg-primary/20 rounded-full"></div>
        </div>
        
        {/* Main central dollar sign */}
        <div className="relative z-10 text-6xl font-bold text-primary animate-pulse">
          $
        </div>
      </div>
    </div>
  );
}