/**
 * Motion wrapper
 * 
 * This file re-exports components from framer-motion to maintain a consistent
 * import pattern across the application, while allowing us to switch between
 * motion libraries if needed.
 */

// Import from framer-motion to get the components needed
import {
  motion,
  AnimatePresence,
  MotionConfig, 
  useAnimation,
  useInView,
  useScroll,
  useSpring,
  useTransform
} from 'framer-motion';

// Re-export the components
export {
  motion,
  AnimatePresence,
  MotionConfig,
  useAnimation as useAnimationControls,
  useInView,
  useScroll,
  useSpring, 
  useTransform
};

// Add any custom animation presets or utility functions here
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

export const slideInFromBottom = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 }
};
