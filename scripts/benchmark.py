#!/usr/bin/env python3
"""
Lighthouse benchmark: runs both prototypes 5x each with throttling,
generates a Markdown report and comparison graphs.
"""

import json
import os
import subprocess
import statistics
import datetime
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np

# ── Config ────────────────────────────────────────────────────────────────────

PROTOTYPES = {
    "no-rsc":   "https://thesis-no-rsc.vercel.app",
    "full-rsc": "https://thesis-full-rsc.vercel.app",
}

PAGES = ["/", "/products", "/about", "/cart"]

RUNS = 5

# Throttle: 0.4 Mbit/s = 400 kbit/s, latency 2000 ms
THROTTLE = {
    "rttMs":              2000,
    "throughputKbps":     400,
    "uploadThroughputKbps": 400,
    "cpuSlowdownMultiplier": 1,
}

METRICS = {
    # Core Web Vitals
    "first-contentful-paint":        "FCP (ms)",
    "largest-contentful-paint":      "LCP (ms)",
    "total-blocking-time":           "TBT (ms)",
    "speed-index":                   "Speed Index (ms)",
    "interactive":                   "TTI (ms)",
    "cumulative-layout-shift":       "CLS",
    # RSC-relevant: server & network
    "server-response-time":          "TTFB (ms)",
    "total-byte-weight":             "Total Bytes",
    "unused-javascript":             "Unused JS (bytes)",
    # RSC-relevant: JS execution cost
    "bootup-time":                   "JS Bootup (ms)",
    "mainthread-work-breakdown":     "Main Thread (ms)",
    "network-requests":              "Network Requests",
    "network-rtt":                   "Network RTT (ms)",
    # Overall
    "performance":                   "Score",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "lighthouse-results")
os.makedirs(OUT_DIR, exist_ok=True)

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
        f"--throttling.uploadThroughputKbps={THROTTLE['uploadThroughputKbps']}",
        f"--throttling.cpuSlowdownMultiplier={THROTTLE['cpuSlowdownMultiplier']}",
        "--throttling-method=simulate",
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


def agg(values: list[float]) -> dict:
    return {
        "mean":   round(statistics.mean(values), 1),
        "median": round(statistics.median(values), 1),
        "min":    round(min(values), 1),
        "max":    round(max(values), 1),
        "stdev":  round(statistics.stdev(values) if len(values) > 1 else 0, 1),
    }

# ── Run benchmarks ────────────────────────────────────────────────────────────

def collect_all() -> dict:
    """Returns: {proto: {page: [metric_dict, ...]}}"""
    all_results = {proto: {page: [] for page in PAGES} for proto in PROTOTYPES}

    total = len(PROTOTYPES) * len(PAGES) * RUNS
    done  = 0

    for proto, base_url in PROTOTYPES.items():
        for page in PAGES:
            for run in range(1, RUNS + 1):
                done += 1
                url  = base_url + page
                slug = page.strip("/").replace("/", "-") or "home"
                fname = f"{proto}_{slug}_run{run}.json"
                out   = os.path.join(OUT_DIR, fname)
                print(f"[{done}/{total}] {proto}{page} run {run} …")
                report = run_lighthouse(url, out)
                all_results[proto][page].append(extract(report))

    return all_results

# ── Markdown report ───────────────────────────────────────────────────────────

def build_md(all_results: dict) -> str:
    ts  = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    md  = [f"# Lighthouse Benchmark Report\n\n_Generated: {ts}_\n"]
    md += [
        "## Setup\n",
        f"- Runs per prototype/page: **{RUNS}**",
        "- Caching: **disabled**",
        f"- Bandwidth: **0.4 Mbit/s** up/down",
        f"- Latency: **2 000 ms RTT**\n",
    ]

    metric_labels = list(METRICS.values())

    for proto in PROTOTYPES:
        md.append(f"## {proto}\n")
        for page in PAGES:
            slug = page or "/"
            md.append(f"### `{slug}`\n")

            # per-run table
            header = "| Run | " + " | ".join(metric_labels) + " |"
            sep    = "|-----|" + "|".join(["---"] * len(metric_labels)) + "|"
            md += [header, sep]
            for i, row in enumerate(all_results[proto][page], 1):
                vals = " | ".join(str(row.get(m, "—")) for m in metric_labels)
                md.append(f"| {i} | {vals} |")

            # aggregated table
            md.append("\n**Aggregated**\n")
            agg_header = "| Metric | Mean | Median | Min | Max | Stdev |"
            agg_sep    = "|--------|------|--------|-----|-----|-------|"
            md += [agg_header, agg_sep]
            for m in metric_labels:
                vals = [r.get(m, 0) for r in all_results[proto][page]]
                a    = agg(vals)
                md.append(f"| {m} | {a['mean']} | {a['median']} | {a['min']} | {a['max']} | {a['stdev']} |")
            md.append("")

    return "\n".join(md)

