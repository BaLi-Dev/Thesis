"use client";
import { useCart } from "./CartContext";

type Props = { id: number; name: string; price: number };

export default function AddToCart({ id, name, price }: Props) {
  const { add } = useCart();
  return (
    <button onClick={() => add({ id, name, price, qty: 1 })} style={{ marginTop: 8, width: "100%", padding: "8px 0", cursor: "pointer" }}>
      Add to cart
    </button>
  );
}
