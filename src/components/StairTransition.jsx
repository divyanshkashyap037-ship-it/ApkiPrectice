import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import LoadingScreen from './LoadingScreen';

/**
 * Slices the signature screen into vertical steps, then sends them up
 * left-to-right so the background underneath is revealed.
 */
export default function StairTransition({
  numSteps = 6,
  onComplete,
}) {
  const containerRef = useRef(null);
  const columnsRef = useRef([]);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!columnsRef.current.length) return;
    const ctx = gsap.context(() => {
      gsap.set(columnsRef.current, { yPercent: 0 });
    }, containerRef);
    const fallback = window.setTimeout(() => startStairs(), 2400);
    const handleGlobalClick = () => startStairs();
    window.addEventListener('click', handleGlobalClick, { once: true });
    window.addEventListener('keydown', handleGlobalClick, { once: true });
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalClick);
      ctx.revert();
    };
  }, []);

  const startStairs = () => {
    if (startedRef.current || !columnsRef.current.length) return;
    startedRef.current = true;

    gsap.to(columnsRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power4.inOut',
      stagger: {
        each: 0.06,
        from: 'start',
      },
      onComplete: () => {
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
        }
        onComplete?.();
      },
    });
  };

  return (
    <div
      ref={containerRef}
      onClick={startStairs}
      className="fixed inset-0 z-50 flex h-screen w-screen overflow-hidden cursor-pointer"
      aria-hidden="true"
    >
      {Array.from({ length: numSteps }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            columnsRef.current[i] = el;
          }}
          className="relative h-full min-w-0 flex-1 overflow-hidden bg-background will-change-transform"
          style={{ marginRight: i === numSteps - 1 ? 0 : -1 }}
        >
          <div
            className="absolute top-0 h-full pointer-events-none"
            style={{
              width: `${numSteps * 100}%`,
              left: `-${i * 100}%`,
            }}
          >
            <LoadingScreen onComplete={i === 0 ? startStairs : undefined} />
          </div>
        </div>
      ))}
    </div>
  );
}
