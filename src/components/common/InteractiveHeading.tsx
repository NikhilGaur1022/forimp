import React, { useRef, useEffect, useState } from 'react';

interface InteractiveHeadingProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const InteractiveHeading: React.FC<InteractiveHeadingProps> = ({ children, className = '', style }) => {
  const headingRef = useRef<HTMLSpanElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });
  const [isDark, setIsDark] = useState(false);
  const rAF = useRef<number>();

  useEffect(() => {
    // Detect dark mode
    const match = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(match.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    match.addEventListener('change', handler);
    return () => match.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    let mouseX = 50, mouseY = 50;
    let animating = false;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 100;
      mouseY = ((e.clientY - rect.top) / rect.height) * 100;
      if (!animating) {
        animating = true;
        rAF.current = requestAnimationFrame(updateGlow);
      }
    };
    const onEnter = () => setGlow(g => ({ ...g, opacity: 1 }));
    const onLeave = () => setGlow(g => ({ ...g, opacity: 0 }));

    function updateGlow() {
      setGlow(g => ({
        x: g.x + (mouseX - g.x) * 0.18,
        y: g.y + (mouseY - g.y) * 0.18,
        opacity: g.opacity,
      }));
      animating = false;
    }

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      if (rAF.current) cancelAnimationFrame(rAF.current);
    };
  }, []);

  // The trick: duplicate the text, one for the glow (background-clip: text, color: transparent, with a moving radial gradient), one for the real text
  return (
    <span
      ref={headingRef}
      className={`relative inline-block interactive-heading ${className}`}
      style={{ isolation: 'isolate', ...style }}
    >
      {/* Glow inside text */}
      <span
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          opacity: glow.opacity,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          background: `radial-gradient(240px 120px at ${glow.x}% ${glow.y}%, ${isDark ? 'rgba(56,189,248,0.55)' : 'rgba(56,189,248,0.85)'} 0%, transparent 85%)`,
          transition: 'opacity 0.25s cubic-bezier(.4,2,.6,1)',
          filter: 'blur(0.5px)',
          font: 'inherit',
          whiteSpace: 'pre',
        }}
      >
        {children}
      </span>
      {/* Real text above */}
      <span className="relative z-10" style={{ display: 'inline-block', position: 'relative' }}>{children}</span>
    </span>
  );
};

export default InteractiveHeading;
