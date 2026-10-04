import { MISCONCEPTIONS, ROOT_CONCEPTS, NODE_STATES } from '../../theme/nodeStates';

const EVENT_TO_STATE = {
  diagnosed: 'detected',
  retry_passed: 'resolved_algebra',
  transfer_passed: 'transfer_verified',
  transfer_failed: 'transfer_failed',
};
const RESOLVED = new Set(['resolved_algebra', 'transfer_in_progress', 'transfer_verified']);
const ACTIVE_SEVERITY = ['transfer_failed', 'teacher_flagged', 'recurred', 'detected']; // most severe first

/**
 * Replays one misconception's events. Rule agreed with the team: the LATEST event decides the state;
 * a 'diagnosed' event after the misconception was ever resolved becomes 'recurred'.
 */
export function stateFromEvents(events = []) {
  let state = 'inactive';
  let everResolved = false;
  for (const e of events) {
    const stage = e.stage ?? e.event ?? e.type;
    if (stage === 'diagnosed' || stage === 'recurred') {
      state = everResolved || stage === 'recurred' ? 'recurred' : 'detected';
    } else if (EVENT_TO_STATE[stage]) {
      state = EVENT_TO_STATE[stage];
    }
    if (RESOLVED.has(state)) everResolved = true;
  }
  return state;
}

const countDiagnoses = (events = []) =>
  events.filter((e) => ['diagnosed', 'recurred'].includes(e.stage ?? e.event ?? e.type)).length;

/** Accepts profile.misconceptions as an object keyed by ID or as an array with misconception_id. */
function entriesOf(profile) {
  const m = profile?.misconceptions ?? profile?.learner_profile?.misconceptions;
  if (!m) return {};
  if (Array.isArray(m)) return Object.fromEntries(m.map((x) => [x.misconception_id ?? x.id, x]));
  return m;
}

/** Groups a flat /student/{id}/history array into per-misconception event lists. */
export function eventsFromHistory(history = []) {
  const rows = Array.isArray(history) ? history : history?.attempts ?? history?.history ?? [];
  const sorted = [...rows].sort((a, b) =>
    (a.attempt ?? 0) - (b.attempt ?? 0) || String(a.timestamp ?? '').localeCompare(String(b.timestamp ?? '')));
  const out = {};
  for (const r of sorted) {
    const id = r.misconception_id;
    if (!id) continue;
    (out[id] ??= []).push(r);
  }
  return out;
}

/**
 * Derives every node's state from the FULL learner profile (not just the latest attempt),
 * so several misconceptions can be active at once.
 * Precedence per misconception: explicit `status` from the profile > replayed `events` > history rows.
 */
export function deriveNodeStates({ profile, history } = {}) {
  const fromProfile = entriesOf(profile);
  const fromHistory = history ? eventsFromHistory(history) : {};
  const nodes = {};

  for (const id of Object.keys(MISCONCEPTIONS)) {
    const entry = fromProfile[id] ?? {};
    const events = entry.events ?? fromHistory[id] ?? [];
    const state = NODE_STATES[entry.status] ? entry.status : stateFromEvents(events);
    const occurrence_count = entry.occurrence_count ?? countDiagnoses(events);
    nodes[id] = { state, occurrence_count };
  }

  const roots = {};
  for (const rootId of Object.keys(ROOT_CONCEPTS)) {
    const children = Object.entries(MISCONCEPTIONS)
      .filter(([, m]) => m.roots.includes(rootId))
      .map(([id]) => nodes[id].state);
    const active = ACTIVE_SEVERITY.find((s) => children.includes(s));
    const touched = children.filter((s) => s !== 'inactive');
    let state = 'inactive';
    if (active) state = active;
    else if (touched.length && touched.every((s) => s === 'transfer_verified')) state = 'transfer_verified';
    else if (touched.length) state = 'resolved_algebra';
    roots[rootId] = { state };
  }

  return { nodes, roots };
}

export const isActive = (state) => ACTIVE_SEVERITY.includes(state);
