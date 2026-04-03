"use client";
import { getProduct, getRelated, getReviews, getSellerInfo, getStockStatus, getPriceHistory } from "@rsc-study/data";
import { useEffect, useState, use } from "react";
import { useCart } from "../../CartContext";
import Link from "next/link";
import type { Product, Review, SellerInfo, StockStatus, PriceHistory } from "@rsc-study/data";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [stock, setStock] = useState<StockStatus | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const { add } = useCart();

  useEffect(() => {
    const numId = Number(id);
    getProduct(numId).then((p) => {
      if (!p) return;
      setProduct(p);
      getRelated(p.category, p.id).then(setRelated);
      getReviews(p.id).then(setReviews);
      getSellerInfo(p.id).then(setSeller);
      getStockStatus(p.id).then(setStock);
      getPriceHistory(p.id).then(setPriceHistory);
    });
  }, [id]);

  if (!product) return <main style={{ padding: "48px 32px", textAlign: "center", color: "#666" }}>Loading...</main>;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>
      <Link href="/products" style={{ color: "#666", textDecoration: "none", fontSize: 14, display: "inline-block", marginBottom: 24 }}>← Back to Products</Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        <img src={product.image_url} alt={product.name} style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "1" }} />
        <div>
          <div style={{ fontSize: 12, color: "#e63946", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{product.category}</div>
          <h1 style={{ fontSize: 28, margin: "0 0 12px", fontWeight: 800 }}>{product.name}</h1>
          <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>${product.price.toFixed(2)}</div>
          {stock ? (
            <div style={{ marginBottom: 24, fontSize: 14, color: stock.inStock ? "#2a9d5c" : "#e63946", fontWeight: 600 }}>
              {stock.inStock ? `✓ In stock (${stock.quantity} left) — ${stock.estimatedDelivery}` : "✗ Out of stock"}
              <span style={{ color: "#999", fontWeight: 400, marginLeft: 8 }}>Warehouse: {stock.warehouse}</span>
            </div>
          ) : <div style={{ marginBottom: 24, color: "#999", fontSize: 14 }}>Checking stock...</div>}
          <button
            onClick={() => add({ id: product.id, name: product.name, price: product.price, qty: 1 })}
            style={{ width: "100%", padding: "14px 0", background: "#e63946", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <section style={{ marginTop: 48, padding: 24, background: "#f9f9f9", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Sold by</h2>
        {seller ? (
          <div style={{ display: "flex", gap: 32 }}>
            <div><strong>{seller.name}</strong><div style={{ color: "#666", fontSize: 14 }}>{seller.location}</div></div>
            <div><strong>{"★".repeat(Math.floor(seller.rating))}</strong> {seller.rating.toFixed(1)}<div style={{ color: "#666", fontSize: 14 }}>{seller.sales.toLocaleString()} sales</div></div>
          </div>
        ) : <p style={{ color: "#999" }}>Loading seller info...</p>}
      </section>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Price History (6 months)</h2>
        {priceHistory.length > 0 ? (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 80 }}>
            {priceHistory.map((h) => {
              const max = Math.max(...priceHistory.map((x) => x.price));
              return (
                <div key={h.month} style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ background: "#e63946", borderRadius: 4, height: `${(h.price / max) * 60}px`, marginBottom: 4 }} />
                  <div style={{ fontSize: 11, color: "#666" }}>{h.month}</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>${h.price}</div>
                </div>
              );
            })}
          </div>
        ) : <p style={{ color: "#999" }}>Loading price history...</p>}
      </section>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Customer Reviews</h2>
        {reviews.length === 0 ? <p style={{ color: "#999" }}>Loading reviews...</p> : reviews.map((r) => (
          <div key={r.id} style={{ borderTop: "1px solid #eee", padding: "16px 0" }}>
            <div style={{ fontWeight: 600 }}>{r.reviewer} — {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <p style={{ color: "#555", margin: "4px 0 0" }}>{r.comment}</p>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Related Products</h2>
        {related.length === 0 ? <p style={{ color: "#999" }}>Loading related products...</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
                <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                <div style={{ padding: "8px 12px" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ color: "#e63946", fontWeight: 700 }}>${p.price.toFixed(2)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
