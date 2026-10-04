import { AnimatePresence, motion } from 'framer-motion';
import AreaModel from './AreaModel';
import SplitSquare from './SplitSquare';
import NumberLineReflection from './NumberLineReflection';
import BalanceScale from './BalanceScale';
import AttributeTiles from './AttributeTiles';
import RatePattern from './RatePattern';

/** Misconception ID → visual proof component (contract 6.1). */
export const VISUAL_PROOFS = {
  PARTIAL_DISTRIBUTION: AreaModel,
  SQUARE_OF_SUM: SplitSquare,
  NEGATIVE_DISTRIBUTION: NumberLineReflection,
  TRANSPOSITION: BalanceScale,
  UNLIKE_TERMS: AttributeTiles,
  NEG_TIMES_NEG: RatePattern,
};

/**
 * Mount point for Member 2's Step 7 intervention screen.
 *   <VisualProof misconceptionId={diagnosis.misconception_id} params={animationParams} onComplete={...} />
 * Unknown / missing IDs render nothing. Switching IDs cross-fades cleanly.
 */
export default function VisualProof({ misconceptionId, params, ...rest }) {
  const Proof = VISUAL_PROOFS[misconceptionId];
  return (
    <AnimatePresence mode="wait">
      {Proof && (
        <motion.div key={misconceptionId} className="w-full"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}>
          <Proof params={params} {...rest} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
