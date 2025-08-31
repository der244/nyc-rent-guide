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
      
      // Create confetti burst
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      moneyBurst({ 
        x: centerX, 
        y: centerY, 
        count: 120, 
        spread: 80, 
        minDist: 180, 
        maxDist: 450 
      });

      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const moneyBurst = ({ x, y, count = 120, spread = 80, minDist = 180, maxDist = 450 }) => {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 9999;
    `;
    document.body.appendChild(container);

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.textContent = '$';
      el.style.cssText = `
        position: absolute;
        color: hsl(var(--primary));
        font-weight: 700;
        user-select: none;
        will-change: transform, opacity;
        left: ${x}px;
        top: ${y}px;
        font-size: ${12 + Math.random() * 10}px;
      `;

      // Random angle around straight-up (-90°) with spread
      const angle = (-90 + (Math.random() * 2 - 1) * spread) * (Math.PI / 180);
      const distance = minDist + Math.random() * (maxDist - minDist);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      // Rotation and timing
      const rot = (Math.random() * 720 - 360);
      const dur = 1200 + Math.random() * 800;
      const delay = Math.random() * 100;

      container.appendChild(el);

      // Web Animations API for smooth confetti burst
      const anim = el.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1, offset: 0 },
          { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 100}px) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.6 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0, offset: 1 }
        ],
        { 
          duration: dur, 
          delay, 
          easing: 'cubic-bezier(.22,.61,.36,1)', 
          fill: 'forwards' 
        }
      );

      anim.onfinish = () => el.remove();
    }

    // Clean up container after animation
    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
    }, 3000);
  };

  return null; // No JSX needed since we're creating elements directly
}