"use client";
import { supabase } from "@rsc-study/supabase";
import { useEffect, useState, use } from "react";
import { useCart } from "../../CartContext";
import Link from "next/link";

type Product = { id: number; name: string; price: number; category: string; description: string; image_url: string };
type Review = { id: number; reviewer: string; rating: number; comment: string };

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { add } = useCart();

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) return;
      setProduct(data);
      supabase.from("products").select("*").eq("category", data.category).neq("id", id).limit(3)
        .then(({ data: rel }) => setRelated(rel ?? []));
      supabase.from("reviews").select("*").eq("product_id", id)
        .then(({ data: rev }) => setReviews(rev ?? []));
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
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 24 }}>${product.price.toFixed(2)}</div>
          <button
            onClick={() => add({ id: product.id, name: product.name, price: product.price, qty: 1 })}
            style={{ width: "100%", padding: "14px 0", background: "#e63946", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Customer Reviews</h2>
        {reviews.length === 0 ? <p style={{ color: "#999" }}>Loading reviews...</p> : reviews.map((r) => (
          <div key={r.id} style={{ borderTop: "1px solid #eee", padding: "16px 0" }}>
            <div style={{ fontWeight: 600 }}>{r.reviewer} — {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <p style={{ color: "#555", margin: "4px 0 0" }}>{r.comment}</p>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Related Products</h2>
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
