import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NODE_STATES } from '../../theme/nodeStates';

function MisconceptionNode({ data }) {
  const { label, example, state, count } = data;
  const meta = NODE_STATES[state] ?? NODE_STATES.inactive;
  return (
    <div className={`mg-node mg-misc mg-${state}`} style={{ '--c': meta.color }}
      aria-label={`${label}: ${meta.label}${count > 1 ? `, seen ${count} times` : ''}`}>
      <Handle type="target" position={Position.Top} className="mg-handle" isConnectable={false} />
      {state === 'transfer_failed' && <span className="mg-shockwave" aria-hidden="true" />}
      {count > 1 && <span className="mg-badge" title={`Seen ${count} times`}>×{count}</span>}
      <div className="mg-title">{label}</div>
      <div className="mg-example">{example}</div>
      <div className="mg-state"><i className="mg-dot" />{meta.label}</div>
    </div>
  );
}

export default memo(MisconceptionNode);