# ── Graphs ────────────────────────────────────────────────────────────────────

def make_graphs(all_results: dict):
    metric_labels = list(METRICS.values())
    protos        = list(PROTOTYPES.keys())
    colors        = ["#4C72B0", "#DD8452"]

    # 1. Per-page comparison bar charts (one figure per page)
    for page in PAGES:
        slug  = page.strip("/").replace("/", "-") or "home"
        fig, axes = plt.subplots(1, len(metric_labels), figsize=(4 * len(metric_labels), 5))
        fig.suptitle(f"Page: {page or '/'}", fontsize=14, fontweight="bold")

        for ax, metric in zip(axes, metric_labels):
            means = []
            errs  = []
            for proto in protos:
                vals = [r.get(metric, 0) for r in all_results[proto][page]]
                means.append(statistics.mean(vals))
                errs.append(statistics.stdev(vals) if len(vals) > 1 else 0)

            bars = ax.bar(protos, means, yerr=errs, capsize=4,
                          color=colors, alpha=0.85, edgecolor="white")
            ax.set_title(metric, fontsize=9)
            ax.set_ylabel("")
            ax.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f"{x:,.0f}"))
            ax.bar_label(bars, fmt="%.1f", padding=3, fontsize=7)
            ax.set_ylim(0, max(means) * 1.35 if max(means) else 1)

        plt.tight_layout()
        out = os.path.join(OUT_DIR, f"compare_{slug}.png")
        plt.savefig(out, dpi=150)
        plt.close()
        print(f"Saved {out}")

    # 2. Aggregated radar chart across all pages
    _radar_chart(all_results, protos, metric_labels, colors)

    # 3. Run-over-run line charts per metric (averaged across pages)
    _line_charts(all_results, protos, metric_labels, colors)


def _radar_chart(all_results, protos, metric_labels, colors):
    # Compute mean across all pages for each metric
    means_by_proto = {}
    for proto in protos:
        combined = {m: [] for m in metric_labels}
        for page in PAGES:
            for row in all_results[proto][page]:
                for m in metric_labels:
                    combined[m].append(row.get(m, 0))
        means_by_proto[proto] = [statistics.mean(combined[m]) for m in metric_labels]

    # Normalise 0-1 (lower is better for all except Score)
    norm = []
    for i, m in enumerate(metric_labels):
        vals = [means_by_proto[p][i] for p in protos]
        mx   = max(vals) or 1
        if m == "Score":
            norm.append([v / mx for v in vals])
        else:
            norm.append([1 - v / mx for v in vals])  # invert: higher = better

    N      = len(metric_labels)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(7, 7), subplot_kw={"polar": True})
    for pi, proto in enumerate(protos):
        vals = [norm[i][pi] for i in range(N)] + [norm[0][pi]]
        ax.plot(angles, vals, color=colors[pi], linewidth=2, label=proto)
        ax.fill(angles, vals, color=colors[pi], alpha=0.15)

    ax.set_thetagrids(np.degrees(angles[:-1]), metric_labels, fontsize=9)
    ax.set_title("Overall Comparison (normalised, higher = better)", pad=20)
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1))
    out = os.path.join(OUT_DIR, "radar_overall.png")
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Saved {out}")


def _line_charts(all_results, protos, metric_labels, colors):
    fig, axes = plt.subplots(
        len(metric_labels), 1,
        figsize=(10, 3 * len(metric_labels)),
        sharex=True,
    )
    fig.suptitle("Run-over-run (mean across pages)", fontsize=13, fontweight="bold")

    for ax, metric in zip(axes, metric_labels):
        for pi, proto in enumerate(protos):
            # average across pages for each run index
            run_vals = []
            for run_i in range(RUNS):
                page_vals = [all_results[proto][page][run_i].get(metric, 0) for page in PAGES]
                run_vals.append(statistics.mean(page_vals))
            ax.plot(range(1, RUNS + 1), run_vals, marker="o",
                    color=colors[pi], label=proto, linewidth=1.8)
        ax.set_ylabel(metric, fontsize=8)
        ax.legend(fontsize=8)
        ax.grid(True, alpha=0.3)

    axes[-1].set_xlabel("Run #")
    plt.tight_layout()
    out = os.path.join(OUT_DIR, "runs_line.png")
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"Saved {out}")

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    os.environ.setdefault("CHROME_PATH", "/usr/bin/chromium-browser")
    print("Starting Lighthouse benchmark …\n")
    all_results = collect_all()

    md_path = os.path.join(OUT_DIR, "report.md")
    with open(md_path, "w") as f:
        f.write(build_md(all_results))
    print(f"\nMarkdown report → {md_path}")

    make_graphs(all_results)
    print("\nDone.")
