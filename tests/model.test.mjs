import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASELINE, BASELINE_RESULT, DEFAULT_SETTINGS, PRESETS,
  sanitizeSettings, evaluate, compare, sensitivity, proposedExperiments
} from '../src/model.js';

test('baseline settings reproduce baseline conversion rates and cancellation', () => {
  assert.equal(BASELINE_RESULT.newConversion, BASELINE.newConversion);
  assert.equal(BASELINE_RESULT.returningConversion, BASELINE.returningConversion);
  assert.equal(BASELINE_RESULT.cancellationRate, BASELINE.cancellationRate);
  assert.equal(BASELINE_RESULT.activeSellers, BASELINE.activeSellers);
  assert.equal(BASELINE_RESULT.trustIndex, BASELINE.trustIndex);
  assert.equal(BASELINE_RESULT.guardrails.every(g => g.passes), true);
});

test('presets are valid and never create impossible flows', () => {
  for (const [name, preset] of Object.entries(PRESETS)) {
    const result = evaluate(preset.settings);
    assert.ok(Number.isFinite(result.contribution), name);
    assert.ok(result.completedOrders <= result.placedOrders, name);
    assert.ok(result.placedOrders <= result.audience, name);
    assert.ok(result.completedOrders >= 0, name);
    assert.ok(result.gmv >= 0, name);
    assert.ok(result.cancellationRate >= 0 && result.cancellationRate <= 1, name);
    assert.ok(result.emergingSellerExposure >= 0 && result.emergingSellerExposure <= 1, name);
    assert.ok(result.sellerRetention >= 0 && result.sellerRetention <= 1, name);
  }
});

test('verification improves buyer trust and reduces cancellation given other settings held fixed', () => {
  const increased = evaluate({ ...DEFAULT_SETTINGS, verification: 80 });
  assert.ok(increased.trustIndex > BASELINE_RESULT.trustIndex);
  assert.ok(increased.cancellationRate < BASELINE_RESULT.cancellationRate);
});

test('higher commission raises platform revenue per GMV but reduces seller retention', () => {
  const high = evaluate({ ...DEFAULT_SETTINGS, sellerFee: 18 });
  assert.ok(high.takeRate > BASELINE_RESULT.takeRate);
  assert.ok(high.sellerRetention < BASELINE_RESULT.sellerRetention);
  assert.ok(high.activeSellers < BASELINE_RESULT.activeSellers);
});

test('discovery changes may violate emerging seller exposure guardrail', () => {
  const risky = evaluate({ ...DEFAULT_SETTINGS, discovery: 100 });
  assert.ok(risky.emergingSellerExposure < BASELINE_RESULT.emergingSellerExposure);
  assert.equal(risky.guardrails.find(g => g.id === 'fairness').passes, false);
});

test('financial accounting balances', () => {
  const result = evaluate(PRESETS.growth.settings);
  assert.ok(Math.abs(result.platformRevenue - result.operatingCost - result.contribution) < 1e-7);
  assert.ok(Math.abs(result.operatingCost - result.promotionalCost -
    result.fixedOperatingCost - result.variableOperatingCost) < 1e-7);
  assert.ok(Math.abs(result.completedOrders * result.averageOrderValue - result.gmv) < 1e-7);
});

test('invalid settings are bounded and missing values receive safe defaults', () => {
  const clean = sanitizeSettings({ verification: 140, sellerFee: -100, discovery: NaN });
  assert.equal(clean.verification, 100);
  assert.equal(clean.sellerFee, 6);
  assert.equal(clean.discovery, DEFAULT_SETTINGS.discovery);
  assert.deepEqual(evaluate({}).settings, DEFAULT_SETTINGS);
});

test('comparison against the same baseline is zero and sensitivities are finite', () => {
  const diff = compare(BASELINE_RESULT);
  Object.values(diff).forEach(value => assert.ok(Math.abs(value) < 1e-10));
  assert.equal(sensitivity(DEFAULT_SETTINGS).length, 6);
  for (const item of sensitivity(DEFAULT_SETTINGS)) {
    assert.ok(Number.isFinite(item.completedOrders));
    assert.ok(Number.isFinite(item.contribution));
    assert.ok(Number.isFinite(item.trustIndex));
  }
  assert.equal(proposedExperiments().length, 3);
});
