"use client";
import { supabase } from "@rsc-study/supabase";
import { useEffect, useState, Suspense } from "react";
import { useCart } from "../CartContext";
import ProductImage from "./ProductImage";
import Link from "next/link";

type Product = { id: number; name: string; price: number; category: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const { add } = useCart();

  useEffect(() => {
    supabase.from("products").select("id, name, price, category").then(({ data }) => setProducts(data ?? []));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>Products</h1>
      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: 8, marginBottom: 16, width: 300, display: "block" }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {filtered.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
            <Link href={`/products/${p.id}`}>
              <Suspense fallback={<div style={{ width: "100%", aspectRatio: "1", background: "#eee", borderRadius: 4 }} />}>
                <ProductImage id={p.id} />
              </Suspense>
              <h3 style={{ margin: "8px 0 4px" }}>{p.name}</h3>
            </Link>
            <p style={{ color: "#666", margin: 0 }}>{p.category}</p>
            <p style={{ fontWeight: "bold" }}>${p.price}</p>
            <button
              onClick={() => add({ id: p.id, name: p.name, price: p.price, qty: 1 })}
              style={{ marginTop: 8, width: "100%", padding: "8px 0", cursor: "pointer" }}
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
