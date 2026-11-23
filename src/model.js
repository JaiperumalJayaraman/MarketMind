/**
 * MarketMind's intentionally transparent, deterministic WHAT-IF model.
 * This is a scenario simulator, not a prediction or a report of real users.
 * All coefficients are synthetic assumptions for interview discussion.
 */
export const BASELINE = Object.freeze({
  monthlyVisitors: 120000,
  newVisitors: 74000,
  returningVisitors: 46000,
  newConversion: 0.038,
  returningConversion: 0.073,
  cancellationRate: 0.105,
  averageOrderValue: 1420,
  activeSellers: 1800,
  sellerRetention: 0.91,
  trustIndex: 61,
  sellerHealthIndex: 72,
  emergingSellerExposure: 32,
  currency: 'INR'
});

export const DEFAULT_SETTINGS = Object.freeze({
  verification: 25,
  protection: 20,
  discovery: 30,
  incentive: 4,
  sellerFee: 12,
  sellerEnablement: 25
});

export const CONTROLS = Object.freeze([
  { key: 'verification', label: 'Verified seller coverage', min: 0, max: 100, step: 5, suffix: '%', short: 'Verification',
    help: 'Builds buyer trust and reduces cancellations, but vetting adds cost and onboarding friction.' },
  { key: 'protection', label: 'Buyer protection coverage', min: 0, max: 100, step: 5, suffix: '%', short: 'Protection',
    help: 'Makes purchases feel safer. More coverage also raises claims and service costs.' },
  { key: 'discovery', label: 'Relevance-led ranking', min: 0, max: 100, step: 5, suffix: '%', short: 'Discovery',
    help: 'Improves conversion through relevance, but may reduce exposure for new sellers.' },
  { key: 'incentive', label: 'Platform-funded discount', min: 0, max: 20, step: 1, suffix: '%', short: 'Discounts',
    help: 'Lifts short-term ordering; 60% of discount face value is funded by the marketplace.' },
  { key: 'sellerFee', label: 'Marketplace take rate', min: 6, max: 18, step: 1, suffix: '%', short: 'Take rate',
    help: 'Raises revenue per completed order, while higher fees can hurt seller supply and retention.' },
  { key: 'sellerEnablement', label: 'Seller success investment', min: 0, max: 100, step: 5, suffix: '%', short: 'Seller tools',
    help: 'Improves seller retention and reliability, with higher ongoing support costs.' }
]);

export const PRESETS = Object.freeze({
  baseline: { label: 'Current baseline', tagline: 'The assumed status quo', settings: { ...DEFAULT_SETTINGS } },
  trust: { label: 'Trust first', tagline: 'Reduce purchase anxiety', settings: {
    verification: 90, protection: 80, discovery: 40, incentive: 4, sellerFee: 11, sellerEnablement: 75
  }},
  growth: { label: 'Growth sprint', tagline: 'Prioritize completed orders', settings: {
    verification: 40, protection: 35, discovery: 85, incentive: 12, sellerFee: 11, sellerEnablement: 40
  }},
  revenue: { label: 'Revenue push', tagline: 'Prioritize near-term margin', settings: {
    verification: 30, protection: 25, discovery: 60, incentive: 2, sellerFee: 16, sellerEnablement: 30
  }},
  balanced: { label: 'Balanced bet', tagline: 'Manage both marketplace sides', settings: {
    verification: 65, protection: 55, discovery: 65, incentive: 6, sellerFee: 12, sellerEnablement: 65
  }}
});

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const round = (value, places = 0) => Number(value.toFixed(places));
export const pctChange = (value, baseline) => baseline === 0 ? 0 : (value / baseline - 1) * 100;

export function sanitizeSettings(input = {}) {
  return Object.fromEntries(CONTROLS.map((control) => {
    const raw = Number(input[control.key]);
    const value = Number.isFinite(raw) ? raw : DEFAULT_SETTINGS[control.key];
    const steps = Math.round((clamp(value, control.min, control.max) - control.min) / control.step);
    return [control.key, clamp(control.min + steps * control.step, control.min, control.max)];
  }));
}

