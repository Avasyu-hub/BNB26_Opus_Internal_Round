import features from '../config/features.json';

export const isOn = (flag) => Boolean(features[flag]);

/** <Feature flag="W6"><KnowledgeTimeline/></Feature> — renders nothing when the flag is off. */
export function Feature({ flag, children, fallback = null }) {
  return isOn(flag) ? children : fallback;
}

/** True unless the flag is explicitly set to false (for optional data panes owned by other members). */
export const allows = (flag) => features[flag] !== false;
