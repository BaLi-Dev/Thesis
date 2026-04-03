import { getProduct, getRelated, getReviews } from "@rsc-study/data";
import AddToCart from "../../AddToCart";
import Link from "next/link";
import type { Product, Review } from "@rsc-study/data";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getProduct(Number(id));
  if (!p) return <main style={{ padding: "48px 32px", textAlign: "center", color: "#666" }}>Product not found.</main>;

  const related = getRelated(p.category, p.id);
  const reviews = getReviews(p.id);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>
      <Link href="/products" style={{ color: "#666", textDecoration: "none", fontSize: 14, display: "inline-block", marginBottom: 24 }}>← Back to Products</Link>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        <img src={p.image_url} alt={p.name} style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "1" }} />
        <div>
          <div style={{ fontSize: 12, color: "#e63946", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.category}</div>
          <h1 style={{ fontSize: 28, margin: "0 0 12px", fontWeight: 800 }}>{p.name}</h1>
          <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 24 }}>{p.description}</p>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 24 }}>${p.price.toFixed(2)}</div>
          <AddToCart id={p.id} name={p.name} price={p.price} variant="detail" />
        </div>
      </div>
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Customer Reviews</h2>
        {reviews.map((r: Review) => (
          <div key={r.id} style={{ borderTop: "1px solid #eee", padding: "16px 0" }}>
            <div style={{ fontWeight: 600 }}>{r.reviewer} — {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <p style={{ color: "#555", margin: "4px 0 0" }}>{r.comment}</p>
          </div>
        ))}
      </section>
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Related Products</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {related.map((rel: Product) => (
            <Link key={rel.id} href={`/products/${rel.id}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
              <img src={rel.image_url} alt={rel.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />
              <div style={{ padding: "8px 12px" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{rel.name}</div>
                <div style={{ color: "#e63946", fontWeight: 700 }}>${rel.price.toFixed(2)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
