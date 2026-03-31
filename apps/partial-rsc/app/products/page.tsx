import { supabase } from "@rsc-study/supabase";
import AddToCart from "../AddToCart";
import SearchBar from "../SearchBar";
import Link from "next/link";
import { Suspense } from "react";

type Product = { id: number; name: string; price: number; category: string; image_url: string };

async function ProductGrid({ q }: { q: string }) {
  const query = supabase.from("products").select("id, name, price, category, image_url");
  if (q) query.ilike("name", `%${q}%`);
  const { data: products } = await query;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
      {(products ?? []).map((p: Product) => (
        <div key={p.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
          <Link href={`/products/${p.id}`}>
            {/* Image fetched and rendered server-side */}
            <img src={p.image_url} alt={p.name} style={{ width: "100%", borderRadius: 4 }} />
            <h3 style={{ margin: "8px 0 4px" }}>{p.name}</h3>
          </Link>
          <p style={{ color: "#666", margin: 0 }}>{p.category}</p>
          <p style={{ fontWeight: "bold" }}>${p.price}</p>
          {/* Only the interactive button is a client component */}
          <AddToCart id={p.id} name={p.name} price={p.price} />
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return (
    <main style={{ padding: 24 }}>
      <h1>Products</h1>
      {/* SearchBar is a client component for interactivity */}
      <Suspense><SearchBar /></Suspense>
      {/* ProductGrid is an RSC — renders images server-side */}
      <Suspense fallback={<p>Loading...</p>}>
        <ProductGrid q={q} />
      </Suspense>
    </main>
  );
}
