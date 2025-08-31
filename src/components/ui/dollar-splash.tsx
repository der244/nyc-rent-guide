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
      
      // Create subtle confetti burst
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      moneyBurst({ 
        x: centerX, 
        y: centerY, 
        count: 8, 
        spread: 45, 
        minDist: 40, 
        maxDist: 80 
      });

      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const moneyBurst = ({ x, y, count = 8, spread = 45, minDist = 40, maxDist = 80 }) => {
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
        font-weight: 600;
        user-select: none;
        will-change: transform, opacity;
        left: ${x}px;
        top: ${y}px;
        font-size: ${8 + Math.random() * 4}px;
      `;

      // Very subtle spread
      const angle = (-90 + (Math.random() * 2 - 1) * spread) * (Math.PI / 180);
      const distance = minDist + Math.random() * (maxDist - minDist);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      const rot = (Math.random() * 180 - 90); // Gentler rotation
      const dur = 600 + Math.random() * 200;  // Shorter duration
      const delay = Math.random() * 50;       // Minimal stagger

      container.appendChild(el);

      const anim = el.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 0.8, offset: 0 },
          { transform: `translate(${dx * 0.7}px, ${dy * 0.7 - 20}px) rotate(${rot * 0.5}deg)`, opacity: 0.6, offset: 0.7 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0, offset: 1 }
        ],
        { 
          duration: dur, 
          delay, 
          easing: 'ease-out', 
          fill: 'forwards' 
        }
      );

      anim.onfinish = () => el.remove();
    }

    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
    }, 1000);
  };

  return null;
}