export function evaluate(input = DEFAULT_SETTINGS) {
  const s = sanitizeSettings(input);
  const v = (s.verification - 25) / 100;
  const p = (s.protection - 20) / 100;
  const d = (s.discovery - 30) / 100;
  const i = (s.incentive - 4) / 20;
  const e = (s.sellerEnablement - 25) / 100;
  const f = (s.sellerFee - 12) / 100;

  const supplyFactor = clamp(1 - 0.85 * f - 0.035 * v + 0.04 * e, 0.78, 1.13);
  const newConversion = clamp(
    BASELINE.newConversion + .006 * v + .004 * p + .010 * d + .016 * i + .003 * e + .020 * (supplyFactor - 1),
    .01, .18
  );
  const returningConversion = clamp(
    BASELINE.returningConversion + .004 * v + .003 * p + .006 * d + .009 * i + .002 * e + .012 * (supplyFactor - 1),
    .02, .24
  );
  const cancellationRate = clamp(
    BASELINE.cancellationRate - .020 * v - .018 * p - .007 * e + .006 * i
    + .018 * (1 - supplyFactor) + .004 * d,
    .025, .23
  );

  const newOrdersPlaced = BASELINE.newVisitors * newConversion;
  const returningOrdersPlaced = BASELINE.returningVisitors * returningConversion;
  const placedOrders = newOrdersPlaced + returningOrdersPlaced;
  const completedOrders = placedOrders * (1 - cancellationRate);
  const averageOrderValue = BASELINE.averageOrderValue * (1 + .18 * f);
  const gmv = completedOrders * averageOrderValue;
  const platformRevenue = gmv * s.sellerFee / 100;
  const promotionalCost = gmv * (s.incentive / 100) * .60;
  const fixedOperatingCost = 210000 + s.verification * 350 + s.discovery * 200 + s.sellerEnablement * 250;
  const variableOperatingCost = placedOrders * 27 + completedOrders * (16 + s.protection * .32);
  const operatingCost = fixedOperatingCost + variableOperatingCost + promotionalCost;
  const contribution = platformRevenue - operatingCost;
  const activeSellers = BASELINE.activeSellers * supplyFactor;
  const sellerRetention = clamp(
    BASELINE.sellerRetention + .0016 * (s.sellerEnablement - 25)
    - .007 * (s.sellerFee - 12) - .0008 * (s.verification - 25)
    - .0008 * (s.discovery - 30), .6, .98
  );
  const trustIndex = clamp(
    BASELINE.trustIndex + .12 * (s.verification - 25) + .13 * (s.protection - 20)
    + .04 * (s.sellerEnablement - 25) - .10 * (s.incentive - 4) + .02 * (s.discovery - 30), 0, 100
  );
  const sellerHealthIndex = clamp(
    BASELINE.sellerHealthIndex + .18 * (s.sellerEnablement - 25) - .9 * (s.sellerFee - 12)
    - .07 * (s.verification - 25) - .13 * (s.discovery - 30), 0, 100
  );
  const emergingSellerExposure = clamp(
    BASELINE.emergingSellerExposure + .12 * (s.sellerEnablement - 25)
    - .20 * (s.discovery - 30) - .11 * (s.verification - 25), 10, 50
  ) / 100;

  const guardrails = [
    { id: 'retention', label: 'Seller retention', value: sellerRetention, threshold: .88,
      passes: sellerRetention >= .88, unit: 'percent', direction: 'min',
      detail: 'Protect long-term seller participation.' },
    { id: 'cancellations', label: 'Cancellations', value: cancellationRate, threshold: .12,
      passes: cancellationRate <= .12, unit: 'percent', direction: 'max',
      detail: 'Prevent customer disappointment and wasted spend.' },
    { id: 'fairness', label: 'New seller exposure', value: emergingSellerExposure, threshold: .24,
      passes: emergingSellerExposure >= .24, unit: 'percent', direction: 'min',
      detail: 'Keep discovery accessible for emerging sellers.' },
    { id: 'profit', label: 'Contribution', value: contribution, threshold: 0,
      passes: contribution >= 0, unit: 'currency', direction: 'min',
      detail: 'Avoid strategies that lose money before fixed corporate overhead.' }
  ];

  const warningCount = guardrails.filter(g => !g.passes).length;
  return {
    settings: s,
    audience: BASELINE.monthlyVisitors,
    newConversion,
    returningConversion,
    newOrdersPlaced,
    returningOrdersPlaced,
    placedOrders,
    completedOrders,
    cancellationRate,
    averageOrderValue,
    gmv,
    platformRevenue,
    promotionalCost,
    fixedOperatingCost,
    variableOperatingCost,
    operatingCost,
    contribution,
    takeRate: s.sellerFee / 100,
    activeSellers,
    sellerRetention,
    trustIndex,
    sellerHealthIndex,
    emergingSellerExposure,
    guardrails,
    warningCount,
    recommendation: warningCount > 0
      ? 'Revise before launch: ' + warningCount + ' marketplace guardrail' + (warningCount > 1 ? 's' : '') + ' breached.'
      : 'Eligible for a controlled experiment; projected performance is not observed evidence.'
  };
}

