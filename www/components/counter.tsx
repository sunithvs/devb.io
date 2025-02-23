import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface CounterProps {
  from: number;
  to: number;
  duration: number;
}

const Counter: React.FC<CounterProps> = ({ from, to, duration }) => {
  const nodeRef = React.useRef<HTMLSpanElement>(null);
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  React.useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: [0.4, 0.0, 0.2, 1], // Custom easing for smooth animation
      onComplete: () => {
        if (nodeRef.current) {
          nodeRef.current.textContent = to.toLocaleString();
        }
      },
    });

    return controls.stop;
  }, [count, to, duration]);

  React.useEffect(() => {
    return rounded.onChange((latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = latest.toLocaleString();
      }
    });
  }, [rounded]);

  return (
    <motion.span
      ref={nodeRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {from}
    </motion.span>
  );
};

export default Counter;
