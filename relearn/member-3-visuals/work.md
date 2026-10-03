# Member 3 Work Distribution — Visuals & Graph Engine

> **Role:** Interactive Visual Proofs, React Flow Graph & Analytical Visualisations  
> **Primary Technology Stack:** React, React Flow, SVG, Framer Motion (or D3), Recharts, Tailwind CSS  
> **Key Rule:** Complete **Stage 1 (Core)** and pass the **Core Gate** before touching any Stage 2 Wow tasks.

---

## 1. Responsibility Summary

Member 3 owns the pedagogical graphics and visual comprehension layer of Re:Learn:
- Creating all 6 handmade, interactive SVG visual proof animations (C4).
- Architecting the live, interactive Misconception Graph using React Flow (C7).
- Implementing dynamic visual node states: Inactive (grey), Detected (orange glow), Resolved in algebra (blue), Transfer verified (green), and Persists in new context (red ring).
- Building the Multimodal Fusion Card (W4) in Stage 2.
- Building the Knowledge Evolution Timeline (W6) using Recharts in Stage 2.
- Consuming `/student/{id}/history` to drive historical graph playback and timeline views.

---

## 2. Features Owned

### Core Features (Stage 1)
- **C4: Visual Proof Animations (All 6 Hand-Crafted SVGs):**
  1. *Rectangle Area Model* (`PARTIAL_DISTRIBUTION`) — Priority 1
  2. *Split Square Model* (`SQUARE_OF_SUM`) — Priority 2
  3. *Number-Line Reflection* (`NEGATIVE_DISTRIBUTION`)
  4. *Two-Pan Balance Scale* (`TRANSPOSITION`)
  5. *Grouping Attribute Tiles* (`UNLIKE_TERMS`)
  6. *Rate Pattern on Number Line* (`NEG_TIMES_NEG`)
- **C7: Live Misconception Graph (React Flow):**
  - 6 Misconception nodes + 4 Root concept nodes
  - Prerequisite connection edges
  - 5 Stateful visual styles (Grey, Orange Glow, Blue, Green, Red Ring)

### Wow Layer Features (Stage 2)
- **W6 (Priority 5):** Knowledge Evolution Timeline (Recharts per-student mastery chart)
- **W4 (Priority 7):** Multimodal Fusion Card (unified steps, photo thumbnail, explanation, confidence, diagnosis)

---

## 3. Stage 1 — Core Execution Plan (Hours 0–13)

> **Early Completion Protocol:** If you finish all 6 animations and the graph before Hour 13, **do not build Wow cards or timelines**. Assist Member 2 in polishing animation mounting transitions or help Member 1 test graph state reactivity.

### Ordered Task List

#### Hours 0–1: Graphic Canvas & React Flow Setup
1. Set up React Flow canvas wrapper component in `/frontend/src/components/graph/`.
2. Define custom node components: `MisconceptionNode.jsx` and `RootConceptNode.jsx`.
3. Set up SVG animation container with Framer Motion support.
4. Establish visual theme constants matching the design system:
   - Inactive: `#64748b` (slate-500)
   - Detected: `#f97316` (orange-500) + CSS outer pulse glow
   - Resolved in Algebra: `#3b82f6` (blue-500)
   - Transfer Verified: `#22c55e` (emerald-500)
   - Persists in New Context: `#ef4444` (red-500) + 3px pulsing red ring

#### Hours 1–6: Two Hero Animations & Graph Skeleton
1. **Hero Animation 1: Rectangle Area Model (`PARTIAL_DISTRIBUTION`):**
   - Pure React SVG with Framer Motion.
   - Represents $2(x+3)$ as a rectangle of height 2 and base split into $x$ and $3$.
   - Animation sequence:
     - Stage A: Full rectangle $2 \times (x+3)$.
     - Stage B: Divider line splits into Sub-rectangle 1 ($2 \times x = 2x$) and Sub-rectangle 2 ($2 \times 3 = 6$).
     - Visual callout: Highlights that the 2 must multiply BOTH sections ($2x + 6$, NOT $2x + 3$).
