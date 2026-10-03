import { motion } from 'framer-motion';
import AnimationShell from './AnimationShell';
import { Show, MathText } from './svgKit';
import { INK } from '../../theme/nodeStates';

/** C4 · SQUARE_OF_SUM — (a + b)² split into a², b² and two ab strips. Priority 2 hero. */
export default function SplitSquare({ params = {}, ...shell }) {
  const { a = 'a', b = 'b' } = params;
  const X = 40, Y = 34, A = 150, B = 90, S = A + B;

  const region = (x, y, w, h, fill, on, pulse = false) => (
    <motion.rect x={x} y={y} width={w} height={h} fill={fill} initial={false}
      animate={pulse ? { opacity: [0.25, 0.7, 0.25] } : { opacity: on ? 0.4 : 0 }}
      transition={pulse ? { duration: 1, repeat: Infinity } : { duration: 0.5 }} />
  );

  const stages = [
    { caption: `(${a} + ${b})² is the area of a square with side ${a} + ${b}.`, duration: 2200 },
    { caption: `Split each side into ${a} and ${b}. The square breaks into four pieces.`, duration: 1900 },
    { caption: `Top-left piece: ${a} × ${a} = ${a}².`, duration: 1700 },
    { caption: `Bottom-right piece: ${b} × ${b} = ${b}².`, duration: 1700 },
    { caption: `${a}² + ${b}² only covers two pieces. Two ${a}${b} strips are still uncounted.`, duration: 2600 },
    { caption: `Counting every piece: (${a} + ${b})² = ${a}² + 2${a}${b} + ${b}².`, duration: 2800 },
  ];

  return (
    <AnimationShell title="Split square model" law="Distributive law" stages={stages} {...shell}>
      {(s) => (
        <g>
          {/* side labels */}
          <Show when={s === 0}>
            <MathText x={X + S / 2} y={Y - 16} size={18}>{`${a} + ${b}`}</MathText>
            <MathText x={X - 16} y={Y + S / 2} size={18} transform={`rotate(-90 ${X - 16} ${Y + S / 2})`}>{`${a} + ${b}`}</MathText>
          </Show>
          <Show when={s >= 1}>
            <MathText x={X + A / 2} y={Y - 16} size={18}>{a}</MathText>
            <MathText x={X + A + B / 2} y={Y - 16} size={18}>{b}</MathText>
            <MathText x={X - 16} y={Y + A / 2} size={18}>{a}</MathText>
            <MathText x={X - 16} y={Y + A + B / 2} size={18}>{b}</MathText>
          </Show>

          {region(X, Y, A, A, INK.blue, s >= 2)}
          {region(X + A, Y + A, B, B, INK.green, s >= 3)}
          {region(X + A, Y, B, A, s >= 5 ? INK.amber : INK.red, s >= 5, s === 4)}
          {region(X, Y + A, A, B, s >= 5 ? INK.amber : INK.red, s >= 5, s === 4)}

          <rect x={X} y={Y} width={S} height={S} fill="none" stroke={INK.line} strokeWidth={2} rx={3} />
          <motion.line x1={X + A} x2={X + A} y1={Y} y2={Y + S} stroke={INK.text} strokeWidth={2} strokeDasharray="6 5"
            initial={false} animate={{ pathLength: s >= 1 ? 1 : 0, opacity: s >= 1 ? 1 : 0 }} transition={{ duration: 0.6 }} />
          <motion.line x1={X} x2={X + S} y1={Y + A} y2={Y + A} stroke={INK.text} strokeWidth={2} strokeDasharray="6 5"
            initial={false} animate={{ pathLength: s >= 1 ? 1 : 0, opacity: s >= 1 ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.2 }} />

          <Show when={s === 0}><MathText x={X + S / 2} y={Y + S / 2} size={26}>{`(${a} + ${b})²`}</MathText></Show>
          <Show when={s >= 2}><MathText x={X + A / 2} y={Y + A / 2} size={26}>{`${a}²`}</MathText></Show>
          <Show when={s >= 3}><MathText x={X + A + B / 2} y={Y + A + B / 2} size={22}>{`${b}²`}</MathText></Show>
          <Show when={s >= 4}>
            <MathText x={X + A + B / 2} y={Y + A / 2} size={20}>{`${a}${b}`}</MathText>
            <MathText x={X + A / 2} y={Y + A + B / 2} size={20}>{`${a}${b}`}</MathText>
          </Show>

          {/* right-hand working */}
          <Show when={s >= 4}>
            <MathText x={395} y={110} size={20}>{`(${a} + ${b})²`}</MathText>
            <MathText x={395} y={146} size={20} fill={s >= 5 ? INK.muted : INK.red}>{`≠ ${a}² + ${b}²`}</MathText>
          </Show>
          <Show when={s >= 5}>
            <MathText x={395} y={190} size={20} fill={INK.green}>{`= ${a}² + 2${a}${b} + ${b}²`}</MathText>
            <MathText x={395} y={222} size={16} fill={INK.green}>✓ all four pieces</MathText>
          </Show>
        </g>
      )}
    </AnimationShell>
  );
}
