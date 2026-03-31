"use client";
import { supabase } from "@rsc-study/supabase";
import { useEffect, useState } from "react";
import { useCart } from "../../CartContext";
import { use } from "react";

type Product = { id: number; name: string; price: number; category: string; description: string; image_url: string };

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const { add } = useCart();

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single()
      .then(({ data }) => setProduct(data));
  }, [id]);

  if (!product) return <main style={{ padding: 24 }}>Loading...</main>;

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <img src={product.image_url} alt={product.name} style={{ width: "100%", borderRadius: 8 }} />
      <h1>{product.name}</h1>
      <p style={{ color: "#666" }}>{product.category}</p>
      <p>{product.description}</p>
      <p style={{ fontSize: 24, fontWeight: "bold" }}>${product.price}</p>
      <button onClick={() => add({ id: product.id, name: product.name, price: product.price, qty: 1 })}
        style={{ padding: "10px 24px", cursor: "pointer" }}>
        Add to cart
      </button>
    </main>
  );
}
