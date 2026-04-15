# Experimental Decision Audit

This document provides a comprehensive analysis of every methodological decision made in the
benchmark experiment, including what was done, what alternatives existed, how each alternative
would have affected the results, and how each decision can be defended in the thesis.

---

## 1. Throttling Method: `devtools` vs. `simulate`

### What we did
We used `--throttling-method=devtools`, which applies real network throttling through the
Chrome DevTools Protocol (CDP). During each Lighthouse run, Chrome's actual network interface
is throttled to the specified bandwidth and latency values. The browser genuinely waits for
bytes to arrive over a constrained connection.

### What the alternative does
`--throttling-method=simulate` is Lighthouse's default. It fetches all resources at full
network speed and then uses a mathematical model (based on the Chrome loading simulator) to
estimate what the performance metrics *would have been* under the specified throttling
conditions. No actual throttling occurs during the run.

### How the alternative would have affected results
Our earlier data (collected with `simulate`) showed TTI of approximately 2898ms for no-rsc
and 2945ms for full-rsc on the home page — a negligible and directionally wrong difference.
After switching to `devtools`, the same page showed 1998ms vs. 1530ms — a 468ms improvement
for full-rsc. The simulate model failed to capture the difference because it models network
transfer time accurately but does not fully account for the interaction between JS parse/execute
timing and real network scheduling. When JS bundles arrive in real time under throttled
conditions, the browser's main thread scheduling differs from what the simulator predicts,
particularly for hydration-heavy client components.

### Why our choice is correct
For a research study comparing two architectures under constrained network conditions, the
goal is to measure what users actually experience, not what a model predicts they would
experience. The `devtools` method is the appropriate choice when the research question is
about real-world behavior. The `simulate` method is appropriate for CI pipelines where
consistency and speed matter more than realism. Our user study used real throttling, so
using `devtools` in the benchmark ensures methodological consistency between the quantitative
and qualitative arms of the study.

### Remaining limitation
`devtools` throttling applies at the Chrome process level via CDP, not at the OS network
interface level. This means other processes on the machine can still use the network at full
speed, and the throttling is applied by Chrome's internal scheduler rather than the kernel.
This is the same mechanism used by Chrome DevTools when a developer manually enables throttling
in the browser, so it is the most realistic simulation available without a dedicated network
emulation device (e.g., a hardware traffic shaper or a tool like `tc` on Linux).

---

## 2. Throttling Preset: Chrome DevTools Slow 3G

### What we did
We used the Chrome DevTools "Slow 3G" preset:
- Download: 780 Kbps
- Upload: 330 Kbps
- RTT: 300ms
- CPU slowdown: 4×

### What the alternatives are

**Original proposal values (1 Mbps / 300ms, no CPU slowdown):**
Higher bandwidth means faster resource delivery. The JS bundle (~120 KB) would transfer in
approximately 0.96 seconds at 1 Mbps vs. 1.23 seconds at 780 Kbps. The absolute TTI values
would be lower, and the difference between no-rsc and full-rsc would be slightly smaller in
absolute terms but proportionally similar. The absence of CPU slowdown would reduce JS
execution time for both versions equally, compressing TBT and JS Bootup differences.

**Fast 3G (1.6 Mbps / 150ms RTT):**
At this speed, the ~2–4 KB difference in bundle size between the two versions becomes
negligible — it represents less than 20ms of transfer time. The TTI difference would likely
disappear entirely, as the bottleneck shifts from network to CPU, and both versions have
similar CPU profiles for the shared client components.

**No throttling:**
Both apps load in under 200ms on an unthrottled connection. The JS execution differences
(~77ms JS Bootup difference on home) would still exist but would be invisible to users and
statistically indistinguishable from noise in Lighthouse measurements.

**Mobile 3G (higher CPU slowdown, ~6×):**
Would amplify JS execution differences further. The 4× vs. 6× CPU slowdown difference
would make TBT and TTI gaps larger, potentially making the full-rsc advantage more pronounced.
This would be more representative of actual 3G users on low-end Android devices.

### Why our choice is correct
The Slow 3G preset is a well-established, documented standard that other researchers and
practitioners use, making our results comparable to existing literature. It represents a
realistic worst-case scenario for users in low-income or rural areas, which is the population
our thesis motivation cites (GSMA data on 3G users). Using a named preset rather than custom
values also makes the experiment reproducible — any researcher can replicate the exact
conditions by selecting "Slow 3G" in Chrome DevTools.

