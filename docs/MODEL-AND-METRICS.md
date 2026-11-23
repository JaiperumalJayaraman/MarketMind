# Model and metrics: all numbers are synthetic

**This is a deterministic what-if model, not an empirically calibrated forecast.** Source of truth is [model.js](../src/model.js).

## Starting values

| Monthly assumption | Value |
| --- | ---: |
| Total visitors | 120,000 |
| New visitors | 74,000 |
| Returning visitors | 46,000 |
| New visitor order conversion | 3.8% |
| Returning visitor order conversion | 7.3% |
| Cancellation rate | 10.5% |
| Average order value | ₹1,420 |
| Active sellers | 1,800 |
| Seller retention | 91% |
| Buyer trust index | 61/100 |
| Emerging seller impression share | 32% |
| Take rate | 12% |

Default lever values: verification 25%, protection 20%, discovery 30%, incentive 4%, take rate 12%, seller enablement 25%.

## Metric tree and arithmetic

~~~text
Placed orders = 74,000 × new conversion + 46,000 × returning conversion
Completed orders = placed orders × (1 − cancellation rate)
GMV = completed orders × average order value
Platform revenue = GMV × take rate
Promotional cost = GMV × discount percent × 60% funding assumption
Fixed operating cost = base operating cost + investment by lever
Variable operating cost = placed-order cost + completed-order service cost
Contribution = platform revenue − promotional cost − fixed costs − variable costs
Active sellers = baseline sellers × modeled supply factor
~~~

**GMV is not platform revenue. Contribution is not net profit or EBITDA.** Corporate overheads, taxes, refunds, settlement details and long-run network effects are not completely modeled.

## Assumed causal paths

| Lever | Assumed benefit | Assumed cost/risk |
| --- | --- | --- |
| Seller verification | Trust; improved conversion; fewer cancellations | Vetting cost and onboarding friction |
| Buyer protection | Trust; conversion; fewer cancellations | Claims and service costs |
| Relevance-led ranking | Better buyer conversion | New seller discovery visibility |
| Incentive funding | Increased short-term orders | Subsidy cost and cancellation pressure |
| Commission | Revenue per fulfilled order | Seller supply and retention |
| Seller enablement | Retention, reliability, trust | Operating cost |

The equations use clamped, additive **invented coefficients** to create plausible teaching trade-offs. Alternative coefficients can reverse strategy rankings. There are no estimates of statistical uncertainty or causal identification.

## Guardrails

| Guardrail | Illustrative acceptance rule |
| --- | --- |
| Seller retention | At least 88% |
| Cancellation rate | At most 12% |
| Emerging seller impressions | At least 24% of discovery |
| Monthly contribution | At least ₹0 |

Passing four guardrails is **not** permission to launch. It is a precondition for proposing a controlled experiment. Thresholds are design assumptions, not external standards.

## Sensitivity

Change one slider by one step and hold the other five fixed. Recalculate completed orders, contribution and trust to show directional finite differences. At an upper boundary, use a negative step. **A simulated finite difference is not an A/B test result.**

## Limitations

1. Synthetic rather than observed customer/seller data.
2. One-month snapshot without full seller churn cohorts, seasonality or network feedback.
3. Fairness is represented by emerging-seller impression share, not a comprehensive fairness audit.
4. No city/category heterogeneity or promotion abuse model.
5. No sampling distributions or statistical significance.
6. Results should never be described as actual business outcomes.
