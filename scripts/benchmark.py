#!/usr/bin/env python3
"""
Lighthouse benchmark + thesis figure generation.
Runs both prototypes 11x each (run 1 discarded as warm-up = 10 valid runs),
generates a Markdown report, overview graphs, and publication-quality thesis figures.
"""

import json, os, subprocess, statistics, datetime, math
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np

# ── Config ────────────────────────────────────────────────────────────────────

PROTOTYPES = {
    "no-rsc":   "https://thesis-no-rsc.vercel.app",
    "full-rsc": "https://thesis-full-rsc.vercel.app",
}

PAGES = ["/", "/products", "/about", "/cart"]
SLUGS = ["home", "products", "about", "cart"]

RUNS      = 11   # run 1 discarded as warm-up → 10 valid runs
FIRST_RUN = 2    # first run counted in analysis

THROTTLE = {
    "rttMs":                  300,
    "throughputKbps":         780,
    "downloadThroughputKbps": 780,
    "uploadThroughputKbps":   330,
    "cpuSlowdownMultiplier":  4,
}

METRICS = {
    "first-contentful-paint":    "FCP (ms)",
    "largest-contentful-paint":  "LCP (ms)",
    "total-blocking-time":       "TBT (ms)",
    "speed-index":               "Speed Index (ms)",
    "interactive":               "TTI (ms)",
    "cumulative-layout-shift":   "CLS",
    "server-response-time":      "TTFB (ms)",
    "total-byte-weight":         "Total Bytes",
    "unused-javascript":         "Unused JS (bytes)",
    "bootup-time":               "JS Bootup (ms)",
    "mainthread-work-breakdown": "Main Thread (ms)",
    "network-requests":          "Network Requests",
    "network-rtt":               "Network RTT (ms)",
    "performance":               "Score",
}

OUT_DIR        = os.path.join(os.path.dirname(__file__), "lighthouse-results")
FIGURES_DIR    = os.path.join(OUT_DIR, "thesis-figures")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(FIGURES_DIR, exist_ok=True)

PROTO_LABELS = {"no-rsc": "No-RSC", "full-rsc": "Full-RSC"}
COLORS       = {"no-rsc": "#4C72B0", "full-rsc": "#DD8452"}
COLOR_LIST   = [COLORS["no-rsc"], COLORS["full-rsc"]]

plt.rcParams.update({
    "font.family": "serif",
    "font.size": 11,
    "axes.titlesize": 12,
    "axes.labelsize": 11,
    "figure.dpi": 150,
})

# ── Helpers ───────────────────────────────────────────────────────────────────

def run_lighthouse(url: str, out_path: str) -> dict:
    cmd = [
        "lighthouse", url,
        "--output=json",
        f"--output-path={out_path}",
        "--chrome-flags=--headless --no-sandbox --disable-gpu",
        "--disable-storage-reset=false",
        "--preset=desktop",
        f"--throttling.rttMs={THROTTLE['rttMs']}",
        f"--throttling.throughputKbps={THROTTLE['throughputKbps']}",
        f"--throttling.downloadThroughputKbps={THROTTLE['downloadThroughputKbps']}",
        f"--throttling.uploadThroughputKbps={THROTTLE['uploadThroughputKbps']}",
        f"--throttling.cpuSlowdownMultiplier={THROTTLE['cpuSlowdownMultiplier']}",
        "--throttling-method=devtools",
        "--quiet",
    ]
    subprocess.run(cmd, check=True)
    with open(out_path) as f:
        return json.load(f)


def extract(report: dict) -> dict:
    audits = report.get("audits", {})
    cats   = report.get("categories", {})
    row = {}
    for key, label in METRICS.items():
        if key == "performance":
            row[label] = round((cats.get("performance", {}).get("score", 0) or 0) * 100, 1)
        elif key in audits:
            row[label] = round(audits[key].get("numericValue", 0) or 0, 1)
    return row


def agg(values: list) -> dict:
    return {
        "mean":   round(statistics.mean(values), 1),
        "median": round(statistics.median(values), 1),
        "min":    round(min(values), 1),
        "max":    round(max(values), 1),
        "stdev":  round(statistics.stdev(values) if len(values) > 1 else 0, 1),
    }


def load_metric(proto: str, slug: str, metric: str) -> list:
    """Load a single metric across all valid runs from saved JSON files."""
    vals = []
    for run in range(FIRST_RUN, RUNS + 1):
        path = os.path.join(OUT_DIR, f"{proto}_{slug}_run{run}.json")
        with open(path) as f:
            d = json.load(f)
        if metric == "performance":
            v = (d["categories"].get("performance", {}).get("score", 0) or 0) * 100
        else:
            v = d["audits"].get(metric, {}).get("numericValue", 0) or 0
        vals.append(v)
    return vals


