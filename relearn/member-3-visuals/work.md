# Member 3: Visuals & Interactive Graphics (The Wow) — Work Specification

> **Module Owner:** Member 3 (P3)  
> **Core Focus:** 6 Deterministic Visual Proof Animations, React Flow Live Misconception Graph, Multimodal Fusion Card & Evolution Timeline  
> **Key Mantra:** *"Visual proofs must be mathematically deterministic and intuitive. The graph is the visual soul of the demo — glowing states must respond immediately to diagnosis and transfer."*

---

## 1. Responsibility Summary

Member 3 is the visual designer and interactive graphics engineer for Re:Learn. You are responsible for:
1. Building the **6 pre-built, interactive visual proof animations** (Feature C4) using SVG and Framer Motion (or D3).
2. Prioritizing and delivering the two hero animations first during Hours 1–6: the **Rectangle Area Model** (`PARTIAL_DISTRIBUTION`) and the **Square Expansion Model** (`SQUARE_OF_SUM`).
3. Constructing the interactive **Live Misconception Graph** (Feature C7) using React Flow, mapping 6 misconception nodes to 4 root-concept nodes with dynamic color states and animated edges.
4. Implementing the **Multimodal Fusion Card** (Feature W4), cleanly merging handwritten photo thumbnails, typed equations, self-explanations, and confidence tags.
5. Implementing the **Student Knowledge Evolution Timeline** (Feature W6) using Recharts or SVG, visualizing longitudinal learning trajectories.
6. Consuming data from the `/student/{id}/history` endpoint to drive graph updates and historical views.

---

## 2. Features & Components Owned

| Feature ID | Feature Name | Description | Status / Layer |
|---|---|---|---|
| **C4 (Hero)** | Area Model & Square Model Animations | Interactive SVG proof for `PARTIAL_DISTRIBUTION` and `SQUARE_OF_SUM`. | Core (Hour 1–6) |
| **C4 (Rest)** | Remaining 4 Visual Proof Animations | Number-line reflection, Balance scale, Grouping tiles, Sign pattern. | Core (Hour 7–13) |
| **C7** | Live Misconception Graph | React Flow graph with 6 misconception nodes, 4 root concepts, and 5 dynamic states. | Core (Hour 1–13) |
| **W4** | Multimodal Fusion Diagnostic Card | Integrated card displaying steps, photo, student explanation, and confidence signal. | Wow (Hour 13–18) |
| **W6** | Knowledge Evolution Timeline | Longitudinal Recharts chart showing misconception appearance, resolution, and transfer. | Wow (Hour 13–18) |
| **Client Hook** | `/student/{id}/history` Consumption | Client-side data fetching and state binding for graph and timeline rendering. | Core / Wow |

---

## 3. Ordered Task Breakdown & Timeline

### Hours 0 – 1: Foundation & Contracts
- Confirm the Shared JSON Contract and Graph Node State mappings in `relearn/memory.md`.
- Set up `@xyflow/react` (React Flow), `framer-motion`, and `recharts` in the frontend application.
- Establish visual design tokens: dark slate backgrounds, glowing neon borders, clean vector iconography.

### Hours 1 – 6: Parallel Core Build on Mocks (Hero Animations & Graph Skeleton)
- **Task 1.1: Hero Animation 1 — Rectangle Area Model (`PARTIAL_DISTRIBUTION`):**
  - Interactive SVG visual proof for expressions like $2(x+3)$.
  - Renders a large rectangle of height $2$ partitioned into two sub-rectangles:
    - Left sub-rectangle: width $x$, area $2 \cdot x = 2x$.
    - Right sub-rectangle: width $3$, area $2 \cdot 3 = 6$.
  - Animated reveal: The outer multiplier $2$ sweeps across both dimensions, highlighting that total area is $2x + 6$, visually exposing why $2x + 3$ leaves out the second area component.
  - Parameterized: accepts coefficients from student attempt.
- **Task 1.2: Hero Animation 2 — Square Expansion Model (`SQUARE_OF_SUM`):**
  - Interactive SVG visual proof for $(a+b)^2$.
  - Large square of side $(a+b)$ subdivided into 4 distinct regions:
    - Top-left square: $a \times a = a^2$
    - Bottom-right square: $b \times b = b^2$
    - Top-right and bottom-left rectangles: each $a \times b = ab$
  - Animated reveal: Animates the two missing $ab$ rectangular strips flashing in amber to demonstrate why $(a+b)^2 \ne a^2 + b^2$.