export const BASELINE_RESULT = evaluate(DEFAULT_SETTINGS);

export function compare(result, base = BASELINE_RESULT) {
  return {
    completedOrders: pctChange(result.completedOrders, base.completedOrders),
    gmv: pctChange(result.gmv, base.gmv),
    contribution: result.contribution - base.contribution,
    trustIndex: result.trustIndex - base.trustIndex,
    sellerRetention: (result.sellerRetention - base.sellerRetention) * 100,
    cancellations: (result.cancellationRate - base.cancellationRate) * 100,
    activeSellers: pctChange(result.activeSellers, base.activeSellers)
  };
}

export function sensitivity(input, base = evaluate(input)) {
  return CONTROLS.map(control => {
    const next = sanitizeSettings(input);
    const increment = next[control.key] + control.step <= control.max ? control.step : -control.step;
    next[control.key] += increment;
    const test = evaluate(next);
    return {
      key: control.key,
      label: control.short,
      step: increment,
      completedOrders: round(test.completedOrders - base.completedOrders),
      contribution: round(test.contribution - base.contribution),
      trustIndex: round(test.trustIndex - base.trustIndex, 2)
    };
  });
}

export function proposedExperiments(result = BASELINE_RESULT) {
  const s = result.settings;
  return [
    {
      id: 'trust', area: 'Trust & safety', title: 'Does verification improve first-order confidence?',
      hypothesis: 'If verified sellers are clearer at selection, new-buyer completed orders will rise without damaging seller activation.',
      experiment: 'Randomize eligible new visitors 50/50. Show a verified-seller badge and simple trust explainer to treatment only.',
      primary: 'New-buyer completed orders per eligible visitor',
      guardrails: 'Seller activation time, seller retention, support cases, cancellations',
      duration: '2-week minimum; extend based on actual sample size and traffic',
      variant: s.verification >= 60 ? 'Matches current investment direction' : 'Candidate next bet',
      event: 'verification_badge_viewed'
    },
    {
      id: 'discovery', area: 'Discovery', title: 'Can relevance improve conversion without freezing new sellers out?',
      hypothesis: 'Ranking by intent lifts completed orders while an exposure floor preserves opportunity for emerging sellers.',
      experiment: 'Randomize sessions to baseline ranking vs relevance ranking with an emerging-seller exposure floor.',
      primary: 'Completed orders / discovery sessions',
      guardrails: 'Emerging-seller impressions share >= 24%, cancellations, search latency',
      duration: '2-week minimum; run a power calculation before launching',
      variant: result.emergingSellerExposure < .24 ? 'Current plan violates proposed fairness floor' : 'Available to test',
      event: 'search_results_viewed'
    },
    {
      id: 'pricing', area: 'Monetization', title: 'Will a different take rate improve net contribution?',
      hypothesis: 'Commission changes may raise unit margin but could reduce seller participation and future GMV.',
      experiment: 'Pilot pricing with consenting seller cohorts, stratified by category; avoid surprising existing sellers.',
      primary: 'Contribution per active seller',
      guardrails: 'Seller retention >= 88%, active listings, buyer conversion, support tickets',
      duration: '4-8 weeks to observe meaningful seller behavior',
      variant: s.sellerFee >= 15 ? 'High-risk pricing pilot' : 'Candidate pricing study',
      event: 'seller_fee_offer_viewed'
    }
  ];
}

export function currency(amount, compact = false) {
  if (!Number.isFinite(amount)) return '—';
  const abs = Math.abs(amount);
  if (compact && abs >= 1e7) return '₹' + (amount / 1e7).toFixed(2) + 'Cr';
  if (compact && abs >= 1e5) return '₹' + (amount / 1e5).toFixed(2) + 'L';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function number(value, decimals = 0) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value);
}

export const percent = (fraction, decimals = 1) => (fraction * 100).toFixed(decimals) + '%';
