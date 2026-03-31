import { supabase } from "@rsc-study/supabase";

export default async function ProductDetailImage({ id }: { id: string }) {
  const { data } = await supabase.from("products").select("image_url, name").eq("id", id).single();
  if (!data) return null;
  return <img src={data.image_url} alt={data.name} style={{ width: "100%", borderRadius: 8 }} />;
}
