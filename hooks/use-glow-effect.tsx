import { useEffect, useRef } from 'react';

export function useGlowEffect() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      element.style.setProperty('--glow-x', `${x}px`);
      element.style.setProperty('--glow-y', `${y}px`);
    };

    const handleMouseLeave = () => {
      if (!element) return;
      element.style.removeProperty('--glow-x');
      element.style.removeProperty('--glow-y');
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return ref;
}

export function GlowWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const glowRef = useGlowEffect();
  
  return (
    <div 
      ref={glowRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden group ${className}`}
    >
      {children}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
           style={{
             background: 'radial-gradient(600px circle at var(--glow-x, 0) var(--glow-y, 0), rgba(16, 185, 129, 0.1), transparent 40%)',
           }}
      />
    </div>
  );
}
