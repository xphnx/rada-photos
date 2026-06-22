import { useCallback, useEffect, useRef, useState } from 'react';

const periodLabel = (takenAt: string): string => {
  const date = new Date(takenAt);
  if (Number.isNaN(date.getTime())) return '';

  const month = date.getMonth(); 
  let year = date.getFullYear();
  let season: string;

  if (month === 11) {
    season = 'Зима';
    year += 1;
  } else if (month <= 1) season = 'Зима';
  else if (month <= 4) season = 'Весна';
  else if (month <= 7) season = 'Лето';
  else season = 'Осень';

  return `${season} ${year}`;
};

export const useVisiblePeriod = () => {
  const [label, setLabel] = useState('');
  const metaRef = useRef(new WeakMap<Element, string>());
  const visibleRef = useRef(new Set<Element>());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() =>{ 
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = visibleRef.current;

        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });

        
        let topEl: Element | null = null;
        let topY = Infinity;

        visible.forEach((el) => {
          if (!el.isConnected) {
            visible.delete(el); 
            return;
          }
          const y = el.getBoundingClientRect().top;
          if (y < topY) {
            topY = y;
            topEl = el;
          }
        });

        if (topEl) {
          const takenAt = metaRef.current.get(topEl);
          if (takenAt) setLabel(periodLabel(takenAt));
        }
      },
      { rootMargin: '-72px 0px -78% 0px' }, 
    );
        return () => observerRef.current?.disconnect() 
    }, []);

  const registerCard = useCallback(
    (el: HTMLElement | null, takenAt: string) => {
      if (!el) return;
      metaRef.current.set(el, takenAt);
      observerRef.current?.observe(el);
    },
    [],
  );

  return { label, registerCard };
};
