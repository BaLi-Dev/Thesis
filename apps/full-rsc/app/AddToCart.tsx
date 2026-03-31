"use client";
import { useCart } from "./CartContext";

type Props = { id: number; name: string; price: number; variant?: "card" | "detail" };

export default function AddToCart({ id, name, price, variant = "card" }: Props) {
  const { add } = useCart();
  const isDetail = variant === "detail";
  return (
    <button
      onClick={() => add({ id, name, price, qty: 1 })}
      style={{
        width: "100%",
        padding: isDetail ? "14px 0" : "8px 0",
        background: isDetail ? "#e63946" : "#111",
        color: "#fff",
        border: "none",
        borderRadius: isDetail ? 8 : 6,
        fontWeight: 700,
        cursor: "pointer",
        fontSize: isDetail ? 16 : 14,
      }}
    >
      Add to Cart
    </button>
  );
}
