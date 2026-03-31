import { supabase } from "@rsc-study/supabase";
import AddToCart from "../../AddToCart";
import { Suspense } from "react";

type Product = { id: number; name: string; price: number; category: string; description: string; image_url: string };

async function ProductImage({ id }: { id: string }) {
  const { data } = await supabase.from("products").select("image_url, name").eq("id", id).single();
  if (!data) return null;
  return <img src={data.image_url} alt={data.name} style={{ width: "100%", borderRadius: 8 }} />;
}

async function ProductInfo({ id }: { id: string }) {
  const { data: p } = await supabase.from("products").select("id, name, price, category, description").eq("id", id).single();
  if (!p) return <p>Product not found.</p>;
  const product = p as Product;
  return (
    <>
      <h1>{product.name}</h1>
      <p style={{ color: "#666" }}>{product.category}</p>
      <p>{product.description}</p>
      <p style={{ fontSize: 24, fontWeight: "bold" }}>${product.price}</p>
      <AddToCart id={product.id} name={product.name} price={product.price} />
    </>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      {/* Image is an RSC — served before the rest of the content */}
      <Suspense fallback={<div style={{ width: "100%", aspectRatio: "1", background: "#eee", borderRadius: 8 }} />}>
        <ProductImage id={id} />
      </Suspense>
      <Suspense fallback={<p>Loading...</p>}>
        <ProductInfo id={id} />
      </Suspense>
    </main>
  );
}
