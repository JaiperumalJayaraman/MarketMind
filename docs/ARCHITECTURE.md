# Architecture and implementation

## Dependency-free static application

~~~text
index.html           semantic app shell, three views
styles.css           responsive layout, state styles, design tokens
assets/favicon.svg   vector brand mark
src/app.js           DOM updates, scenario selection, storage, memo export
src/model.js         pure deterministic model, presets, guardrails, experiments
tests/model.test.mjs built-in Node.js unit tests (no NPM dependencies)
~~~

No backend, authentication, analytics endpoint, live API or external data source. Google Fonts is optional; system fonts are fallbacks.

## Data flow

~~~text
User selects preset / adjusts slider
           |
     UI settings state
           |
     sanitizeSettings()
           |
     evaluate(settings)
           |
        result
           |
   +-------+---------+-----------------+
   |       |         |                 |
 KPI view  charts  health/guardrails  sensitivity
           |
  experiments and decision memo
           |
  Markdown Blob download

Optional: localStorage of three scenario settings only
~~~

## Engineering decisions

**Pure model functions:** enables unit tests and reproducible results; separate model and presentation.

**Controls remain mounted:** changing a slider refreshes results without destroying slider focus or drag state.

**Preset-first UX:** exposes product intent and avoids a blank dashboard.

**Zero infrastructure:** readers can run the site via local HTTP server or GitHub Pages.

**No unearned claims:** tests check arithmetic and invariants, not market predictive accuracy.

**Storage failure recovery:** restrictions on localStorage never prevent core simulation.

**Accessible HTML:** real labels, button semantics, status text, visible keyboard focus and reduced motion support.

## Commands

~~~bash
python -m http.server 8000
npm test
~~~

ES modules should be served through HTTP; double-clicking the HTML file may trigger browser file-protocol import restrictions.

## What tests cover

- Baseline consistency and preset constraints
- No more completed orders than placed orders
- Verification improves modeled trust and cancellations
- Fee increase lowers seller participation
- Ranking can trigger a discovery fairness guardrail
- GMV and platform revenue/cost/contribution identities
- Slider bounds and safe defaults
- Comparison and sensitivity shape

No browser end-to-end tests or professional security audit are claimed.

## Roadmap

Collect customer research; calibrate on observed data; add uncertainty bands, seller cohorts and market segmentation; conduct accessibility audit and browser tests; add shareable scenario URLs; only then consider production telemetry.
