# Product requirements (PRD)

**Product:** MarketMind · **Version:** portfolio MVP · **Industry:** two-sided marketplace.

## Problem

Marketplace teams face a fundamental problem: a metric win for buyers, sellers or the platform may harm the other participants. A PM candidate should demonstrate the ability to reason about these competing consequences and design a way to test their hypotheses.

**Job to be done:** "When considering a marketplace feature or policy, help me see the assumed trade-offs, identify unacceptable risks, and turn the idea into a measurable experiment."

## Users

| User | Primary job |
| --- | --- |
| Aspiring Associate PM | Demonstrate structured strategy and quantitative reasoning |
| Marketplace PM | Facilitate trade-off conversations before committing to analysis |
| PM interviewer | Inspect clarity of problem, metrics, assumptions and decision quality |

## Core journey

1. Orient to the synthetic marketplace context and North Star.
2. Pick Current baseline, Trust first, Growth sprint, Revenue push or Balanced bet.
3. Tune six product levers with immediate visible consequences.
4. Compare completed orders, GMV, contribution, buyer trust, seller health and marketplace fairness.
5. Inspect four launch guardrails and per-lever sensitivity.
6. Open experiment plans, then export a decision memo.

## MVP requirements and acceptance tests

| Requirement | Acceptance condition |
| --- | --- |
| Frictionless onboarding | No auth, keys, install or user-uploaded data |
| Unambiguous outcomes | All top-line metrics show comparison against one baseline |
| Immediate interaction | Each slider change recalculates the model |
| Marketplace safety | Failed guardrails are explicitly marked and explained |
| Decision communication | Export a scenario-aware memo in Markdown |
| Resilience | Works when local browser storage is unavailable |
| Transparency | Synthetic assumptions and model limits are visible |
| Model correctness | Automated invariants and financial identities are tested |

## UX design principles

- Show decisions and outcomes before advanced parameters.
- Make color semantic: passes, failures and deltas have text labels.
- Keep the active slider mounted while its dependent outputs update.
- Maintain visible labels, keyboard navigation and reduced-motion support.
- Provide recognizable scenarios instead of a blank dashboard.
- Keep data-integrity caveats conspicuous.

## Explicitly not in scope

Real marketplace API access; payments; live identity checks; customer interviews completed; statistically valid causal forecasts; production fraud detection; production-scale experimentation platform; predictive ML.

## Risks

- Users might misread toy coefficients as validated facts. **Mitigation:** caveats in every critical view, equations and limitations in docs.
- GMV improvement can distract from contribution and seller outcomes. **Mitigation:** direct comparison and guardrails.
- A one-month model omits long-term network effects. **Mitigation:** flag lagged supply response and demand real pilots.

## Next phase (not implemented)

Conduct real buyer and seller discovery; replace synthetic coefficients with observed estimates; add distributional uncertainty and cohort dynamics; conduct usability testing and instrument pilot events.
