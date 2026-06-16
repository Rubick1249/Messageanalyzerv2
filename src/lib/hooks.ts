import { useState, useEffect, useRef } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(0);
  const reduced = useReducedMotion();
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (reduced) { setValue(target); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, reduced]);

  return value;
}

export function useIntersection(
  ref: React.RefObject<Element | null>,
  options?: IntersectionObserverInit
): boolean {
  const [intersecting, setIntersecting] = useState(false);
  // Capture options in a ref so callers can pass inline objects without triggering
  // the effect on every render (IntersectionObserver options cannot be changed after creation).
  const optionsRef = useRef(options);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, optionsRef.current);
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return intersecting;
}
