import { useEffect, useRef, useState } from 'react';

export default function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  const { root = null, rootMargin, threshold = 0.15 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerInstance.disconnect();
          }
        });
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [root, rootMargin, threshold]);

  return { ref, isInView };
}
