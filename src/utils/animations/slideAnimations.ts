import { Variants, Transition } from 'framer-motion';

/**
 * Animation variants for sliding content based on direction.
 */
export const slideVariants: Variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    y: '0%',
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

/**
 * Transition settings for the slide animation.
 */
export const slideTransition: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
};