2. **Hero Animation 2: Split Square Model (`SQUARE_OF_SUM`):**
   - Square of side $(a+b)$.
   - Animation splits square into 4 distinct regions: $a^2$ (top-left), $b^2$ (bottom-right), and TWO identical $ab$ strips (top-right, bottom-left).
   - Visual callout: Demonstrates visually why $(a+b)^2 \ne a^2 + b^2$ by highlighting the two missing $ab$ regions.
3. **React Flow Misconception Graph Skeleton (C7):**
   - Place 4 Root Concept nodes at top tier: `DISTRIBUTIVE_LAW`, `EQUALITY_BALANCE`, `LIKE_TERMS`, `INTEGER_RULES`.
   - Place 6 Misconception nodes at bottom tier with directed dependency edges.
   - Connect props to trigger dynamic state styling.

#### Hours 6–7: Integration Milestone #1
- Mount Area Model inside Member 2's Step 7 Intervention view.
- Wire `PARTIAL_DISTRIBUTION` graph node: Verify that submitting $2(x+3)=14 \to 2x+3=14$ activates the orange glow on `PARTIAL_DISTRIBUTION` and its root `DISTRIBUTIVE_LAW`.

#### Hours 7–13: Remaining 4 Animations & Graph Node State Polish
1. **Animation 3: Number-Line Reflection (`NEGATIVE_DISTRIBUTION`):**
   - Interactive number line illustrating directional vectors.
   - Shows $+x$ and $+5$ forward vectors flipping $180^\circ$ across origin into $-x$ and $-5$.
2. **Animation 4: Two-Pan Balance Scale (`TRANSPOSITION`):**
   - SVG balance scale holding weights ($x+5$ on left, $10$ on right).
   - Shows removing 5 from both sides maintains balance, whereas shifting $+5$ to $+5$ tilts the scale.
3. **Animation 5: Grouping Attribute Tiles (`UNLIKE_TERMS`):**
   - Distinct geometric shapes (e.g. blue squares for $x$, yellow circles for constants).
   - Shows $3$ squares and $5$ circles cannot be merged into $8$ square-circles.
4. **Animation 6: Rate Pattern on Number Line (`NEG_TIMES_NEG`):**
   - Dynamic timeline showing temperature falling $3^\circ/\text{hr}$ (-3).
   - Moving backward 4 hours in time (-4) reveals the past was warmer (+12).
5. **Graph Node State Polish:**
   - Implement state updates for all 5 lifecycle stages:
     - `diagnosed` $\to$ orange glow on node + root.
     - `retry_passed` $\to$ node turns blue ("Resolved in algebra").
     - `transfer_passed` $\to$ node turns solid emerald green ("Transfer verified ✓").
     - `transfer_failed` $\to$ node gains a pulsing red border ring ("Persists in new context ✗").

---

## 4. Core Gate Verification (Hour 13)

Before proceeding to Stage 2, verify your share of the Core Gate:
- [ ] All 6 visual proofs render cleanly without console warnings or layout thrashing.
- [ ] React Flow graph displays all 10 nodes (6 misconceptions + 4 roots) with clean layout.
- [ ] Graph nodes dynamically react to stage changes (Grey $\to$ Orange $\to$ Blue $\to$ Green / Red Ring).
- [ ] Animations mount and dismount properly inside Member 2's intervention screen.
- [ ] Verified across 3 consecutive end-to-end runs.
- [ ] Code committed and tagged `core-v1`.

---

## 5. Stage 2 — Wow Layer Execution Plan (Hours 13–18)

> **MANDATORY NOTICE:** Do not start until the Core Gate is passed and tagged `core-v1`.  
> Build each feature on an isolated branch (`feat/w6-timeline`, `feat/w4-fusion-card`) gated behind `features.json`.

### Ordered Task List

1. **W6 — Knowledge Evolution Timeline (Priority 5 | Hours 14–16.5):**
   - Consume `GET /student/{id}/history` from Member 1.
   - Build responsive Recharts timeline showing student trajectory over time:
     - X-axis: Sequence of attempts / timestamps.
     - Y-axis: Cognitive status (`Diagnosed`, `Retry Passed`, `Transfer Passed`, `Transfer Failed`).
     - Visual markers indicating when misconceptions were eradicated or persisted into physics/geometry.
   - Feature flag: `features.W6 = true/false`.