- **Task 1.3: React Flow Graph Skeleton (Feature C7):**
  - Define custom React Flow node components:
    - `RootConceptNode`: Pill/capsule container with subtle ambient glow.
    - `MisconceptionNode`: Rectangular card with status indicator dot and label.
  - Hardcode nodes and edges based on the taxonomy:
    - `DISTRIBUTIVE_LAW` $\to$ `PARTIAL_DISTRIBUTION`, `SQUARE_OF_SUM`, `NEGATIVE_DISTRIBUTION`.
    - `INTEGER_RULES` $\to$ `NEGATIVE_DISTRIBUTION`, `NEG_TIMES_NEG`.
    - `EQUALITY_BALANCE` $\to$ `TRANSPOSITION`.
    - `LIKE_TERMS` $\to$ `UNLIKE_TERMS`.
  - Implement basic node color states (`Inactive` = grey, `Detected` = orange glow).

### Hours 6 – 7: Integration #1 — PARTIAL_DISTRIBUTION End-to-End
- Embed `AreaModelAnimation` into Member 2's Diagnosis/Intervention view.
- Connect React Flow graph: when backend flags `PARTIAL_DISTRIBUTION`, verify that both `PARTIAL_DISTRIBUTION` and `DISTRIBUTIVE_LAW` light up with an animated orange glow.

### Hours 7 – 13: Core Completion (Remaining 4 Animations & Full Graph States)
- **Task 3.1: Animation 3 — Number-Line Reflection (`NEGATIVE_DISTRIBUTION`):**
  - Visual proof for $-(x+5)$. Shows a positive vector $(x+5)$ on a number line, then flips/reflects the entire bracket around $0$ into negative territory, showing that both $x$ and $5$ negate to $-x - 5$.
- **Task 3.2: Animation 4 — Balance Scale (`TRANSPOSITION`):**
  - Visual proof for $x+5=10 \to x=10-5$. Interactive two-pan balance scale. Removing a $5$-weight from the left pan requires removing $5$ from the right pan to preserve balance, demonstrating why sign inversion is required.
- **Task 3.3: Animation 5 — Grouping Tiles (`UNLIKE_TERMS`):**
  - Visual proof for $3x+5 \ne 8x$. Renders 3 elongated rectangular $x$-tiles and 5 square unit tiles. Visually attempts to merge them and shows a dimensional mismatch lock.
- **Task 3.4: Animation 6 — Sign Pattern Number Line (`NEG_TIMES_NEG`):**
  - Visual proof for $(-3)(-4) = +12$. Displays a step-by-step arithmetic sequence on a number line: $-3 \times 2 = -6$, $-3 \times 1 = -3$, $-3 \times 0 = 0$, step size $+3 \to -3 \times -1 = +3 \dots \to +12$.
- **Task 3.5: Reactive Graph States:**
  - Implement full 5-state node styling:
    - `Inactive` (Grey `#9CA3AF`)
    - `Detected` (Orange glow `#F97316` + pulse animation)
    - `Resolved in algebra` (Blue `#3B82F6`)
    - `Transfer verified` (Emerald Green `#10B981`)
    - `Persists in new context` (Crimson Red Ring `#EF4444`)

### Hours 13 – 18: Sleep Rotation & Wow Layer
- **13:00 – 15:30:** Scheduled rest / sleep (~2.5 hours) alongside Member 4.
- **15:30 – 18:00 (Active Build Window):**
  - **Task 4.1: Multimodal Fusion Card (Feature W4):**
    - Consolidate student working: displays typed equation steps, thumbnail of original uploaded photo (from W1), student's explanation text (from W2), and confidence badge (from W3).
  - **Task 4.2: Student Knowledge Evolution Timeline (Feature W6):**
    - Build Recharts timeline component plotting attempts chronologically.
    - Tracks states: Detected $\to$ Resolved in Algebra $\to$ Transfer Status.
    - Wire to `/student/{id}/history` payload.

### Hours 18 – 20: Feature Freeze & Visual Polish
- Zero new features.
- Polish animation frame rates (guarantee 60 FPS transitions).
- Refine React Flow layout coordinates so nodes never overlap or shift abruptly during state updates.

