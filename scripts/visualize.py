import json
import glob
import os
import matplotlib.pyplot as plt
import numpy as np

APPS = ["no-rsc", "partial-rsc", "full-rsc"]
METRICS = {
    "first-contentful-paint": "FCP",
    "largest-contentful-paint": "LCP",
    "total-blocking-time": "TBT",
    "speed-index": "Speed Index",
    "interactive": "TTI",
}

def load_results(base="."):
    results = {}
    for app in APPS:
        app_dir = os.path.join(base, app)
        if not os.path.isdir(app_dir):
            print(f"Skipping {app}: directory not found")
            continue
        files = glob.glob(os.path.join(app_dir, "*.json"))
        if not files:
            print(f"Skipping {app}: no JSON report found")
            continue
        with open(files[0]) as f:
            data = json.load(f)
        results[app] = {
            label: data["audits"][key]["numericValue"]
            for key, label in METRICS.items()
            if key in data.get("audits", {})
        }
        print(f"Loaded {app} from {files[0]}")
    return results

def plot(results):
    labels = list(METRICS.values())
    apps = list(results.keys())
    x = np.arange(len(labels))
    width = 0.8 / len(apps)

    fig, ax = plt.subplots(figsize=(12, 6))
    for i, app in enumerate(apps):
        values = [results[app].get(label, 0) for label in labels]
        bars = ax.bar(x + i * width - (len(apps) - 1) * width / 2, values, width, label=app)
        ax.bar_label(bars, fmt="%.0f", padding=3, fontsize=8)

    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_ylabel("Milliseconds")
    ax.set_title("Lighthouse Metrics by Prototype")
    ax.legend()
    ax.set_ylim(0, max(v for r in results.values() for v in r.values()) * 1.2)
    plt.tight_layout()
    plt.savefig("lighthouse-results.png", dpi=150)
    plt.show()
    print("Saved lighthouse-results.png")

if __name__ == "__main__":
    results = load_results(".")
    if not results:
        print("No results to visualize.")
    else:
        for app, metrics in results.items():
            print(f"\n{app}:")
            for k, v in metrics.items():
                print(f"  {k}: {v:.0f} ms")
        plot(results)
