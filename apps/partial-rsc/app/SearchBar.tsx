"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <input
      placeholder="Search products..."
      defaultValue={params.get("q") ?? ""}
      onChange={(e) => router.push(`/products?q=${e.target.value}`)}
      style={{ padding: 8, marginBottom: 16, width: 300, display: "block" }}
    />
  );
}
