"use client";
import { supabase } from "@rsc-study/supabase";
import { useEffect, useState } from "react";

export default function Page() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    supabase.from("_test_connection").select("*").limit(1).then(({ error }) => {
      setStatus(error ? `connected (${error.message})` : "connected");
    });
  }, []);

  return (
    <div>
      <h1>no-rsc</h1>
      <p>Supabase: {status}</p>
    </div>
  );
}