The deviation from the original proposal (1 Mbps / 300ms) should be documented in the thesis
as a scope change, with the justification that the Chrome DevTools preset is a more
standardized and reproducible specification.

---

## 3. CPU Slowdown Multiplier: 4×

### What we did
Applied a 4× CPU slowdown as part of the Slow 3G preset. This is implemented by Lighthouse
as a software throttle that artificially delays JavaScript task execution on the main thread.

### What the alternatives are

**1× (no CPU slowdown):**
JS Bootup time for no-rsc home would drop from ~309ms to approximately 77ms (the unthrottled
baseline). The difference between no-rsc and full-rsc in JS execution would shrink
proportionally. TBT differences would be smaller. TTI would still differ due to network
transfer time differences, but the JS execution component of the difference would be reduced.

**6× slowdown (mobile device simulation):**
Would increase absolute JS execution times for both versions. The relative difference between
no-rsc and full-rsc would remain proportional, but absolute TBT and TTI values would be
higher. This would make the full-rsc advantage appear larger in absolute milliseconds.

### Why our choice is correct
The 4× multiplier is the value specified in the Chrome DevTools Slow 3G preset, which we
adopted for consistency and reproducibility. It represents a mid-range mobile device — not
a flagship phone, not a feature phone. This is appropriate given that our thesis motivation
focuses on users in constrained environments who are likely using mid-range or older devices.

The CPU slowdown is critical for our study because RSC's primary benefit is reducing the
amount of JavaScript that needs to be parsed and executed on the client. Without CPU
throttling, this benefit is invisible — modern CPUs parse 120 KB of JS in milliseconds
regardless of whether it is 2 KB more or less. The 4× slowdown makes the JS execution
cost visible and measurable, which is necessary to answer RQ1.

---

## 4. Hosting: Vercel (Remote) vs. Local

### What we did
Both prototypes are deployed to Vercel (`thesis-no-rsc.vercel.app` and
`thesis-full-rsc.vercel.app`) and tested against live URLs.

### What the alternative would do
Local hosting (`next start` on the same machine running Lighthouse) would eliminate all
server-side variables: CDN routing, geographic edge selection, Vercel's infrastructure,
and cold start behavior. TTFB would be determined solely by the local Node.js server
processing time, which would be higher than Vercel's ~11ms but more controlled.

Local hosting would also mean the network throttling applies to the full round trip including
the server response, whereas with Vercel the server response arrives almost instantly and
the throttling primarily affects the asset download phase. This distinction matters: with
local hosting, the 300ms RTT would add ~300ms to TTFB on every request, making the total
load time longer and potentially amplifying differences between the two versions.

### Why our choice is defensible
The key evidence is the TTFB data: mean TTFB is 10–12ms with stdev of 0–2ms across all
runs and both prototypes. This near-zero variance indicates that Vercel's edge is serving
both apps from the same edge node consistently, and that server-side variance is not
contributing to the differences we observe. The differences in TTI, TBT, JS Bootup, and
Main Thread are all client-side metrics that are unaffected by where the server is hosted,
as long as the server delivers the initial HTML quickly and consistently — which Vercel does.

Additionally, Vercel is the canonical deployment platform for Next.js applications. Testing
on Vercel represents how these applications are actually deployed in production, which
strengthens the external validity of the findings. A developer reading this thesis can
directly apply the findings to their own Vercel-deployed Next.js application.

### Remaining risk
It is theoretically possible that two runs hit different Vercel edge nodes in different
geographic locations, producing different TTFB values. The stable TTFB data suggests this
did not occur, but it cannot be ruled out with certainty. This should be acknowledged as
a minor threat to internal validity.

---

## 5. Number of Runs: 5 (current) → 10 (planned)

### What we did
5 runs per prototype/page combination (40 total runs).

### Statistical implications of 5 runs
At n=5, the 95% confidence interval uses a t-critical value of 2.776. For the most
problematic metric — full-rsc home TTI (stdev=295ms) — this produces a CI of ±366ms.
The observed difference is 468ms, meaning the confidence intervals technically overlap
(1530 ± 366 vs. 1998 ± 107). This is the weakest point in the dataset.

For all other metrics and pages, n=5 is sufficient. TBT, Total Bytes, JS Bootup, and
Main Thread all have stdev values small enough that the CIs do not overlap even at n=5.

### Effect of increasing to 10 runs
At n=10, the t-critical value drops to 2.262, and the CI for full-rsc home TTI narrows
to ±211ms. The difference (468ms) now clearly exceeds the combined CI width, providing
stronger statistical evidence. The runtime increases from ~5 minutes to ~10 minutes,
which is acceptable.

