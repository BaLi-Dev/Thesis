import { supabase } from "@rsc-study/supabase";
import AddToCart from "../AddToCart";
import SearchBar from "../SearchBar";
import Link from "next/link";
import { Suspense } from "react";

type Product = { id: number; name: string; price: number; category: string; image_url: string };

async function ProductGrid({ q }: { q: string }) {
  const query = supabase.from("products").select("*");
  if (q) query.ilike("name", `%${q}%`);
  const { data: products } = await query;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
      {(products ?? []).map((p: Product) => (
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
            <AddToCart id={p.id} name={p.name} price={p.price} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return (
    <main style={{ padding: "32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Products</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>Quality parts for all major brands</p>
        <Suspense><SearchBar /></Suspense>
        <Suspense fallback={<p style={{ color: "#666" }}>Loading products...</p>}>
          <ProductGrid q={q} />
        </Suspense>
      </div>
    </main>
  );
}
