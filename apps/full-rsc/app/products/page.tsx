import Spinner from "../Spinner";
const Loading = () => <div style={{ padding: "32px 0" }}><Spinner size={32} /></div>;
import { products, getCategoryStats } from "@rsc-study/data";
import AddToCart from "../AddToCart";
import SearchBar from "../SearchBar";
import Link from "next/link";
import { Suspense } from "react";
import type { Product, CategoryStat } from "@rsc-study/data";

function ProductGrid({ q }: { q: string }) {
  const filtered = q
    ? products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()))
    : products;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
      {filtered.map((p: Product) => (
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
          </div>
        </div>
      ))}
    </div>
  );
}

async function CategorySidebar() {
  const stats = await getCategoryStats() as CategoryStat[];
  return (
    <aside style={{ minWidth: 200 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Categories</h3>
      {stats.map((s) => (
        <div key={s.category} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{s.category}</div>
          <div style={{ fontSize: 12, color: "#999" }}>{s.count} parts · avg ${s.avgPrice}</div>
        </div>
      ))}
    </aside>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return (
    <main style={{ padding: "32px" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Products</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>Quality parts for all major brands</p>
        <Suspense><SearchBar /></Suspense>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start", marginTop: 24 }}>
          <Suspense fallback={<Loading />}>
            <CategorySidebar />
          </Suspense>
          <div style={{ flex: 1 }}>
            <ProductGrid q={q} />
          </div>
        </div>
      </div>
    </main>
  );
}
