import { supabase } from "@rsc-study/supabase";
import AddToCart from "../../AddToCart";

type Product = { id: number; name: string; price: number; category: string; description: string; image_url: string };

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { data: product } = await supabase.from("products").select("*").eq("id", params.id).single();
  if (!product) return <main style={{ padding: 24 }}>Product not found.</main>;
  const p = product as Product;

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <img src={p.image_url} alt={p.name} style={{ width: "100%", borderRadius: 8 }} />
      <h1>{p.name}</h1>
      <p style={{ color: "#666" }}>{p.category}</p>
      <p>{p.description}</p>
      <p style={{ fontSize: 24, fontWeight: "bold" }}>${p.price}</p>
      <AddToCart id={p.id} name={p.name} price={p.price} />
    </main>
  );
}
