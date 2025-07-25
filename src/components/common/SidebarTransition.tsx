import React, { useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarTransitionProps {
  open: boolean;
  onClose: () => void;
  reverse?: boolean;
}

const SidebarTransition: React.FC<SidebarTransitionProps> = memo(({ open, onClose, reverse = false }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
        navigate(reverse ? '/articles' : '/journals');
      }, 600); // Duration matches CSS transition
      return () => clearTimeout(timer);
    }
  }, [open, onClose, navigate, reverse]);

  return (
    <div
      className="fixed inset-0 z-30"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      {/* Slide-in blue panel, no content, behind navbar */}
      <div
        className={`fixed top-0 ${reverse ? 'left-0' : 'right-0'} h-full w-full transition-transform duration-[600ms] will-change-transform ${open ? 'translate-x-0' : reverse ? '-translate-x-full' : 'translate-x-full'}`}
        style={{ zIndex: 30, backgroundColor: 'rgb(94, 163, 236)' }}
      />
    </div>
  );
});

export default SidebarTransition;
