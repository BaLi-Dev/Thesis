"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <input
      placeholder="Search by name or category..."
      defaultValue={params.get("q") ?? ""}
      onChange={(e) => router.push(`/products?q=${e.target.value}`)}
      style={{ padding: "10px 16px", marginBottom: 32, width: 320, display: "block", border: "1px solid #ddd", borderRadius: 8, fontSize: 15 }}
    />
  );
}
