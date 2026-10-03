import { useMemo } from 'react';
import { ReactFlow, Background, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './graph.css';
import MisconceptionNode from './MisconceptionNode';
import RootConceptNode from './RootConceptNode';
import { deriveNodeStates, isActive } from './deriveNodeStates';
import { MISCONCEPTIONS, ROOT_CONCEPTS, NODE_STATES } from '../../theme/nodeStates';

// Defined once, outside the component, so React Flow never re-registers node types.
const nodeTypes = { misconception: MisconceptionNode, root: RootConceptNode };

// Layout: roots on top, misconceptions below, ordered to keep edges from crossing.
const ROOT_X = { DISTRIBUTIVE_LAW: 200, INTEGER_RULES: 505, EQUALITY_BALANCE: 815, LIKE_TERMS: 1020 };
const MISC_ORDER = ['PARTIAL_DISTRIBUTION', 'SQUARE_OF_SUM', 'NEGATIVE_DISTRIBUTION', 'NEG_TIMES_NEG', 'TRANSPOSITION', 'UNLIKE_TERMS'];
const MISC_X = (i) => i * 205;

/**
 * C7 — Live misconception graph.
 * Pass the full learner profile (preferred) and/or the history array. Or pass `derived`
 * if you already computed states with deriveNodeStates().
 */
export default function MisconceptionGraph({ profile, history, derived: derivedProp, height = 440, onNodeClick, showLegend = true }) {
  const derived = useMemo(
    () => derivedProp ?? deriveNodeStates({ profile, history }),
    [derivedProp, profile, history],
  );

  const nodes = useMemo(() => [
    ...Object.entries(ROOT_CONCEPTS).map(([id, r]) => ({
      id, type: 'root', position: { x: ROOT_X[id], y: 0 },
      data: { label: r.label, state: derived.roots[id].state },
      draggable: false, selectable: false,
    })),
    ...MISC_ORDER.map((id, i) => ({
      id, type: 'misconception', position: { x: MISC_X(i), y: 190 },
      data: {
        label: MISCONCEPTIONS[id].label, example: MISCONCEPTIONS[id].example,
        state: derived.nodes[id].state, count: derived.nodes[id].occurrence_count,
      },
      draggable: false, selectable: false,
    })),
  ], [derived]);

  const edges = useMemo(() => MISC_ORDER.flatMap((id) => MISCONCEPTIONS[id].roots.map((rootId) => {
    const st = derived.nodes[id].state;
    const live = isActive(st);
    const color = st === 'inactive' ? '#334155' : NODE_STATES[st].color;
    return {
      id: `${rootId}->${id}`, source: rootId, target: id, animated: live,
      style: { stroke: color, strokeWidth: live ? 2.5 : 1.5, opacity: st === 'inactive' ? 0.7 : 1 },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
    };
  })), [derived]);

  return (
    <div className="mg-wrap">
      <div className="mg-canvas" style={{ height }}>
        <ReactFlow
          nodes={nodes} edges={edges} nodeTypes={nodeTypes}
          fitView fitViewOptions={{ padding: 0.12 }}
          nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
          zoomOnScroll={false} panOnScroll={false} preventScrolling={false}
          minZoom={0.3} maxZoom={1.5}
          onNodeClick={onNodeClick ? (_, n) => onNodeClick(n.id, n.data) : undefined}
          proOptions={{ hideAttribution: true }} colorMode="dark"
        >
          <Background color="#1e293b" gap={22} size={1} />
        </ReactFlow>
      </div>
      {showLegend && (
        <ul className="mg-legend" aria-label="Node states">
          {Object.entries(NODE_STATES).map(([k, v]) => (
            <li key={k}><span className={`mg-swatch mg-sw-${k}`} style={{ '--c': v.color }} />{v.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
