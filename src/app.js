import {
  BASELINE, BASELINE_RESULT, CONTROLS, DEFAULT_SETTINGS, PRESETS,
  evaluate, compare, sensitivity, proposedExperiments, currency, number, percent
} from './model.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const STORAGE_KEY = 'marketmind_saved_v1';
const VIEWS = { lab: 'Strategy lab', experiments: 'Experiment plans', memo: 'Decision memo' };

function savedFromStorage() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, 3).filter(item => item && typeof item.name === 'string'
      && item.settings && typeof item.settings === 'object');
  } catch { return []; }
}

const state = {
  settings: { ...PRESETS.balanced.settings },
  preset: 'balanced',
  saved: savedFromStorage(),
  view: 'lab'
};

let toastTimer;
const signed = (n, decimals = 1) => (n > 0 ? '+' : '') + number(n, decimals);
const deltaClass = (n, greaterIsBetter = true) => Math.abs(n) < 0.00001
  ? 'trend-neutral' : (n > 0) === greaterIsBetter ? 'trend-good' : 'trend-warn';
const shortMoney = n => currency(n, true);
const htmlEscape = value => String(value).replace(/[&<>"']/g, ch =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

function notify(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function paintPresets() {
  $('#preset-list').innerHTML = Object.entries(PRESETS).map(([key, preset]) =>
    '<button type="button" class="preset' + (state.preset === key ? ' active' : '') +
    '" data-preset="' + key + '" aria-pressed="' + (state.preset === key) + '">' +
    '<span class="preset-name">' + htmlEscape(preset.label) + '</span>' +
    '<span class="preset-tag">' + htmlEscape(preset.tagline) + '</span></button>'
  ).join('');
}

function paintControls() {
  $('#control-list').innerHTML = CONTROLS.map(c =>
    '<div class="control"><div class="control-label-row">' +
    '<label class="control-label" for="control-' + c.key + '">' + htmlEscape(c.label) + '</label>' +
    '<output class="control-value" for="control-' + c.key + '" id="value-' + c.key + '">' +
      state.settings[c.key] + c.suffix + '</output></div>' +
    '<input aria-describedby="help-' + c.key + '" type="range" id="control-' + c.key +
      '" data-control="' + c.key + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step +
      '" value="' + state.settings[c.key] + '">' +
    '<div class="range-ends"><span>' + c.min + c.suffix + '</span><span>' + c.max + c.suffix + '</span></div>' +
    '<div class="control-help" id="help-' + c.key + '">' + htmlEscape(c.help) + '</div></div>'
  ).join('');
}

function updateInputs() {
  for (const c of CONTROLS) {
    const input = $('#control-' + c.key);
    input.value = state.settings[c.key];
    $('#value-' + c.key).textContent = state.settings[c.key] + c.suffix;
  }
}

function metricCard(label, main, delta, deltaLabel, good, description) {
  return '<article class="kpi" title="' + htmlEscape(description) + '">' +
    '<div class="kpi-label">' + htmlEscape(label) + '</div>' +
    '<div class="kpi-value">' + main + '</div>' +
    '<div class="kpi-trend"><span class="' + deltaClass(delta, good) + '">' +
    deltaLabel + '</span> vs baseline</div></article>';
}

function paintKPIs(result, diff) {
  $('#kpi-grid').innerHTML = [
    metricCard('Completed orders', number(result.completedOrders), diff.completedOrders,
      signed(diff.completedOrders) + '%', true, 'Monthly orders fulfilled after cancellations'),
    metricCard('Gross merchandise value', shortMoney(result.gmv), diff.gmv,
      signed(diff.gmv) + '%', true, 'Value of completed orders before platform take rate'),
    metricCard('Contribution', shortMoney(result.contribution), diff.contribution,
      (diff.contribution >= 0 ? '+' : '') + shortMoney(diff.contribution), true,
      'Marketplace revenue minus promotional, fixed operating, and variable costs'),
    metricCard('Buyer trust index', number(result.trustIndex, 1) + '/100', diff.trustIndex,
      signed(diff.trustIndex) + ' pts', true, 'Synthetic directional trust index; not an observed survey')
  ].join('');
}

function chartRow(label, current, baseline, formatter) {
  const scale = Math.max(Math.abs(current), Math.abs(baseline), 1);
  const a = Math.max(0, current) / scale * 100;
  const b = Math.max(0, baseline) / scale * 100;
  return '<div class="chart-row"><div class="chart-label"><span>' + label +
    '</span><strong>' + formatter(current) + '</strong></div><div class="chart-bars">' +
    '<div class="bar-track"><div class="bar-baseline" style="width:' + b.toFixed(2) + '%"></div></div>' +
    '<div class="bar-track"><div class="bar-scenario" style="width:' + a.toFixed(2) + '%"></div></div>' +
    '</div></div>';
}

function paintComparison(result) {
  $('#comparison-chart').innerHTML = [
    chartRow('Completed orders', result.completedOrders, BASELINE_RESULT.completedOrders, n => number(n)),
    chartRow('Gross merchandise value', result.gmv, BASELINE_RESULT.gmv, shortMoney),
    chartRow('Contribution', result.contribution, BASELINE_RESULT.contribution, shortMoney)
  ].join('');
}

function healthRow(label, value, maximum, detail, formatter) {
  const width = Math.min(100, Math.max(0, value / maximum * 100));
  return '<div class="health-row"><div class="health-top"><span>' + htmlEscape(label) +
    '</span><strong>' + formatter(value) + '</strong></div>' +
    '<div class="health-track"><div class="health-fill" style="width:' + width.toFixed(2) + '%"></div></div>' +
    '<div class="health-note">' + htmlEscape(detail) + '</div></div>';
}

function paintHealth(result) {
  $('#health-metrics').innerHTML = [
    healthRow('Seller retention', result.sellerRetention, 1, 'Monthly proportion of active sellers staying active', x => percent(x)),
    healthRow('Emerging seller discovery share', result.emergingSellerExposure, .5,
      'Share of discovery impressions; bar is scaled to 50%', x => percent(x)),
    healthRow('Buyer trust index', result.trustIndex, 100, 'Synthetic directional score / 100', x => number(x, 1) + '/100'),
    healthRow('Active sellers', result.activeSellers, BASELINE.activeSellers * 1.15,
      'Estimated supply after fee and onboarding trade-offs', x => number(x))
  ].join('');
}

function guardFormat(guardrail, value) {
  return guardrail.unit === 'currency' ? shortMoney(value) : percent(value);
}

function paintGuardrails(result) {
  $('#guardrail-count').className = 'guard-counter' + (result.warningCount ? ' failed' : '');
  $('#guardrail-count').textContent = result.warningCount ? result.warningCount + ' to review' : '4 of 4 passed';
  $('#guardrails').innerHTML = result.guardrails.map(g =>
    '<div class="guardrail' + (g.passes ? '' : ' failed') + '">' +
    '<span class="guard-icon" aria-label="' + (g.passes ? 'Pass' : 'Fail') + '">' + (g.passes ? '✓' : '!') + '</span>' +
    '<div class="guard-text"><strong>' + g.label + '</strong><small>' +
    (g.direction === 'min' ? 'Minimum ' : 'Maximum ') + guardFormat(g, g.threshold) +
    ' · ' + g.detail + '</small></div><span class="guard-value">' + guardFormat(g, g.value) + '</span></div>'
  ).join('');
  $('#recommendation').className = 'recommendation' + (result.warningCount ? ' failed' : '');
  $('#recommendation').textContent = result.recommendation;
}

function signedQuantity(value, suffix = '', digits = 0) {
  return (value > 0 ? '+' : '') + number(value, digits) + suffix;
}

function paintSensitivity(result) {
  $('#sensitivity-table').innerHTML = sensitivity(state.settings, result).map(item =>
    '<tr><td>' + item.label + ' (' + (item.step > 0 ? '+' : '') + item.step + 'pp)</td>' +
    '<td class="' + (item.completedOrders >= 0 ? 'delta-up' : 'delta-down') + '">' +
      signedQuantity(item.completedOrders) + '</td>' +
    '<td class="' + (item.contribution >= 0 ? 'delta-up' : 'delta-down') + '">' +
      (item.contribution > 0 ? '+' : '') + shortMoney(item.contribution) + '</td>' +
    '<td>' + signedQuantity(item.trustIndex, ' pts', 2) + '</td></tr>'
  ).join('');
}

function paintExperiments(result) {
  $('#experiment-cards').innerHTML = proposedExperiments(result).map((exp, index) =>
    '<article class="exp-card"><div class="exp-top">EXPERIMENT 0' + (index + 1) +
    ' · ' + exp.area.toUpperCase() + '</div><h3>' + htmlEscape(exp.title) + '</h3>' +
    '<p>' + htmlEscape(exp.hypothesis) + '</p><div class="exp-line"></div>' +
    '<div class="exp-section"><b>TEST DESIGN</b><p>' + htmlEscape(exp.experiment) + '</p></div>' +
    '<div class="exp-section"><b>PRIMARY SUCCESS METRIC</b><p>' + htmlEscape(exp.primary) + '</p></div>' +
    '<div class="exp-section"><b>GUARDRAILS</b><p>' + htmlEscape(exp.guardrails) + '</p></div>' +
    '<div class="exp-section"><b>MEASUREMENT WINDOW</b><p>' + htmlEscape(exp.duration) + '</p></div>' +
    '<div class="exp-section"><b>EXPOSURE EVENT</b><code>' + htmlEscape(exp.event) + '</code></div>' +
    '<span class="exp-tag">' + htmlEscape(exp.variant) + '</span></article>'
  ).join('');
}

function scenarioName() {
  return PRESETS[state.preset]?.label || 'Custom strategy';
}

function recommendation(result) {
  const failed = result.guardrails.filter(g => !g.passes);
  if (failed.length) return {
    headline: 'Hold launch. Redesign and re-test.',
    statement: 'This scenario breaches ' + failed.length + ' marketplace guardrail' +
      (failed.length === 1 ? '' : 's') + '. Revise the trade-offs before exposing customers or sellers.',
    risk: failed.map(g => g.label + ': ' + guardFormat(g, g.value) + ' vs ' +
      (g.direction === 'min' ? 'minimum ' : 'maximum ') + guardFormat(g, g.threshold))
  };
  return {
    headline: 'Run a controlled experiment; do not ship yet.',
    statement: 'The model clears all four guardrails. That makes the strategy eligible for validation, not proven effective.',
    risk: [
      'The coefficients are illustrative and not causally identified.',
      'Seller responses may lag beyond one month.',
      'Conversion gains may not persist after discount withdrawal.'
    ]
  };
}

function memoMarkdown(result) {
  const diff = compare(result);
  const decision = recommendation(result);
  const experiment = proposedExperiments(result)[result.settings.discovery > 65 ? 1 : result.settings.sellerFee >= 15 ? 2 : 0];
  return [
    '# MarketMind | Product Decision Memo',
    '',
    '**Scenario:** ' + scenarioName(),
    '**Context:** Synthetic Indian two-sided marketplace · monthly snapshot',
    '**Decision:** ' + decision.headline,
    '',
    '## Problem',
    'How can a marketplace improve completed orders and platform contribution while protecting buyer confidence, seller retention, and fair discovery?',
    '',
    '## Recommendation',
    decision.statement,
    '',
    '## Modeled upside / downside (NOT actual results)',
    '- Completed orders: ' + number(result.completedOrders) + ' (' + signed(diff.completedOrders) + '% vs baseline)',
    '- GMV: ' + shortMoney(result.gmv) + ' (' + signed(diff.gmv) + '%)',
    '- Contribution: ' + shortMoney(result.contribution) + ' (' +
        (diff.contribution >= 0 ? '+' : '') + shortMoney(diff.contribution) + ' vs baseline)',
    '- Trust score: ' + number(result.trustIndex, 1) + '/100',
    '- Monthly seller retention: ' + percent(result.sellerRetention),
    '- Emerging seller discovery exposure: ' + percent(result.emergingSellerExposure),
    '',
    '## Guardrails / principal uncertainties',
    ...decision.risk.map(item => '- ' + item),
    '',
    '## First experiment',
    '**' + experiment.title + '**',
    '- Hypothesis: ' + experiment.hypothesis,
    '- Method: ' + experiment.experiment,
    '- Primary metric: ' + experiment.primary,
    '- Guardrails: ' + experiment.guardrails,
    '- Timing: ' + experiment.duration,
    '',
    '## 30 / 60 / 90-day plan',
    '- **Days 1-30:** Interview new buyers and sellers, audit instrumentation, establish a real baseline and sample-size requirements.',
    '- **Days 31-60:** Run a randomized or controlled pilot with holdouts; monitor guardrails daily and analyze cohorts.',
    '- **Days 61-90:** Decide ship/iterate/stop based on incremental completed orders, contribution and supply health; publish learnings.',
    '',
    '## Model disclosure',
    'All inputs, relationships, and outcomes are synthetic. This document is a product reasoning exercise, not measured marketplace performance.',
    '',
    '## Scenario settings',
    ...CONTROLS.map(c => '- ' + c.label + ': ' + result.settings[c.key] + c.suffix),
    ''
  ].join('\n');
}

function paintMemo(result) {
  const diff = compare(result);
  const decision = recommendation(result);
  const list = decision.risk.map(item => '<li>' + htmlEscape(item) + '</li>').join('');
  $('#memo-content').innerHTML =
    '<div class="memo-grid"><div>' +
    '<article class="memo-head"><div class="card-eyebrow">PRODUCT DECISION / ' + htmlEscape(scenarioName()).toUpperCase() +
    '</div><h3>' + htmlEscape(decision.headline) + '</h3>' +
    '<p class="memo-statement">' + htmlEscape(decision.statement) + '</p>' +
    '<div class="exp-line"></div><div class="card-eyebrow">PROBLEM</div>' +
    '<p style="margin-top:10px">How might we improve completed orders and contribution while keeping buyers confident and sellers thriving?</p>' +
    '</article><article class="memo-card" style="margin-top:18px">' +
    '<div class="card-eyebrow">REASONING</div><h3>Evidence still needed</h3><ul class="memo-list">' + list +
    '</ul><div class="memo-warning">Model outputs are synthetic. Validate the causal hypothesis, cohort effects and real-world unit economics before rollout.</div></article>' +
    '<article class="memo-card"><div class="card-eyebrow">EXECUTION</div><h3>30 / 60 / 90-day plan</h3>' +
    '<ul class="memo-list"><li><b>Days 1–30:</b> &nbsp; Buyer and seller interviews, telemetry audit, baseline and power analysis.</li>' +
    '<li><b>Days 31–60:</b> &nbsp; Controlled pilot, daily guardrail review and segmented analysis.</li>' +
    '<li><b>Days 61–90:</b> &nbsp; Ship, iterate or stop based on incremental impact and seller health.</li></ul>' +
    '</article></div><div><article class="memo-card"><div class="card-eyebrow">THE NUMBERS</div><h3>Modeled monthly impact</h3>' +
    '<div class="memo-mini"><span>Completed orders</span><strong>' + number(result.completedOrders) +
      ' (' + signed(diff.completedOrders) + '%)</strong></div>' +
    '<div class="memo-mini"><span>Contribution</span><strong>' + shortMoney(result.contribution) + '</strong></div>' +
    '<div class="memo-mini"><span>Platform GMV</span><strong>' + shortMoney(result.gmv) + '</strong></div>' +
    '<div class="memo-mini"><span>Buyer trust score</span><strong>' + number(result.trustIndex, 1) + '/100</strong></div>' +
    '<div class="memo-mini"><span>Seller retention</span><strong>' + percent(result.sellerRetention) + '</strong></div>' +
    '<div class="memo-mini"><span>Guardrails passed</span><strong>' +
      (4 - result.warningCount) + '/4</strong></div></article>' +
    '<article class="memo-card"><div class="card-eyebrow">PRINCIPLE</div><h3>Balance both sides</h3>' +
    '<p>Short-term GMV alone is not a North Star. This proposal pairs completed orders with contribution and supply-side quality guardrails.</p>' +
    '</article></div></div>';
}

function refresh() {
  const result = evaluate(state.settings);
  const diff = compare(result);
  paintPresets();
  paintKPIs(result, diff);
  paintComparison(result);
  paintHealth(result);
  paintGuardrails(result);
  paintSensitivity(result);
  paintExperiments(result);
  paintMemo(result);
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved)); return true; }
  catch { return false; }
}

