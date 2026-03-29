import { supabase } from "@rsc-study/supabase";
import AddToCart from "../../AddToCart";

type Product = { id: number; name: string; price: number; category: string; description: string; image_url: string };

async function ProductDetail({ id }: { id: string }) {
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) return <p>Product not found.</p>;
  return (
    <>
      <img src={(product as Product).image_url} alt={(product as Product).name} style={{ width: "100%", borderRadius: 8 }} />
      <h1>{(product as Product).name}</h1>
      <p style={{ color: "#666" }}>{(product as Product).category}</p>
      <p>{(product as Product).description}</p>
      <p style={{ fontSize: 24, fontWeight: "bold" }}>${(product as Product).price}</p>
      <AddToCart id={(product as Product).id} name={(product as Product).name} price={(product as Product).price} />
    </>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <ProductDetail id={id} />
    </main>
  );
}