### Hours 20 – 24: Demo Hardening & Rehearsal
- Validate smooth visual transitions during the 2-minute demo sequence.
- Ensure the area model animation and graph glowing effects trigger reliably during the live pitch.

---

## 4. Dependencies & Interface Contracts

### Inputs Needed from Teammates
| Teammate | What You Need | By When | What to Mock Until Received |
|---|---|---|---|
| **Member 1** | Node state payload from `/attempt` and `/student/{id}/history` | Hour 11 | Use mock object `{ "PARTIAL_DISTRIBUTION": "detected" }`. |
| **Member 2** | Mount point container in Diagnosis & Intervention screens | Hour 5 | Build animations inside standalone showcase page. |
| **Member 2** | Image URL and telemetry tags for Fusion Card (W4) | Hour 15 | Use placeholder image and `"low"` confidence string. |
| **Member 4** | Exact coefficient numbers for demo animations | Hour 4 | Use default $2(x+3)$ and $(a+b)^2$. |

### Outputs You Deliver to Teammates
| Teammate | Deliverable | By When |
|---|---|---|
| **Member 2** | `AreaModel` and `SquareModel` React components | Hour 6 (Integration #1) |
| **Member 2** | Remaining 4 animation components | Hour 12 |
| **Member 2** | Standalone `<MisconceptionGraph />` React component | Hour 6 |
| **Member 4** | Embedded graph and timeline for Teacher Dashboard | Hour 16 |

---

## 5. Visual Proof Specifications

| Misconception ID | Visual Model | Visual Concept & Behavior |
|---|---|---|
| `PARTIAL_DISTRIBUTION` | `RectangleAreaModel` | Rectangle partitioned into $2 \times x$ and $2 \times 3$. Highlights that multiplying only $x$ ignores the area $6$. |
| `SQUARE_OF_SUM` | `SquareExpansionModel` | Large square $(a+b)^2$ broken into $a^2, b^2$, and two glowing $ab$ strips that are lost when assuming $a^2+b^2$. |
| `NEGATIVE_DISTRIBUTION` | `NumberLineReflect` | Bracket vector $(x+5)$ rotated $180^\circ$ across origin $0$, showing both terms flip to $-x - 5$. |
| `TRANSPOSITION` | `BalanceScale` | Dual-pan scale with weights. Demonstrates that cancelling $+5$ requires $-5$ on both sides to preserve balance. |
| `UNLIKE_TERMS` | `GroupingTiles` | Geometric tile visualization: 3 $x$-bars and 5 unit squares cannot be merged into 8 $x$-bars. |
| `NEG_TIMES_NEG` | `SignPatternLine` | Step sequence on number line demonstrating $+3$ increment per step backwards, reaching $+12$. |

---

## 6. Definition of Done

### Core Definition of Done (Hour 13 Checkpoint — Non-Negotiable)
- [ ] All 6 visual proof animations render cleanly, accept dynamic numbers, and play without jitter.
- [ ] React Flow misconception graph renders all 6 misconception nodes and 4 root concepts.
- [ ] Graph nodes dynamically transition between the 5 color states based on attempt stages.
- [ ] Multi-root illumination works (e.g. `NEGATIVE_DISTRIBUTION` illuminates both `DISTRIBUTIVE_LAW` and `INTEGER_RULES`).

### Wow Definition of Done (Hour 18 Hard Freeze)
- [ ] W4: Multimodal Fusion Card cleanly presents steps, photo thumbnail, explanation, and confidence badge.
- [ ] W6: Knowledge Evolution Timeline renders longitudinal progress accurately from history data.

---

## 7. Implementation Pitfalls & Graphics Guidelines

1. **Lightweight SVG over Heavy Canvas:** Keep visual proofs in pure SVG and Framer Motion. Avoid heavy WebGL/Three.js or unconstrained HTML5 canvas renders that could cause frame drops on low-power demo laptops.
2. **Deterministic Durations:** Every animation must complete within $2.5$ to $3.5$ seconds so the student or judge is never left waiting during a presentation.
3. **Graph Layout Stability:** Lock node positions in React Flow using fixed $(x, y)$ coordinate tuples. Do not use random force-directed physics layouts that jump around whenever a node changes color.
