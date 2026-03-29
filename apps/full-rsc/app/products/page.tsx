import { supabase } from "@rsc-study/supabase";
import AddToCart from "../AddToCart";
import SearchBar from "../SearchBar";
import Link from "next/link";
import { Suspense } from "react";

type Product = { id: number; name: string; price: number; category: string; image_url: string };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = supabase.from("products").select("*");
  if (q) query.ilike("name", `%${q}%`);
  const { data: products } = await query;

  return (
    <main style={{ padding: 24 }}>
      <h1>Products</h1>
      <Suspense><SearchBar /></Suspense>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {(products ?? []).map((p: Product) => (
          <div key={p.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
            <Link href={`/products/${p.id}`}>
              <img src={p.image_url} alt={p.name} style={{ width: "100%", borderRadius: 4 }} />
              <h3 style={{ margin: "8px 0 4px" }}>{p.name}</h3>
            </Link>
            <p style={{ color: "#666", margin: 0 }}>{p.category}</p>
            <p style={{ fontWeight: "bold" }}>${p.price}</p>
            <AddToCart id={p.id} name={p.name} price={p.price} />
          </div>
        ))}
      </div>
    </main>
  );
}
