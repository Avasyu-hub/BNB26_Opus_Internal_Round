import { motion } from 'framer-motion';
import { INK, MATH_FONT } from '../../theme/nodeStates';

/** Fades its children in/out with the stage. */
export function Show({ when, children, delay = 0, ...rest }) {
  return (
    <motion.g initial={false} animate={{ opacity: when ? 1 : 0 }}
      transition={{ duration: 0.45, delay: when ? delay : 0 }}
      style={{ pointerEvents: when ? 'auto' : 'none' }} {...rest}>
      {children}
    </motion.g>
  );
}

/** Maths text in the serif math face. */
export function MathText({ x, y, children, size = 20, fill = '#000', anchor = 'middle', weight = 400, ...rest }) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} dominantBaseline="middle"
      fontFamily={MATH_FONT} fontWeight={weight} {...rest}>
      {children}
    </text>
  );
}

/** Plain UI-label text. */
export function Label({ x, y, children, size = 13, fill = INK.muted, anchor = 'middle', ...rest }) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} dominantBaseline="middle"
      fontFamily="ui-sans-serif, system-ui, sans-serif" {...rest}>
      {children}
    </text>
  );
}

/** Arrowhead markers, one per colour: use markerEnd={`url(#${prefix}-blue)`} */
export function ArrowDefs({ prefix }) {
  const colors = { blue: INK.blue, orange: INK.orange, red: INK.red, green: INK.green, grey: INK.line };
  return (
    <defs>
      {Object.entries(colors).map(([k, c]) => (
        <marker key={k} id={`${prefix}-${k}`} viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={c} />
        </marker>
      ))}
    </defs>
  );
}

/** A red strike-through line over a text span. */
export function Strike({ x1, x2, y, show = true }) {
  return (
    <motion.line x1={x1} x2={x2} y1={y} y2={y} stroke={INK.red} strokeWidth={2.5} strokeLinecap="round"
      initial={false} animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }} transition={{ duration: 0.5 }} />
  );
}