def ci95(vals: list) -> float:
    n = len(vals)
    t = {5: 2.776, 10: 2.262, 15: 2.145, 20: 2.093, 30: 2.045}.get(n, 2.0)
    return t * statistics.stdev(vals) / math.sqrt(n)

# ── Benchmark ─────────────────────────────────────────────────────────────────

def collect_all() -> dict:
    """Returns: {proto: {page: [metric_dict, ...]}} (run 1 excluded)"""
    all_results = {proto: {page: [] for page in PAGES} for proto in PROTOTYPES}
    total = len(PROTOTYPES) * len(PAGES) * RUNS
    done  = 0

    for proto, base_url in PROTOTYPES.items():
        for page in PAGES:
            for run in range(1, RUNS + 1):
                done += 1
                slug  = page.strip("/").replace("/", "-") or "home"
                out   = os.path.join(OUT_DIR, f"{proto}_{slug}_run{run}.json")
                print(f"[{done}/{total}] {proto}{page} run {run} …")
                report = run_lighthouse(base_url + page, out)
                if run == 1:
                    print("  (warm-up run — discarded)")
                    continue
                all_results[proto][page].append(extract(report))

    return all_results

# ── Markdown report ───────────────────────────────────────────────────────────

def build_md(all_results: dict) -> str:
    ts  = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    md  = [f"# Lighthouse Benchmark Report\n\n_Generated: {ts}_\n"]
    md += [
        "## Setup\n",
        f"- Runs per prototype/page: **{RUNS - 1}** (run 1 discarded as warm-up)",
        "- Caching: **disabled**",
        "- Bandwidth: **0.78 Mbit/s** down / **0.33 Mbit/s** up (Chrome DevTools Slow 3G)",
        "- Latency: **300 ms RTT**",
        "- CPU slowdown: **4×**",
        "- Throttling method: **devtools**\n",
    ]
    metric_labels = list(METRICS.values())
    for proto in PROTOTYPES:
        md.append(f"## {proto}\n")
        for page in PAGES:
            md.append(f"### `{page or '/'}`\n")
            header = "| Run | " + " | ".join(metric_labels) + " |"
            sep    = "|-----|" + "|".join(["---"] * len(metric_labels)) + "|"
            md += [header, sep]
            for i, row in enumerate(all_results[proto][page], 1):
                vals = " | ".join(str(row.get(m, "—")) for m in metric_labels)
                md.append(f"| {i} | {vals} |")
            md.append("\n**Aggregated**\n")
            md += ["| Metric | Mean | Median | Min | Max | Stdev |",
                   "|--------|------|--------|-----|-----|-------|"]
            for m in metric_labels:
                v = [r.get(m, 0) for r in all_results[proto][page]]
                a = agg(v)
                md.append(f"| {m} | {a['mean']} | {a['median']} | {a['min']} | {a['max']} | {a['stdev']} |")
            md.append("")
    return "\n".join(md)

# ── Overview graphs ───────────────────────────────────────────────────────────

def make_overview_graphs(all_results: dict):
    protos        = list(PROTOTYPES.keys())
    metric_labels = list(METRICS.values())

    for page in PAGES:
        slug = page.strip("/").replace("/", "-") or "home"
        fig, axes = plt.subplots(1, len(metric_labels), figsize=(4 * len(metric_labels), 5))
        fig.suptitle(f"Page: {page or '/'}", fontsize=14, fontweight="bold")
        for ax, metric in zip(axes, metric_labels):
            means = [statistics.mean([r.get(metric, 0) for r in all_results[p][page]]) for p in protos]
            errs  = [statistics.stdev([r.get(metric, 0) for r in all_results[p][page]]) if len(all_results[p][page]) > 1 else 0 for p in protos]
            bars  = ax.bar(protos, means, yerr=errs, capsize=4, color=COLOR_LIST, alpha=0.85)
            ax.set_title(metric, fontsize=9)
            ax.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f"{x:,.0f}"))
            ax.bar_label(bars, fmt="%.1f", padding=3, fontsize=7)
            ax.set_ylim(0, max(means) * 1.35 if max(means) else 1)
        plt.tight_layout()
        plt.savefig(os.path.join(OUT_DIR, f"compare_{slug}.png"), dpi=150)
        plt.close()

    # Radar
    means_by_proto = {}
    for proto in protos:
        combined = {m: [] for m in metric_labels}
        for page in PAGES:
            for row in all_results[proto][page]:
                for m in metric_labels:
                    combined[m].append(row.get(m, 0))
        means_by_proto[proto] = [statistics.mean(combined[m]) for m in metric_labels]
    norm = []
    for i, m in enumerate(metric_labels):
        vals = [means_by_proto[p][i] for p in protos]
        mx   = max(vals) or 1
        norm.append([v / mx if m == "Score" else 1 - v / mx for v in vals])
    N      = len(metric_labels)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist() + [0]
    fig, ax = plt.subplots(figsize=(7, 7), subplot_kw={"polar": True})
    for pi, proto in enumerate(protos):
        vals = [norm[i][pi] for i in range(N)] + [norm[0][pi]]
        ax.plot(angles, vals, color=COLOR_LIST[pi], linewidth=2, label=proto)
        ax.fill(angles, vals, color=COLOR_LIST[pi], alpha=0.15)
    ax.set_thetagrids(np.degrees(angles[:-1]), metric_labels, fontsize=9)
    ax.set_title("Overall Comparison (normalised, higher = better)", pad=20)
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1))
    plt.savefig(os.path.join(OUT_DIR, "radar_overall.png"), dpi=150, bbox_inches="tight")
    plt.close()