### Effect of increasing to 30 runs
At n=30, the CI narrows to ±110ms. This provides very strong statistical evidence but
adds ~25 minutes of runtime. The marginal benefit over n=10 is small given that the
difference is already clear at n=10.

### Why 10 is the right choice
10 runs provides sufficient statistical power for the most variable metric while keeping
runtime manageable. It is also a round number that is easy to justify methodologically.
The decision to use 10 runs should be documented in the thesis with reference to the
variance observed in the pilot data (5 runs) and the resulting CI calculations.

---

## 6. Number of Prototypes: 2 vs. 3

### What we did
Binary comparison: no-rsc (all client components) vs. full-rsc (maximum server components).

### What the alternative would provide
A third "partial RSC" prototype — for example, converting only the page-level components
to server components while keeping all sub-components as client — would allow characterizing
the dose-response relationship. You could determine whether the performance benefit is:
- Linear (each additional RSC contributes proportionally)
- Threshold-based (benefit only appears above a certain proportion)
- Diminishing returns (first RSCs provide most benefit)

This would make the findings more actionable for developers who cannot fully commit to RSC.

### Why two is defensible
The research questions ask "in what way does *increasing* the proportion affect..." — this
is a directional question that a binary comparison can answer. The finding that full-rsc
is better than no-rsc on the measured metrics is a valid and useful answer to the RQ,
even without characterizing the gradient.

The reduction from 3 to 2 prototypes should be documented as a scope change in the thesis,
with the justification that time constraints during the project execution phase necessitated
the reduction. The inability to characterize the dose-response curve should be listed as
a limitation and a direction for future work.

---

## 7. Which Components Are RSC vs. Client

### What we did
**no-rsc:** `"use client"` on all pages (home, products, about, cart) plus Nav, AddToCart,
CartContext.

**full-rsc:** `"use client"` only on cart page, Nav, AddToCart, CartContext, and SearchBar.
All other pages (home, products, about) are server components.

### The implication
The shared client components (Nav, AddToCart, CartContext) are present in both versions and
constitute the majority of the JS bundle. The page components themselves contain relatively
little logic — they primarily fetch data and render layout. This is why the bundle size
difference is only 2–4 KB despite 4 pages changing rendering strategy.

A more aggressive RSC implementation would:
- Move Nav to a server component with a small client island for interactive state (active link)
- Move AddToCart to a server component that renders a client button as a leaf node
- Eliminate CartContext entirely by using server-side session management

This would produce a much larger bundle size difference and likely a more pronounced TTI
improvement. Our full-rsc prototype therefore represents a conservative lower bound of
what RSC can achieve — the measured effect is the minimum expected benefit.

### How to frame this in the thesis
This should be described in the methodology section as a deliberate design choice: the
prototypes were designed to be as functionally identical as possible, which constrained
how aggressively RSC could be applied. Components that require client-side interactivity
(cart state, navigation active state) were kept as client components in both versions to
ensure functional parity. This is a realistic constraint that developers face in practice.

---

## 8. Form Factor: Desktop vs. Mobile

### What we did
Used `--preset=desktop`: 1350×940 viewport, no mobile user agent, no touch emulation,
4× CPU slowdown.

### What the alternative would do
The Lighthouse mobile preset uses a 375×812 viewport, mobile user agent, and a higher
default CPU slowdown (approximately 6×). It also triggers mobile-specific browser behaviors
such as different resource prioritization and layout recalculation costs.

Using mobile preset would:
- Increase absolute TTI and TBT values for both versions
- Amplify JS execution differences (higher CPU slowdown)
- Potentially trigger different code paths in Next.js's hydration logic
- Be more representative of actual 3G users

### Why desktop is correct for our study
The user study was conducted on desktop machines. Using desktop Lighthouse ensures that
the benchmark conditions match the user study conditions, which is essential for
triangulating RQ3 (user perception) against RQ1/RQ2 (Lighthouse metrics). If the benchmark
used mobile conditions and the user study used desktop conditions, the absolute values
would not be comparable and the cross-method validation would be weakened.

This should be acknowledged as a limitation: the findings may not generalize to mobile
users, who represent the majority of 3G users globally. Future work should replicate the
study with mobile emulation.

---

## 9. Cache Strategy: Cold Cache (Storage Reset Enabled)

### What we did
`--disable-storage-reset=false` (the default) — Lighthouse clears all browser storage,
cookies, and cache before each run. Every run simulates a first-time visitor with no
cached assets.

