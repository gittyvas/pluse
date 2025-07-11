// google-oauth-app/frontend/src/components/CustomCursor.jsx

import React, { useState, useEffect } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHoveringLink, setIsHoveringLink] = useState(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseOverLink = (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button') || e.target.classList.contains('cursor-pointer')) {
        setIsHoveringLink(true);
      }
    };

    const onMouseOutLink = (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button') || e.target.classList.contains('cursor-pointer')) {
        setIsHoveringLink(false);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOverLink);
    document.addEventListener('mouseout', onMouseOutLink);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOverLink);
      document.removeEventListener('mouseout', onMouseOutLink);
    };
  }, []);

  return (
    <div
      className={`
        fixed inset-0 pointer-events-none z-[9999]
        flex items-center justify-center
        transition-all duration-100 ease-out
        ${isHoveringLink ? 'scale-150 opacity-75' : 'scale-100 opacity-100'}
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%)`, /* Center the dot on the cursor */
      }}
    >
      <div
        className={`
          w-3 h-3 rounded-full bg-emerald-500
          transition-all duration-100 ease-out
          ${isHoveringLink ? 'w-5 h-5' : 'w-3 h-3'}
        `}
      ></div>
    </div>
  );
};

export default CustomCursor;
