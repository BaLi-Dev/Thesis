import { supabase } from "@rsc-study/supabase";
import AddToCart from "../../AddToCart";
import Link from "next/link";

type Product = { id: number; name: string; price: number; category: string; description: string; image_url: string };

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) return <main style={{ padding: "48px 32px", textAlign: "center", color: "#666" }}>Product not found.</main>;
  const p = product as Product;

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
    </main>
  );
}
