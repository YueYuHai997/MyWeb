import { useEffect, useRef, useState } from "react";

export default function RevealItem({ children, index = 0, as: Tag = "li", className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          window.setTimeout(() => {
            setVisible(true);
          }, index * 50);

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [index]);

  return (
    <Tag ref={ref} className={`reveal-item ${visible ? "visible" : ""} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
