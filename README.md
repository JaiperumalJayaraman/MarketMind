# MarketMind

**A two-sided marketplace strategy simulator for product managers.**

> **60-second recruiter walkthrough:** Choose **Growth sprint**, observe completed orders alongside contribution and seller exposure, then switch to **Balanced bet**. Open **Experiment plans** to see how you'd validate the decision and **Decision memo** to export your recommendation.

Marketplaces need **buyers, sellers, and economics** to work together. Discounts may buy GMV while hurting margin. Relevance may lift conversion while starving new sellers of impressions. Higher commission may raise revenue per order but reduce seller supply.

MarketMind is a working interactive, explicitly **synthetic** product strategy case study—not a static PowerPoint or a claim of real business results.

## Run it

**No dependencies or API keys.** This is static HTML, CSS and JavaScript modules.

~~~bash
git clone https://github.com/JaiperumalJayaraman/MarketMind.git
cd MarketMind
python -m http.server 8000
~~~

Visit **http://localhost:8000**.

To deploy, use GitHub **Settings → Pages → Deploy from a branch → main → / (root)**. GitHub will display the deployed URL in the Pages settings.

Automated model tests (Node 20+):

~~~bash
npm test
~~~

## What you can do

| Feature | Product management skill |
| --- | --- |
| Five strategies and six live sliders | Prioritization and trade-offs |
| Completed orders, GMV, contribution and trust | North Star and financial metrics |
| Seller health and marketplace fairness checks | Two-sided market thinking |
| Four pass/fail launch guardrails | Risk-aware product decisions |
| Finite-difference sensitivity analysis | Critical quantitative thinking |
| Three A/B experiment designs | Validation and analytics |
| Downloadable decision memo | Stakeholder communication |
| Save three scenarios in local browser storage | Usable interaction design |

### The six levers

1. **Verified seller coverage** — trust versus onboarding friction/cost.
2. **Buyer protection** — conversion versus claims/service cost.
3. **Relevance ranking** — buyer discovery versus emerging-seller visibility.
4. **Platform-funded discounts** — new orders versus contribution.
5. **Take rate** — revenue versus seller participation.
6. **Seller success investment** — retention versus operating costs.

**North Star:** completed orders per month, subject to contribution and marketplace-quality guardrails.

## Product thinking

The app answers "what decision am I making?" before showing detailed parameters. Recognizable presets reduce blank-canvas friction; the control column shows causes, the results column shows consequences. All results share one clearly named baseline. The guardrail panel deliberately makes it impossible to mistake a single positive metric for a responsible launch decision.

Explore the supporting artifacts:
- [Product requirements and target users](docs/PRODUCT-REQUIREMENTS.md)
- [Metric tree and modeling assumptions](docs/MODEL-AND-METRICS.md)
- [Experiment and rollout strategy](docs/EXPERIMENT-PLAN.md)
- [Technical architecture and limitations](docs/ARCHITECTURE.md)

## Repository

~~~text
index.html
styles.css
assets/favicon.svg
src/app.js
src/model.js
tests/model.test.mjs
docs/PRODUCT-REQUIREMENTS.md
docs/MODEL-AND-METRICS.md
docs/EXPERIMENT-PLAN.md
docs/ARCHITECTURE.md
package.json
LICENSE
~~~

## Data integrity

**All inputs and numeric outputs are intentionally invented and synthetic.** There are no actual users, interviews, A/B test findings, validated causal coefficients, commercial transactions or earned revenue represented here. Equations and their assumptions are visible in [src/model.js](src/model.js).

Do not present simulated business deltas as achieved impact. Appropriate resume framing: **"Built a browser-based two-sided marketplace strategy simulator with six interactive levers, contribution economics, seller-health guardrails, sensitivity analysis and experiment-design workflows."**

MIT licensed. See [LICENSE](LICENSE).
