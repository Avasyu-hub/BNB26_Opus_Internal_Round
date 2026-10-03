// Animation tokens and exports
export { default as AnimationPlayer } from './AnimationPlayer';

export const transitions = {
  default: { duration: 0.25, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 300, damping: 25 },
};

export const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: transitions.default },
};
