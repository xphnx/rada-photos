import { useEffect, useState } from 'react';

export const useColumnCount = () => {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [cols, setCols] = useState(4);

  useEffect(() => {
    if (!node) return;

    const compute = (width: number) => {
      if (width < 500) return 2;
      if (width < 760) return 3;
      if (width < 1040) return 4;
      return 5;
    };

    const observer = new ResizeObserver((entries) => {
      setCols(compute(entries[0].contentRect.width));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, cols] as const;
}
