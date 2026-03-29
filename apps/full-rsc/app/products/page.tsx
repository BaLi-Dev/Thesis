import { supabase } from "@rsc-study/supabase";

type Product = { id: number; name: string; price: number; category: string; image_url: string };

export default async function ProductsPage() {
  const { data: products } = await supabase.from("products").select("*");

  return (
    <main style={{ padding: 24 }}>
      <h1>Products</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {(products ?? []).map((p: Product) => (
          <div key={p.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
            <img src={p.image_url} alt={p.name} style={{ width: "100%", borderRadius: 4 }} />
            <h3 style={{ margin: "8px 0 4px" }}>{p.name}</h3>
            <p style={{ color: "#666", margin: 0 }}>{p.category}</p>
            <p style={{ fontWeight: "bold" }}>${p.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
