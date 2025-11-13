/**
 * Framer Motion otimizado com LazyMotion
 * Reduz o bundle size carregando apenas features necessárias
 */

import { LazyMotion, domAnimation, m } from 'framer-motion';

/**
 * Provider otimizado de Framer Motion
 * Usa LazyMotion com domAnimation para bundle size menor
 *
 * @example
 * <MotionProvider>
 *   <AnimatedComponent />
 * </MotionProvider>
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

/**
 * Componente motion otimizado (usa 'm' ao invés de 'motion')
 * 3x menor que motion.div
 */
export const Motion = m;

/**
 * Animações pré-configuradas otimizadas
 * Usa apenas transform e opacity para melhor performance
 */
export const animations = {
  // Fade in/out
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Slide from bottom
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Slide from top
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Slide from left
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Slide from right
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Scale up
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // Scale down
  scaleOut: {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // Stagger children animation
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  // List item animation (use with staggerChildren)
  listItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 },
  },
};

/**
 * Spring configs otimizados para diferentes tipos de animação
 */
export const springs = {
  // Snappy - rápido e responsivo
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },

  // Smooth - suave e fluido
  smooth: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 35,
  },

  // Gentle - suave e lento
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 40,
  },

  // Bouncy - com bounce effect
  bouncy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 25,
  },
};

/**
 * Variants otimizados para componentes comuns
 */
export const variants = {
  // Card hover effect
  cardHover: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  },

  // Button hover effect
  buttonHover: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  },

  // Modal/Dialog
  modal: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },

  // Drawer/Sidebar
  drawer: {
    closed: { x: '-100%' },
    open: { x: 0 },
  },

  // Dropdown menu
  dropdown: {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
};

/**
 * Helper para criar animações customizadas
 */
export function createAnimation(config: {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
}) {
  return config;
}

/**
 * Helper para aplicar animações condicionalmente
 */
export function conditionalAnimation(condition: boolean, animation: any) {
  return condition ? animation : {};
}

/**
 * Presets de transições rápidas
 */
export const transitions = {
  fast: { duration: 0.15 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
};
