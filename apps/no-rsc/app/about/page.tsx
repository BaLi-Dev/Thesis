"use client";

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 32px" }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>About AutoParts</h1>
      <p style={{ color: "#666", fontSize: 18, marginBottom: 32 }}>Your trusted source for quality car parts since 2005.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>Our Story</h2>
          <p style={{ color: "#444", lineHeight: 1.7 }}>
            AutoParts was founded in 2005 by a team of automotive engineers frustrated by the lack of reliable, affordable parts online.
            Today we stock over 10,000 parts for all major brands and ship to customers across Europe.
          </p>
        </div>
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>Our Promise</h2>
          <p style={{ color: "#444", lineHeight: 1.7 }}>
            Every part we sell is OEM-spec or better. If a part doesn't fit, we'll replace it free of charge.
            Our team of experts is available 7 days a week to help you find the right part.
          </p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[{ num: "10,000+", label: "Parts in stock" }, { num: "50,000+", label: "Happy customers" }, { num: "20", label: "Years in business" }].map((s) => (
          <div key={s.label} style={{ background: "#f5f5f5", borderRadius: 12, padding: "24px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#e63946" }}>{s.num}</div>
            <div style={{ color: "#666", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
