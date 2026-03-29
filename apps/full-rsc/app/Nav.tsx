import Link from "next/link";

export default function Nav() {
  return (
    <nav style={{ display: "flex", gap: 24, padding: "16px 24px", borderBottom: "1px solid #ccc" }}>
      <Link href="/">Home</Link>
      <Link href="/products">Products</Link>
      <Link href="/about">About</Link>
      <Link href="/cart">Cart</Link>
    </nav>
  );
}