2. **W4 — Multimodal Fusion Card (Priority 7 | Hours 16.5–18):**
   - Design and build composite card for Step 6:
     - Header: Question text and student identifier.
     - Left pane: Step sequence + photo thumbnail (if W1 active) + student thinking quote (if W2 active).
     - Right pane: Symbolic evidence, telemetry confidence badge (W3), and root concept tag.
   - Feature flag: `features.W4 = true/false`.

---

## 6. Contracts & Interfaces to Follow

### 6.1 Misconception IDs & Mapping
Visual proofs and graph nodes must strictly bind to these 6 keys:
- `PARTIAL_DISTRIBUTION` $\longleftrightarrow$ `DISTRIBUTIVE_LAW`
- `SQUARE_OF_SUM` $\longleftrightarrow$ `DISTRIBUTIVE_LAW`
- `NEGATIVE_DISTRIBUTION` $\longleftrightarrow$ `DISTRIBUTIVE_LAW`, `INTEGER_RULES`
- `TRANSPOSITION` $\longleftrightarrow$ `EQUALITY_BALANCE`
- `UNLIKE_TERMS` $\longleftrightarrow$ `LIKE_TERMS`
- `NEG_TIMES_NEG` $\longleftrightarrow$ `INTEGER_RULES`

### 6.2 Node State Schema
```typescript
type NodeState = 
  | 'inactive'           // Grey (#64748b)
  | 'detected'           // Orange glow (#f97316)
  | 'resolved_algebra'   // Blue (#3b82f6)
  | 'transfer_verified'  // Green (#22c55e)
  | 'transfer_failed';   // Red ring (#ef4444)
```

---

## 7. Inputs, Dependencies & Deliverables

| Dependency From | Deliverable Needed | Needed By | What to Use Until Available |
|---|---|---|---|
| **Member 2** | Intervention Screen Mount Container | Hour 6 | Standalone component preview page |
| **Member 1** | `GET /student/{id}/history` | Hour 14 | Hardcoded JSON history array |
| **Member 4** | Numerical parameters for 6 animations | Hour 3 | Default textbook constants (e.g., $2(x+3)$) |

### Member 3 Deliverables
1. Six self-contained React SVG animation components in `/components/animations/`.
2. React Flow Graph component in `/components/graph/MisconceptionGraph.jsx`.
3. Dynamic node state controller listening to attempt `stage`.
4. Stage 2 Wow components: Knowledge Evolution Timeline (W6) and Multimodal Fusion Card (W4).

---

## 8. Definition of Done

### Stage 1 (Core Gate Contribution)
- All 6 visual proofs animate smoothly at 60 FPS and explain their respective mathematical laws.
- React Flow graph correctly highlights detected misconceptions and root concepts.
- Graph reflects stage updates (Retry Passed $\to$ Blue, Transfer Verified $\to$ Green, Transfer Failed $\to$ Red Ring).
- Animations fit responsively within Member 2's intervention card layout.

### Stage 2 (Wow Layer Contribution)
- Knowledge Evolution Timeline (W6) plots student progression curves clearly using Recharts.
- Multimodal Fusion Card (W4) renders all available diagnostic dimensions seamlessly.
- Both components toggle cleanly via `features.json` without breaking the core demo.

---

## 9. Implementation Notes & Potential Pitfalls

- **No Generic AI-Generated Images:** All visual proofs must be clean, deterministic SVGs animated with Framer Motion. Do not use generative image placeholders.
- **Responsive SVG ViewBoxes:** Always use `viewBox="0 0 500 300"` with `width="100%"` and `preserveAspectRatio="xMidYMid meet"` to prevent clipping across screen sizes.
- **React Flow Performance:** Ensure nodes and edges use memoized custom node components (`React.memo`) to avoid unnecessary re-renders when parent states change.
- **Hero Moment Animation:** When a student fails the cross-domain transfer test, ensure the graph node's transition to the pulsing red ring is visually dramatic and unmistakable.
