"use client";
import { products } from "@rsc-study/data";
import { useCart } from "../CartContext";
import { useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const { add } = useCart();

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ padding: "32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Products</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>{filtered.length} parts available</p>
        <input
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px 16px", marginBottom: 32, width: 320, display: "block", border: "1px solid #ddd", borderRadius: 8, fontSize: 15 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Link href={`/products/${p.id}`}>
                <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
              </Link>
              <div style={{ padding: "12px 16px 16px" }}>
                <div style={{ fontSize: 11, color: "#e63946", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{p.category}</div>
                <Link href={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600 }}>{p.name}</h3>
                </Link>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>${p.price.toFixed(2)}</div>
                <button
                  onClick={() => add({ id: p.id, name: p.name, price: p.price, qty: 1 })}
                  style={{ width: "100%", padding: "8px 0", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