### What the alternative would do
Allowing warm cache (disabling storage reset) would let the browser cache JS bundles,
CSS, and other assets between runs. Subsequent runs would load significantly faster for
both versions, and the difference between no-rsc and full-rsc would compress dramatically
because the JS bundle — the primary differentiator — would be served from cache.

### Why cold cache is correct
Our RQs ask about the effect of RSC on performance under constrained network conditions.
The network constraint is most impactful on first load, when no assets are cached. Repeat
visitors with warm caches experience much faster loads regardless of architecture. Since
the thesis motivation focuses on users in low-bandwidth environments (who may also have
limited device storage and more aggressive cache eviction), cold cache is the appropriate
and more conservative measurement condition.

---

## 10. Lighthouse Version and Chrome Version

### What we did
Used the Lighthouse version installed on the test machine without pinning a specific version.

### The risk
Lighthouse's scoring algorithms, audit implementations, and metric definitions change
between versions. The TTI metric has been deprecated and removed from the default score
in recent versions. The TBT weighting in the performance score has changed. Results
produced by different Lighthouse versions are not directly comparable.

### Mitigation
Both prototypes were tested with the same Lighthouse version in the same environment,
so all relative comparisons are valid. The absolute performance scores are version-dependent.

### What to do in the thesis
Report the exact Lighthouse version and Chrome version used. This can be extracted from
the JSON results: `data.lighthouseVersion` and `data.userAgent`. This allows future
researchers to reproduce the exact conditions.

---

## 11. Sequential vs. Parallel Runs

### What we did
Runs are executed sequentially — one Lighthouse instance at a time.

### What parallel would do
Running multiple Lighthouse instances simultaneously would reduce total benchmark time
proportionally to the number of parallel instances. However, with `devtools` throttling,
multiple Chrome instances share the machine's network interface. The CDP throttling is
applied per-process, but the underlying network bandwidth is shared. If two instances
are both throttled to 780 Kbps and both downloading simultaneously, the actual available
bandwidth per instance is less than 780 Kbps, producing artificially inflated load times
and unreliable results.

### Why sequential is mandatory
Sequential execution is the only way to guarantee that each run receives the full
specified bandwidth allocation. This is a fundamental constraint of devtools throttling
that cannot be worked around without dedicated network hardware. The time cost (~10 minutes
for 10 runs) is acceptable for a research study.

---

## 12. No Warm-Up Run

### What we did
All runs are counted, including run 1. No warm-up run is discarded.

### The risk
Run 1 consistently shows higher variance than subsequent runs across multiple pages and
metrics. This is attributable to:
- DNS resolution (first run must resolve the hostname; subsequent runs use the cached result)
- TCP connection establishment and TLS handshake (first run pays the full cost)
- V8 JIT compilation cold start (JavaScript is interpreted before being compiled to native code)
- Vercel edge node warm-up (if the edge function was cold)

The JS Bootup values for run 1 are visibly higher than runs 2–5 in the raw data for
several pages, particularly no-rsc home.

### Effect of discarding run 1
Discarding run 1 would reduce variance, tighten confidence intervals, and shift means
slightly downward. The directional findings would not change, but the statistical
evidence would be stronger.

### How to handle this in the thesis
Two options: (a) discard run 1 explicitly and document this as a methodological choice,
or (b) keep all runs and report median alongside mean (median is robust to the run 1
outlier). Option (b) is simpler and more transparent. The thesis should report both mean
and median for the key metrics and note that run 1 variance is a known artifact of
cold-start effects.

---

## 13. Single Machine, Single Geographic Location

### What we did
All runs were executed from one machine in one location (Sweden, based on the Vercel
deployment region).

### The risk
Results are specific to the network path between the test machine and Vercel's nearest
edge node. A user in a different location (e.g., Southeast Asia, Sub-Saharan Africa)
would experience different absolute TTFB values and potentially different CDN behavior.

### Why this is a minor threat
The metrics that differ between no-rsc and full-rsc (TTI, TBT, JS Bootup, Main Thread)
are all client-side metrics determined by local CPU and JS execution, not by network
path. TTFB is stable at ~11ms and contributes negligibly to the differences observed.
Geographic location affects TTFB, not the client-side execution metrics that drive our
findings.

### Remaining concern
The thesis should acknowledge that absolute TTI values would be higher for users in
regions with higher latency to Vercel's servers, but that the *relative difference*
between no-rsc and full-rsc would remain consistent because it is driven by client-side
JS execution, not network delivery.

