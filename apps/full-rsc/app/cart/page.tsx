"use client";
import { useCart } from "../CartContext";
import Link from "next/link";

export default function CartPage() {
  const { items, remove } = useCart();
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "48px 32px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Your Cart</h1>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ color: "#666", fontSize: 18, marginBottom: 24 }}>Your cart is empty.</p>
          <Link href="/products" style={{ background: "#e63946", color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
            {items.map((i, idx) => (
              <div key={i.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: idx < items.length - 1 ? "1px solid #eee" : "none" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{i.name}</div>
                  <div style={{ color: "#666", fontSize: 14 }}>Qty: {i.qty} × ${i.price.toFixed(2)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontWeight: 700 }}>${(i.price * i.qty).toFixed(2)}</span>
                  <button onClick={() => remove(i.id)} style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#e63946", fontWeight: 600 }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderTop: "2px solid #111" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#e63946" }}>${total.toFixed(2)}</span>
          </div>
          <button style={{ marginTop: 16, width: "100%", padding: "14px 0", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Proceed to Checkout
          </button>
        </>
      )}
    </main>
  );
}
