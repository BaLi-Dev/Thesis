"use client";
import Link from "next/link";

export default function Page() {
  return (
    <main>
      <div style={{ background: "linear-gradient(135deg, #111 0%, #1a1a2e 100%)", color: "#fff", padding: "80px 32px", textAlign: "center" }}>
        <h1 style={{ fontSize: 48, margin: "0 0 16px", fontWeight: 800 }}>Quality Car Parts</h1>
        <p style={{ fontSize: 20, color: "#aaa", margin: "0 0 32px" }}>Over 10,000 parts for all major brands. Fast delivery, guaranteed fit.</p>
        <Link href="/products" style={{ background: "#e63946", color: "#fff", padding: "14px 36px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 18 }}>
          Shop Now
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, padding: "48px 32px", maxWidth: 900, margin: "0 auto" }}>
        {[
          { icon: "🚗", title: "All Major Brands", desc: "Parts for BMW, Audi, Ford, Toyota and more" },
          { icon: "🚚", title: "Fast Delivery", desc: "Order before 3pm for next-day dispatch" },
          { icon: "✅", title: "Guaranteed Fit", desc: "Wrong part? We'll replace it, no questions asked" },
        ].map((f) => (
          <div key={f.title} style={{ textAlign: "center", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ margin: "0 0 8px" }}>{f.title}</h3>
            <p style={{ color: "#666", margin: 0, fontSize: 14 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