# ── Thesis figures ────────────────────────────────────────────────────────────

def _save(fig, name):
    for ext in ("pdf", "png"):
        fig.savefig(os.path.join(FIGURES_DIR, f"{name}.{ext}"), bbox_inches="tight")
    plt.close(fig)
    print(f"  Saved {name}.pdf/.png")


def fig_tti_tbt():
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle("Interactivity Metrics by Page", fontweight="bold")
    for ax, (metric, ylabel, title) in zip(axes, [
        ("interactive",         "TTI (ms)", "Time to Interactive (TTI)"),
        ("total-blocking-time", "TBT (ms)", "Total Blocking Time (TBT)"),
    ]):
        x, w = np.arange(len(SLUGS)), 0.35
        for i, proto in enumerate(PROTOTYPES):
            means = [statistics.mean(load_metric(proto, s, metric)) for s in SLUGS]
            errs  = [ci95(load_metric(proto, s, metric)) for s in SLUGS]
            bars  = ax.bar(x + i*w - w/2, means, w, yerr=errs, capsize=4,
                           color=COLORS[proto], label=PROTO_LABELS[proto], alpha=0.88)
            ax.bar_label(bars, fmt="%.0f", padding=3, fontsize=8)
        ax.set_title(title); ax.set_ylabel(ylabel)
        ax.set_xticks(x); ax.set_xticklabels([p or "/" for p in PAGES])
        ax.legend(); ax.set_ylim(0, ax.get_ylim()[1] * 1.15); ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    _save(fig, "fig1_tti_tbt")


def fig_bytes():
    fig, ax = plt.subplots(figsize=(8, 5))
    x, w = np.arange(len(SLUGS)), 0.35
    for i, proto in enumerate(PROTOTYPES):
        means = [statistics.mean(load_metric(proto, s, "total-byte-weight")) / 1024 for s in SLUGS]
        errs  = [ci95(load_metric(proto, s, "total-byte-weight")) / 1024 for s in SLUGS]
        bars  = ax.bar(x + i*w - w/2, means, w, yerr=errs, capsize=4,
                       color=COLORS[proto], label=PROTO_LABELS[proto], alpha=0.88)
        ax.bar_label(bars, fmt="%.1f", padding=3, fontsize=8)
    ax.set_title("Total Transfer Size by Page", fontweight="bold"); ax.set_ylabel("Total Bytes (KB)")
    ax.set_xticks(x); ax.set_xticklabels([p or "/" for p in PAGES])
    ax.legend(); ax.set_ylim(0, ax.get_ylim()[1] * 1.12); ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    _save(fig, "fig2_bytes")


def fig_js_cost():
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle("Client-Side JavaScript Execution Cost", fontweight="bold")
    for ax, (metric, ylabel, title) in zip(axes, [
        ("bootup-time",              "JS Bootup (ms)",   "JS Bootup Time"),
        ("mainthread-work-breakdown","Main Thread (ms)", "Main Thread Work"),
    ]):
        x, w = np.arange(len(SLUGS)), 0.35
        for i, proto in enumerate(PROTOTYPES):
            means = [statistics.mean(load_metric(proto, s, metric)) for s in SLUGS]
            errs  = [ci95(load_metric(proto, s, metric)) for s in SLUGS]
            bars  = ax.bar(x + i*w - w/2, means, w, yerr=errs, capsize=4,
                           color=COLORS[proto], label=PROTO_LABELS[proto], alpha=0.88)
            ax.bar_label(bars, fmt="%.0f", padding=3, fontsize=8)
        ax.set_title(title); ax.set_ylabel(ylabel)
        ax.set_xticks(x); ax.set_xticklabels([p or "/" for p in PAGES])
        ax.legend(); ax.set_ylim(0, ax.get_ylim()[1] * 1.15); ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    _save(fig, "fig3_js_cost")


