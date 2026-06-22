import { useEffect, useState } from 'react';

export const useColumnCount = () => {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const compute = (width: number) => {
      if (width < 640) return 2;
      if (width < 1024) return 3;
      return 4;
    };

    const observer = new ResizeObserver((entries) => {
      setCols(compute(entries[0].contentRect.width));
    });

    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  return cols;
}