---

## 14. Metric Selection: TTI, TBT, Total Bytes

### What we did
Primary metrics: TTI (RQ1), Total Bytes (RQ2). Secondary: TBT, JS Bootup, Main Thread.

### TTI deprecation
TTI is deprecated in Lighthouse and removed from the default performance score in recent
versions. The Lighthouse team recommends TBT as the replacement for measuring interactivity.
TTI measures the point at which the main thread is consistently idle for 5 seconds after
FCP; TBT measures the total duration of long tasks between FCP and TTI. TBT is more
robust to variance and better reflects the user experience of a blocked main thread.

Our data shows TBT and TTI are directionally consistent — both show the same pattern of
improvement for full-rsc on home, about, and products, with no difference on cart. TBT
has lower variance than TTI, making it a more reliable metric.

**Recommendation:** Report both TTI and TBT. Frame TTI as the metric specified in the RQs
(for consistency with the research proposal) and TBT as the current best-practice
replacement. Note the deprecation in the methodology section.

### Total Bytes vs. JS-only bytes
`total-byte-weight` measures all transferred bytes: HTML, CSS, JavaScript, images, fonts,
and other resources. It is not a pure measure of client-side JavaScript. A more precise
metric for RQ2 would be the sum of JavaScript resource sizes from the network waterfall.

The `unused-javascript` audit returned 0 for almost all runs, which is suspicious. This
likely indicates that Lighthouse's JavaScript coverage instrumentation did not function
correctly under devtools throttling, or that all JavaScript was executed during the page
load (which is plausible given the small bundle size).

**Mitigation:** The JS Bootup time metric is a pure measure of JavaScript parse and
execution cost and is unaffected by the coverage instrumentation issue. It should be
used as the primary metric for RQ2 alongside total-byte-weight. The thesis should
acknowledge the limitation of total-byte-weight as a proxy and explain why JS Bootup
is used as a supplementary measure.

---

## 15. User Study Conditions vs. Benchmark Conditions

### What we did
- User study: Windows 11, real browser, Chrome DevTools throttling applied manually
- Benchmark: Linux, Lighthouse CLI with `--throttling-method=devtools`

### The risk
Different operating systems implement network throttling differently at the kernel level.
Windows and Linux have different TCP stack implementations, different socket buffer sizes,
and different scheduling behaviors. The same nominal throttling parameters (780 Kbps /
300ms RTT) may produce slightly different actual network behavior on Windows vs. Linux.

Additionally, the user study participants interacted with the applications in real time —
they scrolled, clicked, and navigated — while Lighthouse measures a scripted, automated
load. User interactions can trigger additional network requests, JavaScript execution, and
layout recalculations that Lighthouse does not capture.

### Effect on cross-method comparison
The absolute TTI values from Lighthouse cannot be directly compared to the subjective
loading time perceptions from the user study. A 468ms TTI difference in Lighthouse does
not translate directly to "users perceived it as 468ms faster."

### Why this is acceptable
The purpose of the cross-method comparison is not to match absolute values but to
validate directionality: does the version that Lighthouse says is faster also feel faster
to users? The answer is yes — full-rsc shows lower TTI/TBT in Lighthouse, and 7/8 users
perceived full-rsc as faster. This directional consistency is the meaningful finding.

The OS difference and the automated vs. interactive difference should be acknowledged as
limitations when discussing the triangulation of quantitative and qualitative results.

---

## 16. Cart Page as Unintentional Control Condition

### What happened
The `/cart` page uses `"use client"` in both no-rsc and full-rsc. It was not designed as
a control condition, but it functions as one: if the measurement setup is working correctly,
cart should show no difference between the two versions.

### What the data shows
Cart TTI: no-rsc 1357ms vs. full-rsc 1368ms (Δ = +11ms, within noise).
Cart TBT: no-rsc 48ms vs. full-rsc 49ms (Δ = +1ms, within noise).
Cart Total Bytes: no-rsc 115,852 vs. full-rsc 115,823 (Δ = −29 bytes, negligible).

The cart page shows no meaningful difference between the two versions, exactly as expected.

### Why this strengthens the study
This is a form of internal validity check. If the measurement setup had systematic bias
(e.g., one prototype was consistently measured under better network conditions), the cart
page would also show a difference. The fact that it does not confirms that the differences
observed on other pages are attributable to the RSC manipulation and not to measurement
artifacts.

**This should be explicitly highlighted in the thesis** as evidence of internal validity.
It is one of the strongest methodological arguments available in the dataset.
