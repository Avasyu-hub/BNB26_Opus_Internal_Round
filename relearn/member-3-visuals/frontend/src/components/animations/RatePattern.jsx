import { motion } from 'framer-motion';
import AnimationShell from './AnimationShell';
import { Show, MathText, Label } from './svgKit';
import { INK } from '../../theme/nodeStates';
import { num, signed } from '../../lib/format';

/** C4 · NEG_TIMES_NEG — temperature falling at `rate`/hr, looking `hours` hours back. */
export default function RatePattern({ params = {}, ...shell }) {
  const { rate = -3, hours = -4 } = params;
  const result = rate * hours;

  const tMin = Math.min(hours, -1) - 1, tMax = Math.max(1, hours) + 1;
  const temps = [rate * tMin, rate * tMax, 0];
  const Tmin = Math.min(...temps) - 2, Tmax = Math.max(...temps) + 2;
  const tx = (t) => 60 + ((t - tMin) / (tMax - tMin)) * 410;
  const ty = (T) => 255 - ((T - Tmin) / (Tmax - Tmin)) * 220;

  const stages = [
    { caption: `It is 0° now, and the temperature falls ${Math.abs(rate)}° every hour: a rate of ${num(rate)}° per hour.`, duration: 2400 },
    { caption: `One hour later (+1): it is ${Math.abs(rate)}° colder, so ${num(rate)} × 1 = ${num(rate)}.`, duration: 2300 },
    { caption: `Now go back in time: ${Math.abs(hours)} hours ago is time ${num(hours)}.`, duration: 2500 },
    { caption: `Back then it was warmer: ${signed(result)}°. Going backwards on a falling line takes you up.`, duration: 2600 },
    { caption: `So (${num(rate)}) × (${num(hours)}) = ${signed(result)}. A negative times a negative is positive.`, duration: 2800 },
  ];

  const dotT = (s) => (s === 0 ? 0 : s === 1 ? 1 : hours);
  const ticks = [];
  for (let t = Math.ceil(tMin); t <= Math.floor(tMax); t++) ticks.push(t);

  return (
    <AnimationShell title="Rate pattern on a number line" law="Integer rules" stages={stages} {...shell}>
      {(s) => (
        <g>
          {/* time axis at 0° */}
          <line x1={50} x2={480} y1={ty(0)} y2={ty(0)} stroke={INK.line} strokeWidth={1.5} />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={tx(t)} x2={tx(t)} y1={ty(0) - 4} y2={ty(0) + 4} stroke={t === 0 ? INK.text : INK.faint} strokeWidth={1.5} />
              <Label x={tx(t)} y={ty(0) + 16} size={11} fill={t === 0 ? INK.text : INK.muted}>
                {t === 0 ? 'now' : `${signed(t)}h`}
              </Label>
            </g>
          ))}
          <Label x={474} y={ty(0) - 12} anchor="end" size={11}>time →</Label>
          <Label x={58} y={22} anchor="start" size={11}>temperature ↑</Label>
          <line x1={tx(tMin)} x2={tx(tMin)} y1={30} y2={258} stroke={INK.faint} />

          {/* falling line */}
          <motion.line x1={tx(tMin)} y1={ty(rate * tMin)} x2={tx(tMax)} y2={ty(rate * tMax)}
            stroke={INK.blue} strokeWidth={3} initial={false}
            animate={{ pathLength: s >= 1 ? 1 : 0, opacity: s >= 1 ? 0.9 : 0 }} transition={{ duration: 0.9 }} />

          {/* guides at the answer */}
          <Show when={s >= 3}>
            <line x1={tx(hours)} x2={tx(hours)} y1={ty(0)} y2={ty(result)} stroke={INK.green} strokeDasharray="4 4" />
            <line x1={tx(tMin)} x2={tx(hours)} y1={ty(result)} y2={ty(result)} stroke={INK.green} strokeDasharray="4 4" />
            <MathText x={tx(tMin) + 6} y={ty(result) - 14} anchor="start" size={18} fill={INK.green}>{`${signed(result)}°`}</MathText>
          </Show>
          <Show when={s === 1}>
            <MathText x={tx(1) + 10} y={ty(rate) + 18} anchor="start" size={18} fill={INK.orange}>{`${num(rate)}°`}</MathText>
          </Show>
          <Show when={s === 2}>
            <motion.path d={`M${tx(0)},${ty(0) + 36} L${tx(hours)},${ty(0) + 36}`} stroke={INK.orange} strokeWidth={3}
              fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
            <Label x={(tx(0) + tx(hours)) / 2} y={ty(0) + 50} fill={INK.orange}>{`${num(hours)} hours`}</Label>
          </Show>

          {/* the moving reading */}
          <motion.circle r={9} fill={INK.orange} stroke="#0f172a" strokeWidth={3} initial={false}
            animate={{ cx: tx(dotT(s)), cy: ty(rate * dotT(s)) }} transition={{ duration: 1.3, ease: 'easeInOut' }} />

          <Show when={s === 4}>
            <rect x={250} y={30} width={225} height={44} rx={8} fill="#0f172a" stroke={INK.green} />
            <MathText x={362} y={53} size={22} fill={INK.green}>{`(${num(rate)}) × (${num(hours)}) = ${signed(result)}`}</MathText>
          </Show>
        </g>
      )}
    </AnimationShell>
  );
}
