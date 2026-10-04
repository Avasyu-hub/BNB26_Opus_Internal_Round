import { motion, AnimatePresence } from 'framer-motion';
import AnimationShell from './AnimationShell';
import { Show, MathText } from './svgKit';
import { INK, MATH_FONT } from '../../theme/nodeStates';

const PX = 250, PY = 108, HALF = 165, PLATE = 196;

function Block({ x, w = 44, label, fill, y = PLATE - 36 }) {
  return (
    <motion.g initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45 }}>
      <motion.rect initial={false} animate={{ x: x - w / 2 }} y={y} width={w} height={34} rx={5} fill={fill} />
      <motion.text initial={false} animate={{ x }} y={y + 18} textAnchor="middle" dominantBaseline="middle" fill="#0f172a"
        fontFamily={MATH_FONT} fontSize={18} fontWeight={700}>{label}</motion.text>
    </motion.g>
  );
}

function Pan({ x, dy, children }) {
  return (
    <motion.g initial={false} animate={{ y: dy }} transition={{ type: 'spring', stiffness: 90, damping: 12 }}>
      <line x1={x} x2={x - 52} y1={PY} y2={PLATE} stroke={INK.muted} strokeWidth={1.5} />
      <line x1={x} x2={x + 52} y1={PY} y2={PLATE} stroke={INK.muted} strokeWidth={1.5} />
      <path d={`M${x - 62},${PLATE} Q${x},${PLATE + 16} ${x + 62},${PLATE}`} fill={INK.faint} stroke={INK.line} strokeWidth={2} />
      <AnimatePresence>{children}</AnimatePresence>
    </motion.g>
  );
}

/** C4 · TRANSPOSITION — x + c = r on a two-pan balance. */
export default function BalanceScale({ params = {}, ...shell }) {
  const { v = 'x', c = 5, r = 10 } = params;
  const LX = PX - HALF, RX = PX + HALF;

  const stages = [
    { caption: `${v} + ${c} = ${r}: the left pan and the right pan weigh the same.`, duration: 2200 },
    { caption: `Take ${c} off BOTH pans. Each side loses the same amount.`, duration: 2300 },
    { caption: `The scale is still level, so ${v} = ${r - c}. ✓`, duration: 2000 },
    { caption: `Now the shortcut: "move +${c} to the other side" and keep it +${c}.`, duration: 2200 },
    { caption: `The right pan gets heavier and the scale tips. ${v} = ${r + c} is not balanced. ✗`, duration: 2800 },
    { caption: `Moving a term across means doing the opposite to both sides: +${c} becomes −${c}.`, duration: 2600 },
  ];

  const tilt = (s) => (s === 4 ? 22 : 0);

  const left = (s) => {
    const b = [<Block key="x" x={LX - (s === 0 || s === 3 ? 24 : 0)} label={v} fill={INK.blue} />];
    if (s === 0 || s === 3) b.push(<Block key="c" x={LX + 28} label={c} fill={INK.orange} />);
    return b;
  };
  const right = (s) => {
    if (s === 1 || s === 2) return [<Block key="r-c" x={RX} w={56} label={r - c} fill={INK.green} />];
    if (s === 4) return [
      <Block key="r" x={RX - 26} w={50} label={r} fill={INK.green} />,
      <Block key="plus" x={RX + 32} w={46} label={`+${c}`} fill={INK.red} />,
    ];
    if (s === 5) return [<Block key="r5" x={RX} w={86} label={`${r} − ${c}`} fill={INK.green} />];
    return [<Block key="r" x={RX} w={56} label={r} fill={INK.green} />];
  };

  return (
    <AnimationShell title="Two-pan balance" law="Equality as balance" stages={stages} {...shell}>
      {(s) => (
        <g>
          {/* stand */}
          <line x1={PX} x2={PX} y1={PY} y2={262} stroke={INK.line} strokeWidth={4} />
          <path d={`M${PX - 50},272 L${PX + 50},272 L${PX},252 z`} fill={INK.faint} stroke={INK.line} strokeWidth={2} />
          {/* beam */}
          <motion.line x1={LX} x2={RX} stroke={INK.text} strokeWidth={5} strokeLinecap="round" initial={false}
            animate={{ y1: PY - tilt(s), y2: PY + tilt(s) }} transition={{ type: 'spring', stiffness: 90, damping: 12 }} />
          <circle cx={PX} cy={PY} r={7} fill={INK.text} />

          <Pan x={LX} dy={-tilt(s)}>{left(s)}</Pan>
          <Pan x={RX} dy={tilt(s)}>{right(s)}</Pan>

          {/* removed weights float away */}
          <Show when={s === 1}>
            <MathText x={LX + 28} y={128} fill={INK.orange} size={18}>{`−${c}`}</MathText>
            <MathText x={RX} y={128} fill={INK.orange} size={18}>{`−${c}`}</MathText>
          </Show>

          <Show when={s === 2}><MathText x={PX} y={40} size={24} fill={INK.green}>{`${v} = ${r - c}  ✓  balanced`}</MathText></Show>
          <Show when={s === 4}><MathText x={PX} y={40} size={24} fill={INK.red}>{`${v} = ${r} + ${c}  ✗  tips over`}</MathText></Show>
          <Show when={s === 5}><MathText x={PX} y={40} size={24} fill={INK.green}>{`${v} = ${r} − ${c} = ${r - c}  ✓`}</MathText></Show>
        </g>
      )}
    </AnimationShell>
  );
}
