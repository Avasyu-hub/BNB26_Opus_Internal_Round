import { motion } from 'framer-motion';
import AnimationShell from './AnimationShell';
import { Show, MathText, Label, Strike } from './svgKit';
import { INK } from '../../theme/nodeStates';

/** C4 · PARTIAL_DISTRIBUTION — k(x + c) as the area of a rectangle. Priority 1 hero. */
export default function AreaModel({ params = {}, ...shell }) {
  const { k = 2, v = 'x', c = 3 } = params;
  const X0 = 80, Y0 = 50, H = 140, WX = 220, WC = 130;
  const XD = X0 + WX;

  const stages = [
    { caption: `Read ${k}(${v} + ${c}) as an area: a rectangle ${k} tall and ${v} + ${c} wide.`, duration: 2400 },
    { caption: `The width has two parts, so the rectangle splits into two pieces.`, duration: 1800 },
    { caption: `Left piece: ${k} × ${v} = ${k}${v}.`, duration: 1900 },
    { caption: `Right piece: ${k} × ${c} = ${k * c}. The ${k} is the height of this piece too.`, duration: 2300 },
    { caption: `Total area = ${k}${v} + ${k * c}. Writing ${k}${v} + ${c} leaves part of the rectangle uncounted.`, duration: 2800 },
  ];

  return (
    <AnimationShell title="Rectangle area model" law="Distributive law" stages={stages} {...shell}>
      {(s) => (
        <g>
          {/* width labels */}
          <Show when={s === 0}><MathText x={X0 + (WX + WC) / 2} y={Y0 - 22}>{`${v} + ${c}`}</MathText></Show>
          <Show when={s >= 1}>
            <MathText x={X0 + WX / 2} y={Y0 - 22}>{v}</MathText>
            <MathText x={XD + WC / 2} y={Y0 - 22}>{c}</MathText>
          </Show>
          {/* height label */}
          <MathText x={X0 - 22} y={Y0 + H / 2}>{k}</MathText>

          {/* fills */}
          <motion.rect x={X0} y={Y0} width={WX} height={H} fill={INK.blue}
            initial={false} animate={{ opacity: s >= 2 ? 0.35 : 0 }} transition={{ duration: 0.5 }} />
          <motion.rect x={XD} y={Y0} width={WC} height={H} fill={INK.orange}
            initial={false}
            animate={s === 4 ? { opacity: [0.35, 0.75, 0.35] } : { opacity: s >= 3 ? 0.35 : 0 }}
            transition={s === 4 ? { duration: 1.1, repeat: Infinity } : { duration: 0.5 }} />

          {/* outline + divider */}
          <rect x={X0} y={Y0} width={WX + WC} height={H} rx={4} fill="none" stroke={INK.line} strokeWidth={2} />
          <motion.line x1={XD} x2={XD} y1={Y0} y2={Y0 + H} stroke={INK.text} strokeWidth={2} strokeDasharray="6 5"
            initial={false} animate={{ pathLength: s >= 1 ? 1 : 0, opacity: s >= 1 ? 1 : 0 }} transition={{ duration: 0.7 }} />

          {/* inner labels */}
          <Show when={s === 0}><MathText x={X0 + (WX + WC) / 2} y={Y0 + H / 2} size={24}>{`${k}(${v} + ${c})`}</MathText></Show>
          <Show when={s >= 2}><MathText x={X0 + WX / 2} y={Y0 + H / 2} size={26}>{`${k}${v}`}</MathText></Show>
          <Show when={s >= 3}><MathText x={XD + WC / 2} y={Y0 + H / 2} size={26}>{k * c}</MathText></Show>
          <Show when={s === 4}>
            <Label x={XD + WC / 2} y={Y0 + H + 16} fill={INK.orange}>this part is often forgotten</Label>
          </Show>

          {/* result line */}
          <Show when={s === 4} delay={0.3}>
            <MathText x={160} y={262} size={22} fill={INK.green}>{`${k}(${v} + ${c}) = ${k}${v} + ${k * c}  ✓`}</MathText>
            <MathText x={395} y={262} size={22} fill={INK.red}>{`${k}${v} + ${c}`}</MathText>
            <Strike x1={355} x2={435} y={262} show={s === 4} />
          </Show>
        </g>
      )}
    </AnimationShell>
  );
}
