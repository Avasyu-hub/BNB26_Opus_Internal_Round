import { motion } from 'framer-motion';
import AnimationShell from './AnimationShell';
import { Show, MathText, Label, ArrowDefs } from './svgKit';
import { INK } from '../../theme/nodeStates';

/** C4 · NEGATIVE_DISTRIBUTION — −(x + c): the minus reflects the WHOLE group across 0. */
export default function NumberLineReflection({ params = {}, ...shell }) {
  const { v = 'x', c = 5, vUnits = 4 } = params;
  const O = 250, U = 20, LY = 170, VY = 118;
  const xTip = O + vUnits * U, cTip = xTip + c * U;
  const flip = (px) => 2 * O - px;
  const id = 'nlr';

  const stages = [
    { caption: `A number line. Moving right is +, moving left is −.`, duration: 1700 },
    { caption: `${v} + ${c}: step ${v} to the right, then ${c} more to the right.`, duration: 2200 },
    { caption: `The minus sign in −(${v} + ${c}) reflects the whole trip across 0. Both arrows turn around.`, duration: 2600 },
    { caption: `If only ${v} turns around, the ${c} still points right. That gives −${v} + ${c}, a different place.`, duration: 2800 },
    { caption: `So −(${v} + ${c}) = −${v} − ${c}. The minus reaches every term inside.`, duration: 2600 },
  ];
  const flipped = s => s >= 2;

  const ticks = [];
  for (let i = -10; i <= 10; i++) ticks.push(i);

  return (
    <AnimationShell title="Number-line reflection" law="Distributive law · Integer rules" stages={stages} {...shell}>
      {(s) => (
        <g>
          <ArrowDefs prefix={id} />
          {/* line */}
          <line x1={30} x2={470} y1={LY} y2={LY} stroke={INK.line} strokeWidth={2} />
          {ticks.map((t) => (
            <line key={t} x1={O + t * U} x2={O + t * U} y1={LY - (t === 0 ? 9 : 5)} y2={LY + (t === 0 ? 9 : 5)}
              stroke={t === 0 ? INK.text : INK.faint} strokeWidth={t === 0 ? 2 : 1.5} />
          ))}
          <Label x={O} y={LY + 22} fill={INK.text}>0</Label>
          <Show when={s >= 2}>
            <line x1={O} x2={O} y1={60} y2={LY} stroke={INK.muted} strokeDasharray="3 5" />
            <Label x={O} y={48}>mirror at 0</Label>
          </Show>

          {/* vectors */}
          <Show when={s >= 1}>
            <motion.line y1={VY} y2={VY} stroke={INK.blue} strokeWidth={5} strokeLinecap="round"
              markerEnd={`url(#${id}-blue)`} initial={false}
              animate={{ x1: O, x2: flipped(s) ? flip(xTip) : xTip }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
            <motion.line y1={VY} y2={VY} stroke={INK.orange} strokeWidth={5} strokeLinecap="round"
              markerEnd={`url(#${id}-orange)`} initial={false}
              animate={{ x1: flipped(s) ? flip(xTip) : xTip, x2: flipped(s) ? flip(cTip) : cTip }}
              transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.1 }} />
            <MathText x={flipped(s) ? (O + flip(xTip)) / 2 : (O + xTip) / 2} y={VY - 20} fill={INK.blue}>
              {flipped(s) ? `−${v}` : `+${v}`}
            </MathText>
            <MathText x={flipped(s) ? (flip(xTip) + flip(cTip)) / 2 : (xTip + cTip) / 2} y={VY - 20} fill={INK.orange}>
              {flipped(s) ? `−${c}` : `+${c}`}
            </MathText>
          </Show>

          {/* the error, drawn below the line */}
          <Show when={s === 3}>
            <line x1={O} x2={flip(xTip)} y1={208} y2={208} stroke={INK.blue} strokeWidth={4} strokeDasharray="6 5"
              markerEnd={`url(#${id}-blue)`} />
            <line x1={flip(xTip)} x2={flip(xTip)} y1={208} y2={234} stroke={INK.muted} strokeWidth={1} strokeDasharray="2 3" />
            <line x1={flip(xTip)} x2={flip(xTip) + c * U} y1={234} y2={234} stroke={INK.red} strokeWidth={4}
              strokeDasharray="6 5" markerEnd={`url(#${id}-red)`} />
            <Label x={flip(xTip) + c * U + 12} y={234} anchor="start" fill={INK.red}>{`−${v} + ${c}  ✗  the ${c} never turned`}</Label>
          </Show>

          <Show when={s === 4}>
            <MathText x={O} y={262} size={24} fill={INK.green}>{`−(${v} + ${c}) = −${v} − ${c}  ✓`}</MathText>
          </Show>
        </g>
      )}
    </AnimationShell>
  );
}
