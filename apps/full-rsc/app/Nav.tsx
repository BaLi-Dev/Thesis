"use client";
import Link from "next/link";
import { useCart } from "./CartContext";

export default function Nav() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 60, background: "#111", color: "#fff" }}>
      <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: "#fff", textDecoration: "none", letterSpacing: 1 }}>⚙ AutoParts</Link>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <Link href="/products" style={{ color: "#ccc", textDecoration: "none", fontSize: 15 }}>Products</Link>
        <Link href="/about" style={{ color: "#ccc", textDecoration: "none", fontSize: 15 }}>About</Link>
        <Link href="/cart" style={{ color: "#fff", textDecoration: "none", fontSize: 15, background: "#e63946", padding: "6px 16px", borderRadius: 6, fontWeight: 600 }}>
          Cart {count > 0 && `(${count})`}
        </Link>
      </div>
    </nav>
  );
}
