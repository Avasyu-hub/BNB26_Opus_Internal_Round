import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NODE_STATES } from '../../theme/nodeStates';

function RootConceptNode({ data }) {
  const { label, state } = data;
  const meta = NODE_STATES[state] ?? NODE_STATES.inactive;
  return (
    <div className={`mg-node mg-root mg-${state}`} style={{ '--c': meta.color }} aria-label={`${label}: ${meta.label}`}>
      <div className="mg-kicker">Root concept</div>
      <div className="mg-title">{label}</div>
      <Handle type="source" position={Position.Bottom} className="mg-handle" isConnectable={false} />
    </div>
  );
}

export default memo(RootConceptNode);
