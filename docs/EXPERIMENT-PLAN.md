# Experimentation and rollout design

These are **proposed experiments** only. No user interviews, randomized tests or statistical analyses have been performed for this prototype.

## Discovery plan (not completed)

Interview 8–12 people across new buyers, returning buyers, new sellers and established sellers. Study checkout abandonment and verification confusion, discovery rankings, seller activation barriers and commission sensitivity. Use findings to revise both hypotheses and the synthetic model.

## Experiment A: verification

**Problem:** New buyers may hesitate to transact with unknown sellers.

**Hypothesis:** A clear verified-seller badge and trust explanation increase first-time completed-order conversion.

**Design:** Assign eligible new visitors to persistent 50/50 control and treatment cohorts. Treatment sees the trust cue; control does not.

**Primary metric:** completed orders / eligible new buyers exposed.

**Guardrails:** seller activation time, cancellations, support rate and seller retention.

**Pitfalls:** badges must represent a meaningful, audited verification standard; avoid misleading claims.

## Experiment B: ranking and seller fairness

**Problem:** Increasing relevance may make emerging sellers invisible.

**Hypothesis:** Relevance scoring with a new-seller exposure floor improves completed orders while preserving the opportunity to compete.

**Design:** Randomize discovery sessions or buyers with assignment persistence. Compare baseline rankings with relevance + exposure floor.

**Primary metric:** completed orders / eligible discovery sessions.

**Guardrails:** emerging-seller impression share >= 24%, result latency, cancellations and complaints.

**Pitfalls:** seller-side network interference; impression share alone cannot define fairness.

## Experiment C: commission and unit economics

**Problem:** A higher take rate may increase contribution but cause seller attrition.

**Hypothesis:** A transparent commission pilot can improve contribution per seller without materially lowering retained supply.

**Design:** Opt-in or carefully stratified seller cohorts; avoid surprise changes to existing agreements.

**Primary metric:** contribution per active seller.

**Guardrails:** seller retention >= 88%, active listings, cancellations, support tickets and completed orders.

**Pitfalls:** seller behavior changes may lag by weeks; pricing affects product selection and buyer prices.

## Pre-registration and decision policy

Before each launch: define assignment, exposure, primary metric, guardrails, analysis method, minimum detectable effect, baseline rate, power, sample size and stop criteria using **real traffic**. A minimum two-week window may cover weekdays but does not guarantee adequate statistical power.

| Result | Action |
| --- | --- |
| Incremental North Star win, acceptable guardrails and robust evidence | Consider phased rollout |
| Ambiguous effect and healthy guardrails | Revisit power; iterate |
| Buyer metric improves but seller/fairness guardrail fails | Do not ship unchanged |
| Negative unit economics or materially worsened cancellations | Stop/redesign |
| Broken randomization or missing events | Invalidate test; fix telemetry |

## Proposed event names (not implemented live)

- experiment_exposed: visitor_id, experiment_id, variant, timestamp
- verification_badge_viewed: seller_id, placement, session_id
- search_results_viewed: seller_ids, positions, emerging_share
- order_placed: order_id, buyer_id, seller_id, GMV
- order_completed: order_id, completion_time, paid_amount, incentive_cost
- seller_active_week: seller_id, cohort, week_start

For real telemetry, use privacy-safe pseudonyms and review consent, retention, and access policies.

## Interview answer

"I constructed a transparent what-if model to expose marketplace trade-offs, not to claim real-world uplift. The success metric is completed orders, subject to contribution, cancellation, seller retention and discovery fairness guardrails. My next step would be powered experimentation informed by qualitative user discovery."
