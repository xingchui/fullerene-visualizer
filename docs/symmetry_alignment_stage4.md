Symmetry Alignment — Stage C.4 (CIF-first Fivefold Symmetry)

## Objective
- Establish a robust, repeatable pipeline to align the C70 model with fivefold and mirror symmetry expectations, using CIF-based coordinates as the primary data source.
- Integrate symmetry-driven alignment into the bond data pipeline so that UI and downstream logic always consume a CIF-aligned, symmetry-consistent topology.

## Neutral Threshold Criteria

The following thresholds define when Stage C.4 is considered "neutral" (acceptable):

| Metric | Target | Min | Max | Weight |
|--------|--------|-----|-----|--------|
| s5 (Fivefold) | 0.80 | 0.75 | 1.00 | High |
| sMirror (Mirror) | 0.75 | 0.70 | 1.00 | High |
| E (Edges) | 105 | 102 | 106 | Critical |
| F (Faces) | 37 | 34 | 38 | Critical |
| Vertices | 70 | 70 | 70 | Fixed |

### Stability Criteria (Δ - delta from baseline)
- ΔE ≤ 3 (edge count change)
- Δs5 ≤ 0.07 (fivefold score change)
- ΔsMirror ≤ 0.07 (mirror score change)

## Current Baseline (from Stage C.1 to Stage C.3)
- Data source: CIF fractional coordinates as primary input; XYZ-based coordinates used as optional fallback only.
- Stage C.1: Preliminary symmetry signals observed
- Stage C.2: Procrustes-like alignment with best phi around 0-30 degrees
- Stage C.3: Quantified symmetry scores with phi around 30 degrees (score ~14-15)
- Edge data: 3NN-based edges (Mutual 3NN) used as the primary connectivity source; explicit CIF-edge lists removed to avoid duplication.

## Implementation (Stage C.4)

### Core Functions
- `alignFiveFoldStage4CIF(coords, k)` in `src/data/c70_sym4_align.ts`
  - Converts fractional coords to Cartesian
  - Centers and scales molecule
  - Searches rotation angles 0-360° (step 6°) to maximize edge overlap
  - Computes s5 (fivefold symmetry score)
  - Computes sMirror (mirror symmetry score)

### Symmetry Scoring

**Fivefold Score (s5)**:
- Divide bond midpoints into 5 angular sectors (72° each)
- Calculate standard deviation of bond counts across sectors
- s5 = max(0, 1 - sd/μ) where μ = E/5
- Higher = more uniform fivefold distribution

**Mirror Score (sMirror)**:
- Mirror coordinates across XY plane
- Compute mutual 3NN edges on mirrored coordinates
- Calculate Jaccard similarity: |E ∩ E'| / |E ∪ E'|
- Higher = better mirror symmetry

### Verification Script
- `scripts/a9_stage4_run.js` generates alignment evidence:
  - `alignment_evidence.json` - Machine-readable metrics
  - `alignment_evidence.md` - Human-readable report

## Proposed Long-term Alignment Plan
1. Robust alignment pipeline
   - Implement Procrustes alignment with multiple random restarts to avoid local optima.
   - Use symmetry templates (fivefold and mirror) to steer optimization towards symmetry-preserving orientations.
2. Quantitative symmetry scoring framework
   - Adopt a composite score that includes: (a) fivefold symmetry consistency, (b) mirror symmetry consistency, (c) edge-set stability across a small perturbation grid, (d) alignment score (distance to template coordinates).
   - Define clear thresholds for "Stage 4" to be considered achieved (e.g., fivefold consistency above 0.75, mirror consistency above 0.75, stable edge count within ±2 from 105).
3. Data pipeline integration
   - Ensure c70Data exports consistently use a single source of truth (CIF-derived 3NN edges) across all environments (dev, test, prod).
   - Provide a small CLI tool to re-run the symmetry alignment and verify topologies on demand.
4. Documentation and traceability
   - Maintain a changelog with all symmetry-related changes, decisions, and verifications.
   - Add unit-test stubs for symmetry checks and a small example dataset for regression testing.

## Deliverables
- A robust symmetry-alignment module (Stage C.2–Stage C.4 integrated path).
- Symmetry metrics reports and a standard verification template.
- Updated documentation in repo for future maintenance.
