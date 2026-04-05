import { getProduct, getRelated, getReviews, getSellerInfo, getStockStatus, getPriceHistory, getCompatibleVehicles, getWarrantyInfo } from "@rsc-study/data";
import AddToCart from "../../AddToCart";
import Link from "next/link";
import { Suspense } from "react";
import Spinner from "../../Spinner";
import type { Product, Review, SellerInfo, StockStatus, PriceHistory, CompatibleVehicle, WarrantyInfo } from "@rsc-study/data";

const Loading = () => <div style={{ padding: "32px 0" }}><Spinner size={32} /></div>;

async function ProductDetails({ id }: { id: string }) {
  const [product, stock, seller] = await Promise.all([
    getProduct(Number(id)),
    getStockStatus(Number(id)),
    getSellerInfo(Number(id)),
  ]);
  if (!product) return <p>Product not found.</p>;
  const p = product as Product;
  const st = stock as StockStatus;
  const se = seller as SellerInfo;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
      <img src={p.image_url} alt={p.name} style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "1" }} />
      <div>
        <div style={{ fontSize: 12, color: "#e63946", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.category}</div>
        <h1 style={{ fontSize: 28, margin: "0 0 12px", fontWeight: 800 }}>{p.name}</h1>
        <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 24 }}>{p.description}</p>
        <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>${p.price.toFixed(2)}</div>
        <div style={{ marginBottom: 24, fontSize: 14, color: st.inStock ? "#2a9d5c" : "#e63946", fontWeight: 600 }}>
          {st.inStock ? `✓ In stock (${st.quantity} left) — ${st.estimatedDelivery}` : "✗ Out of stock"}
          <span style={{ color: "#999", fontWeight: 400, marginLeft: 8 }}>Warehouse: {st.warehouse}</span>
        </div>
        <AddToCart id={p.id} name={p.name} price={p.price} variant="detail" />
        <div style={{ marginTop: 24, padding: 16, background: "#f9f9f9", borderRadius: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Sold by {se.name}</div>
          <div style={{ fontSize: 13, color: "#666" }}>{se.location} · {"★".repeat(Math.floor(se.rating))} {se.rating.toFixed(1)} · {se.sales.toLocaleString()} sales</div>
        </div>
      </div>
    </div>
  );
}

async function ReviewsSection({ productId }: { productId: string }) {
  const reviews = await getReviews(Number(productId)) as Review[];
  return (
    <section style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Customer Reviews</h2>
      {reviews.map((r) => (
        <div key={r.id} style={{ borderTop: "1px solid #eee", padding: "16px 0" }}>
          <div style={{ fontWeight: 600 }}>{r.reviewer} — {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
          <p style={{ color: "#555", margin: "4px 0 0" }}>{r.comment}</p>
        </div>
      ))}
    </section>
  );
}

async function RelatedSection({ productId }: { productId: string }) {
  const product = await getProduct(Number(productId)) as Product;
  const related = await getRelated(product.category, product.id) as Product[];
  return (
    <section style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Related Products</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {related.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
            <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />
            <div style={{ padding: "8px 12px" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ color: "#e63946", fontWeight: 700 }}>${p.price.toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function CompatibleVehiclesSection({ productId }: { productId: string }) {
  const vehicles = await getCompatibleVehicles(Number(productId)) as CompatibleVehicle[];
  return (
    <section style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Compatible Vehicles</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {vehicles.map((v, i) => (
          <div key={i} style={{ border: "1px solid #eee", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{v.make} {v.model}</div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{v.years}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

async function WarrantySection({ productId }: { productId: string }) {
  const warranty = await getWarrantyInfo(Number(productId)) as WarrantyInfo;
  return (
    <section style={{ marginTop: 48, padding: 24, background: "#f0faf4", borderRadius: 12 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Warranty</h2>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div><div style={{ fontSize: 13, color: "#999" }}>Duration</div><div style={{ fontWeight: 600 }}>{warranty.duration}</div></div>
        <div><div style={{ fontSize: 13, color: "#999" }}>Coverage</div><div style={{ fontWeight: 600 }}>{warranty.coverage}</div></div>
        <div><div style={{ fontSize: 13, color: "#999" }}>Provider</div><div style={{ fontWeight: 600 }}>{warranty.provider}</div></div>
      </div>
    </section>
  );
}

async function PriceHistorySection({ productId }: { productId: string }) {
  const history = await getPriceHistory(Number(productId)) as PriceHistory[];
  const max = Math.max(...history.map((h) => h.price));
  return (
    <section style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Price History (6 months)</h2>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 80 }}>
        {history.map((h) => (
          <div key={h.month} style={{ textAlign: "center", flex: 1 }}>
            <div style={{ background: "#e63946", borderRadius: 4, height: `${(h.price / max) * 60}px`, marginBottom: 4 }} />
            <div style={{ fontSize: 11, color: "#666" }}>{h.month}</div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>${h.price}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>
      <Link href="/products" style={{ color: "#666", textDecoration: "none", fontSize: 14, display: "inline-block", marginBottom: 24 }}>← Back to Products</Link>
      <Suspense fallback={<Loading />}>
        <ProductDetails id={id} />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <PriceHistorySection productId={id} />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <CompatibleVehiclesSection productId={id} />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <WarrantySection productId={id} />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <ReviewsSection productId={id} />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <RelatedSection productId={id} />
      </Suspense>
    </main>
  );
}
