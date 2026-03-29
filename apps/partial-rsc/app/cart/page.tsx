"use client";
import { useCart } from "../CartContext";

export default function CartPage() {
  const { items } = useCart();
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <main style={{ padding: 24 }}>
      <h1>Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {items.map((i) => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <span>{i.name} x{i.qty}</span>
              <span>${(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <p style={{ fontWeight: "bold", marginTop: 16 }}>Total: ${total.toFixed(2)}</p>
        </>
      )}
    </main>
  );
}
