import { supabase } from "@rsc-study/supabase";

export default async function Page() {
  const { error } = await supabase.from("_test_connection").select("*").limit(1);
  const status = error ? `connected (${error.message})` : "connected";

  return (
    <div>
      <h1>full-rsc</h1>
      <p>Supabase: {status}</p>
    </div>
  );
}
