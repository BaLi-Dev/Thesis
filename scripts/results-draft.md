## 5. Results

### 5.1 Quantitative Results

Lighthouse performance audits were conducted across four pages of both prototypes under Chrome DevTools Slow 3G throttling conditions (780 Kbps download, 330 Kbps upload, 300 ms RTT, 4× CPU slowdown). Each prototype-page combination was measured across 11 runs, with the first run discarded to eliminate cold-start artifacts (DNS resolution, TCP handshake, and V8 JIT warm-up). The remaining 10 runs were used to compute means and 95% confidence intervals. All results are reported as mean ± 95% CI.

#### 5.1.1 Control Condition

The `/cart` page uses client-side rendering in both prototypes, making it an unintentional control condition. All metrics on this page showed overlapping confidence intervals between the two versions: TTI (no-RSC: 1363±12 ms, full-RSC: 1357±15 ms), Total Bytes (115,852±9 B vs. 115,831±13 B), and JS Bootup (193±4 ms vs. 188±3 ms). The absence of any measurable difference on the cart page confirms that the measurement setup does not introduce systematic bias, and that differences observed on other pages can be attributed to the architectural manipulation rather than measurement artifacts.

#### 5.1.2 RQ1 — Time to Interactive

The most pronounced TTI difference was observed on the home page, where full-RSC achieved a mean TTI of 1399±11 ms compared to 1896±125 ms for no-RSC — a reduction of 497 ms (26.2%). The confidence intervals do not overlap, providing strong statistical evidence for this difference. The about page showed a smaller but statistically clear reduction of 71 ms (5.0%), with non-overlapping CIs (no-RSC: 1415±13 ms, full-RSC: 1344±7 ms). On the products page, the observed reduction of 103 ms (6.8%) was directionally consistent but the confidence intervals overlapped (no-RSC: 1505±111 ms, full-RSC: 1402±6 ms), meaning this difference cannot be considered statistically separable at the current sample size.

The TTI reductions are explained by corresponding reductions in JS Bootup time and Main Thread work. On the home page, JS Bootup decreased by 42 ms (15%) and Main Thread work by 80 ms (12%), both with non-overlapping CIs. On the about page, JS Bootup decreased by 38 ms (17%) and Main Thread work by 71 ms (15%). These metrics reflect the reduced amount of JavaScript that the browser must parse and execute when page-level components are rendered on the server rather than the client. The Total Blocking Time (TBT) metric showed directionally consistent reductions on home (−13 ms, −19%) and about (−6 ms, −11%), though both had overlapping CIs and should be interpreted with caution.

#### 5.1.3 RQ2 — Client-Side JavaScript Transferred

Full-RSC consistently transferred fewer bytes than no-RSC across all pages where the architectural difference was present. The reductions were: home −2,526 B (2.1%), products −2,158 B (1.7%), and about −4,240 B (3.5%). All three differences had non-overlapping confidence intervals, indicating that the byte reductions are consistent and not attributable to measurement variance. The cart page showed a negligible difference of −22 B (0.0%) with overlapping CIs, consistent with the control condition expectation.

The absolute byte reductions are modest, reflecting the fact that the shared client-side components — navigation, cart context, and the add-to-cart button — are present in both prototypes and constitute the majority of the JavaScript bundle. The pages converted to server components (home, products, about) contain relatively little component logic themselves; the measurable reduction represents the elimination of React hydration overhead and the removal of client-side data fetching code for those pages.

#### 5.1.4 Lighthouse Performance Score

The Lighthouse performance score, which aggregates multiple weighted metrics, showed the most notable difference on the home page: no-RSC scored 87±1 compared to full-RSC's 95±0. This 8-point improvement reflects the combined effect of TTI, TBT, and LCP improvements on that page. All other pages scored 99–100 for both prototypes, indicating that the performance differences are concentrated on the home page, which is the most JavaScript-heavy page in the no-RSC prototype.

### 5.2 Summary of Quantitative Findings

Table 1 summarises the mean TTI and total bytes transferred for each page and prototype, along with the percentage change and whether the 95% confidence intervals overlap.

| Page | no-RSC TTI | full-RSC TTI | Δ TTI | CI overlap | no-RSC Bytes | full-RSC Bytes | Δ Bytes |
|------|-----------|-------------|-------|------------|-------------|---------------|---------|
| `/` (home) | 1896 ms | 1399 ms | −497 ms (−26%) | No | 122,209 B | 119,683 B | −2,526 B (−2.1%) |
| `/products` | 1505 ms | 1402 ms | −103 ms (−7%) | Yes | 124,353 B | 122,195 B | −2,158 B (−1.7%) |
| `/about` | 1415 ms | 1344 ms | −71 ms (−5%) | No | 120,254 B | 116,014 B | −4,240 B (−3.5%) |
| `/cart` (control) | 1363 ms | 1357 ms | −6 ms (0%) | Yes | 115,852 B | 115,831 B | −22 B (0.0%) |

The results indicate that increasing the proportion of React Server Components reduces both TTI and total bytes transferred on pages where the conversion was applied. The effect is statistically clear on the home and about pages, directionally consistent but statistically inconclusive on the products page, and absent on the cart page as expected. The magnitude of the TTI improvement (up to 497 ms on home) is practically significant under Slow 3G conditions, where users are sensitive to delays in the hundreds of milliseconds. The byte reductions, while consistent, are modest in absolute terms and unlikely to be perceptible in isolation; their contribution to TTI improvement operates through reduced JavaScript parse and execution time rather than through network transfer time savings alone.