def fig_boxplot():
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    fig.suptitle("TTI Distribution — Home Page vs. All Pages", fontweight="bold")
    ax = axes[0]
    data = [load_metric(proto, "home", "interactive") for proto in PROTOTYPES]
    bp = ax.boxplot(data, labels=[PROTO_LABELS[p] for p in PROTOTYPES],
                    patch_artist=True, medianprops={"color": "black", "linewidth": 2})
    for patch, proto in zip(bp["boxes"], PROTOTYPES):
        patch.set_facecolor(COLORS[proto]); patch.set_alpha(0.8)
    ax.set_title("Home Page TTI"); ax.set_ylabel("TTI (ms)"); ax.grid(axis="y", alpha=0.3)
    ax = axes[1]
    x, w = np.arange(len(SLUGS)), 0.35
    for i, proto in enumerate(PROTOTYPES):
        means = [statistics.mean(load_metric(proto, s, "interactive")) for s in SLUGS]
        errs  = [ci95(load_metric(proto, s, "interactive")) for s in SLUGS]
        ax.errorbar(x + i*w - w/2, means, yerr=errs, fmt="o-", capsize=5,
                    color=COLORS[proto], label=PROTO_LABELS[proto], linewidth=1.8, markersize=6)
    ax.set_title("TTI with 95% CI — All Pages"); ax.set_ylabel("TTI (ms)")
    ax.set_xticks(x); ax.set_xticklabels([p or "/" for p in PAGES])
    ax.legend(); ax.grid(alpha=0.3)
    plt.tight_layout()
    _save(fig, "fig4_tti_distribution")


def fig_score():
    fig, ax = plt.subplots(figsize=(8, 5))
    x, w = np.arange(len(SLUGS)), 0.35
    for i, proto in enumerate(PROTOTYPES):
        means = [statistics.mean(load_metric(proto, s, "performance")) for s in SLUGS]
        errs  = [ci95(load_metric(proto, s, "performance")) for s in SLUGS]
        bars  = ax.bar(x + i*w - w/2, means, w, yerr=errs, capsize=4,
                       color=COLORS[proto], label=PROTO_LABELS[proto], alpha=0.88)
        ax.bar_label(bars, fmt="%.0f", padding=3, fontsize=8)
    ax.set_title("Lighthouse Performance Score by Page", fontweight="bold")
    ax.set_ylabel("Score (0–100)")
    ax.set_xticks(x); ax.set_xticklabels([p or "/" for p in PAGES])
    ax.set_ylim(0, 115); ax.axhline(100, color="gray", linestyle="--", linewidth=0.8, alpha=0.5)
    ax.legend(); ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    _save(fig, "fig5_score")


def fig_delta():
    metrics = {
        "interactive":              "TTI",
        "total-blocking-time":      "TBT",
        "total-byte-weight":        "Total Bytes",
        "bootup-time":              "JS Bootup",
        "mainthread-work-breakdown":"Main Thread",
    }
    pages_to_show = ["home", "products", "about"]
    fig, ax = plt.subplots(figsize=(10, 5))
    x, w = np.arange(len(metrics)), 0.25
    page_colors = ["#2ca02c", "#9467bd", "#8c564b"]
    for pi, slug in enumerate(pages_to_show):
        deltas = []
        for metric in metrics:
            base = statistics.mean(load_metric("no-rsc",   slug, metric))
            new  = statistics.mean(load_metric("full-rsc", slug, metric))
            deltas.append((new - base) / base * 100 if base else 0)
        ax.bar(x + pi*w - w, deltas, w, label=f"/{slug}", color=page_colors[pi], alpha=0.85)
    ax.axhline(0, color="black", linewidth=0.8)
    ax.set_title("Full-RSC vs. No-RSC: % Change per Metric (negative = improvement)", fontweight="bold")
    ax.set_ylabel("% Change (Full-RSC relative to No-RSC)")
    ax.set_xticks(x); ax.set_xticklabels(list(metrics.values()), rotation=15, ha="right")
    ax.legend(title="Page"); ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    _save(fig, "fig6_delta")


def make_thesis_figures():
    print("\nGenerating thesis figures …")
    fig_tti_tbt()
    fig_bytes()
    fig_js_cost()
    fig_boxplot()
    fig_score()
    fig_delta()
    print(f"Thesis figures → {FIGURES_DIR}")

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    os.environ.setdefault("CHROME_PATH", "/usr/bin/chromium-browser")
    print("Starting Lighthouse benchmark …\n")
    all_results = collect_all()

    md_path = os.path.join(OUT_DIR, "report.md")
    with open(md_path, "w") as f:
        f.write(build_md(all_results))
    print(f"\nMarkdown report → {md_path}")

    make_overview_graphs(all_results)
    make_thesis_figures()
    print("\nDone.")
