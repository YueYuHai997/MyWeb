import { useCallback, useEffect, useRef } from "react";

export default function ClickSpark({
  sparkColor = "#06B6D4",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  children
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const parent = canvas.parentElement;
    if (!parent) {
      return undefined;
    }

    let resizeTimeout;

    const resizeCanvas = () => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(resizeCanvas, 100);
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(parent);
    resizeCanvas();

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFunc = useCallback(
    (value) => {
      switch (easing) {
        case "linear":
          return value;
        case "ease-in":
          return value * value;
        case "ease-in-out":
          return value < 0.5 ? 2 * value * value : -1 + (4 - 2 * value) * value;
        default:
          return value * (2 - value);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    let animationId;

    const draw = (timestamp) => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        context.strokeStyle = sparkColor;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();

        return true;
      });

      animationId = window.requestAnimationFrame(draw);
    };

    animationId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [duration, easeFunc, extraScale, sparkColor, sparkRadius, sparkSize]);

  function handleClick(event) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const now = performance.now();

    const newSparks = Array.from({ length: sparkCount }, (_, index) => ({
      x,
      y,
      angle: (2 * Math.PI * index) / sparkCount,
      startTime: now
    }));

    sparksRef.current.push(...newSparks);
  }

  return (
    <div className="click-spark" onClick={handleClick}>
      <canvas ref={canvasRef} className="click-spark-canvas" />
      {children}
    </div>
  );
}