function paintSaved() {
  $('#saved-list').innerHTML = state.saved.length
    ? state.saved.map((s, i) => '<button class="saved-item" type="button" data-saved="' +
        i + '">' + htmlEscape(s.name) + '<span>↗</span></button>').join('') +
      '<button class="saved-clear" type="button" id="clear-saved">Clear saved strategies</button>'
    : '<p class="muted tiny">No saved strategies yet</p>';
}

function setPreset(name) {
  if (!PRESETS[name]) return;
  state.settings = { ...PRESETS[name].settings };
  state.preset = name;
  updateInputs();
  refresh();
}

function setView(view, updateHash = true) {
  if (!VIEWS[view]) view = 'lab';
  state.view = view;
  $$('.view').forEach(el => { el.hidden = el.id !== 'view-' + view; });
  $$('[data-view-link]').forEach(button => {
    const active = button.dataset.viewLink === view;
    button.classList.toggle('active', active);
    active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current');
  });
  $('#view-label').textContent = VIEWS[view];
  if (updateHash && window.location.hash !== '#' + view) window.location.hash = view;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function download(name, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function saveScenario() {
  const nextIndex = state.saved.reduce((max, item) => {
    const match = item.name.match(/^Saved strategy (\d+)$/);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0) + 1;
  state.saved.unshift({ name: 'Saved strategy ' + nextIndex, settings: { ...state.settings } });
  state.saved = state.saved.slice(0, 3);
  const ok = persist();
  paintSaved();
  notify(ok ? 'Strategy saved in this browser.' : 'Browser storage unavailable; scenario saved for this session.');
}

function attachEvents() {
  $('#preset-list').addEventListener('click', event => {
    const target = event.target.closest('[data-preset]');
    if (target) setPreset(target.dataset.preset);
  });
  $('#control-list').addEventListener('input', event => {
    const input = event.target.closest('[data-control]');
    if (!input) return;
    state.settings[input.dataset.control] = Number(input.value);
    state.preset = 'custom';
    $('#value-' + input.dataset.control).textContent = input.value + '%';
    refresh();
  });
  $$('[data-view-link]').forEach(el => el.addEventListener('click', () => setView(el.dataset.viewLink)));
  $('#reset-btn').addEventListener('click', () => { setPreset('baseline'); notify('Reset to the baseline.'); });
  $('#save-btn').addEventListener('click', saveScenario);
  $('#saved-list').addEventListener('click', event => {
    if (event.target.id === 'clear-saved') {
      state.saved = []; persist(); paintSaved(); notify('Saved strategies cleared.'); return;
    }
    const target = event.target.closest('[data-saved]');
    if (!target) return;
    const item = state.saved[Number(target.dataset.saved)];
    if (!item) return;
    state.settings = { ...DEFAULT_SETTINGS, ...item.settings };
    state.preset = 'custom';
    updateInputs(); refresh(); setView('lab');
    notify('Saved strategy loaded.');
  });
  $('#download-memo').addEventListener('click', () => {
    download('MarketMind_Product_Decision_Memo.md', memoMarkdown(evaluate(state.settings)), 'text/markdown;charset=utf-8');
    notify('Decision memo downloaded.');
  });
  window.addEventListener('hashchange', () => setView(location.hash.slice(1), false));
}

paintControls();
paintSaved();
refresh();
attachEvents();
setView(location.hash.slice(1) || 'lab', false);
