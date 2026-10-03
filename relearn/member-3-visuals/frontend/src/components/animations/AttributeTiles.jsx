import { motion } from 'framer-motion';
import AnimationShell from './AnimationShell';
import { Show, MathText, Label } from './svgKit';
import { INK } from '../../theme/nodeStates';

/** C4 · UNLIKE_TERMS — x-tiles (squares) and unit tiles (circles) cannot merge. */
export default function AttributeTiles({ params = {}, ...shell }) {
  const { n = 3, m = 5, v = 'x' } = params;
  const SQ = 34, R = 15;

  const stages = [
    { caption: `${n}${v} + ${m}: blue squares stand for ${v}, yellow circles stand for 1.`, duration: 2000 },
    { caption: `Sort them by kind: ${n} squares and ${m} circles.`, duration: 2000 },
    { caption: `Adding ${n} + ${m} = ${n + m} would need one kind of tile that is both. There isn't one.`, duration: 2700 },
    { caption: `Different kinds stay separate: ${n}${v} + ${m} is already as simple as it gets.`, duration: 2600 },
  ];

  // deterministic "scattered" positions
  const scatter = (i) => ({ x: 70 + ((i * 137) % 340), y: 60 + ((i * 89) % 140) });
  const total = n + m;
  const merge = (i) => {
    const cols = Math.ceil(total / 2);
    const col = i % cols, row = Math.floor(i / cols);
    return { x: 250 - (cols * 40) / 2 + 20 + col * 40, y: 115 + row * 42 };
  };
  const sqGroup = (i) => ({ x: 60 + i * 44 + SQ / 2, y: 132 });
  const ciGroup = (j) => ({ x: 290 + j * 38, y: 132 });

  const pos = (s, kind, i) => {
    const k = kind === 'sq' ? i : n + i;
    if (s === 0) return scatter(k);
    if (s === 2) return merge(k);
    return kind === 'sq' ? sqGroup(i) : ciGroup(i);
  };
  const spring = { type: 'spring', stiffness: 120, damping: 14 };

  return (
    <AnimationShell title="Grouping attribute tiles" law="Like terms" stages={stages} {...shell}>
      {(s) => (
        <g>
          <motion.g initial={false} animate={s === 2 ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
            transition={s === 2 ? { duration: 0.6, delay: 0.8 } : { duration: 0.2 }}>
            {Array.from({ length: n }, (_, i) => {
              const p = pos(s, 'sq', i);
              return (
                <motion.rect key={`s${i}`} width={SQ} height={SQ} rx={4} fill={INK.blue}
                  stroke={s === 2 ? INK.red : 'none'} strokeWidth={2}
                  initial={false} animate={{ x: p.x - SQ / 2, y: p.y - SQ / 2 }} transition={{ ...spring, delay: i * 0.04 }} />
              );
            })}
            {Array.from({ length: m }, (_, j) => {
              const p = pos(s, 'ci', j);
              return (
                <motion.circle key={`c${j}`} r={R} fill={INK.yellow}
                  stroke={s === 2 ? INK.red : 'none'} strokeWidth={2}
                  initial={false} animate={{ cx: p.x, cy: p.y }} transition={{ ...spring, delay: j * 0.04 }} />
              );
            })}
          </motion.g>

          <Show when={s === 1 || s === 3}>
            <MathText x={60 + ((n - 1) * 44 + SQ) / 2} y={186} fill={INK.blue}>{`${n}${v}`}</MathText>
            <MathText x={290 + ((m - 1) * 38) / 2} y={186} fill={INK.yellow}>{m}</MathText>
            <MathText x={(60 + n * 44 + 290 - R) / 2} y={132} size={24}>+</MathText>
          </Show>

          <Show when={s === 2}>
            <MathText x={250} y={225} size={24} fill={INK.red}>{`${n + m}${v} ?  ✗`}</MathText>
            <Label x={250} y={252} fill={INK.red}>a square and a circle don't make a new tile</Label>
          </Show>
          <Show when={s === 3}>
            <MathText x={250} y={240} size={24} fill={INK.green}>{`${n}${v} + ${m}  ✓  stays as it is`}</MathText>
          </Show>
        </g>
      )}
    </AnimationShell>
  );
}
