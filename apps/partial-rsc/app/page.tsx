"use client";
import { getFeaturedProducts, getAnnouncements } from "@rsc-study/data";
import { useEffect, useState } from "react";
import Link from "next/link";
import AddToCart from "./AddToCart";
import type { FeaturedProduct, Announcement } from "@rsc-study/data";

export default function Page() {
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    getFeaturedProducts().then(setFeatured);
    getAnnouncements().then(setAnnouncements);
  }, []);

  return (
    <main>
      <div style={{ background: "linear-gradient(135deg, #111 0%, #1a1a2e 100%)", color: "#fff", padding: "80px 32px", textAlign: "center" }}>
        <h1 style={{ fontSize: 48, margin: "0 0 16px", fontWeight: 800 }}>Quality Car Parts</h1>
        <p style={{ fontSize: 20, color: "#aaa", margin: "0 0 32px" }}>Over 10,000 parts for all major brands. Fast delivery, guaranteed fit.</p>
        <Link href="/products" style={{ background: "#e63946", color: "#fff", padding: "14px 36px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 18 }}>Shop Now</Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 0" }}>
        {announcements.length === 0 ? (
          <p style={{ color: "#999" }}>Loading announcements...</p>
        ) : announcements.map((a) => (
          <div key={a.id} style={{ padding: "10px 16px", marginBottom: 8, borderRadius: 8, background: a.type === "sale" ? "#fff3cd" : a.type === "new" ? "#d4edda" : "#d1ecf1", fontSize: 14 }}>
            {a.type === "sale" ? "🏷" : a.type === "new" ? "🆕" : "ℹ️"} {a.text}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
        <h2 style={{ fontSize: 24, marginBottom: 20 }}>Featured Products</h2>
        {featured.length === 0 ? (
          <p style={{ color: "#999" }}>Loading featured products...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 }}>
            {featured.map((p) => (
              <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 8, left: 8, background: "#e63946", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{p.badge}</div>
                <Link href={`/products/${p.id}`}><img src={p.image_url} alt={p.name} style={{ width: "100%", height: 140, objectFit: "cover" }} /></Link>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontWeight: 800 }}>${p.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, padding: "0 32px 48px", maxWidth: 900, margin: "0 auto" }}>
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
