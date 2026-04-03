"use client";
import { useCart } from "./CartContext";
import { useState } from "react";
import Link from "next/link";

type Props = { id: number; name: string; price: number; variant?: "card" | "detail" };

export default function AddToCart({ id, name, price, variant = "card" }: Props) {
  const { add, items } = useCart();
  const [show, setShow] = useState(false);
  const isDetail = variant === "detail";
  const total = items.reduce((s, i) => s + i.qty, 0);

  function handleAdd() {
    add({ id, name, price, qty: 1 });
    setShow(true);
    setTimeout(() => setShow(false), 3000);
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleAdd}
        style={{ width: "100%", padding: isDetail ? "14px 0" : "8px 0", background: isDetail ? "#e63946" : "#111", color: "#fff", border: "none", borderRadius: isDetail ? 8 : 6, fontWeight: 700, cursor: "pointer", fontSize: isDetail ? 16 : 14 }}
      >
        Add to Cart
      </button>
      {show && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #eee", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: 16, zIndex: 100, minWidth: 220 }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: "#2a9d5c" }}>✓ Added to cart</div>
          <div style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>{name}</div>
          <div style={{ fontSize: 13, color: "#999", marginBottom: 12 }}>{total} item{total !== 1 ? "s" : ""} in cart</div>
          <Link href="/cart" style={{ display: "block", textAlign: "center", background: "#e63946", color: "#fff", padding: "8px 0", borderRadius: 6, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
            View Cart
          </Link>
        </div>
      )}
    </div>
  );
}
