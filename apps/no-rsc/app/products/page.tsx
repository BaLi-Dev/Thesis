"use client";
import { supabase } from "@rsc-study/supabase";
import { useEffect, useState } from "react";
import { useCart } from "../CartContext";

type Product = { id: number; name: string; price: number; category: string; image_url: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { add } = useCart();

  useEffect(() => {
    supabase.from("products").select("*").then(({ data }) => setProducts(data ?? []));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Products</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
            <img src={p.image_url} alt={p.name} style={{ width: "100%", borderRadius: 4 }} />
            <h3 style={{ margin: "8px 0 4px" }}>{p.name}</h3>
            <p style={{ color: "#666", margin: 0 }}>{p.category}</p>
            <p style={{ fontWeight: "bold" }}>${p.price}</p>
            <button onClick={() => add({ id: p.id, name: p.name, price: p.price, qty: 1 })} style={{ marginTop: 8, width: "100%", padding: "8px 0", cursor: "pointer" }}>
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
