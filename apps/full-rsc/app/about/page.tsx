import Spinner from "./Spinner";
const Loading = () => <div style={{ padding: "32px 0" }}><Spinner size={32} /></div>;
import { getTeamMembers, getSiteStats } from "@rsc-study/data";
import { Suspense } from "react";
import type { TeamMember, SiteStats } from "@rsc-study/data";

async function StatsSection() {
  const stats = await getSiteStats() as SiteStats;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
      {[
        { num: stats.totalProducts.toLocaleString(), label: "Parts in stock" },
        { num: stats.totalCustomers.toLocaleString(), label: "Happy customers" },
        { num: stats.totalReviews.toLocaleString(), label: "Reviews" },
        { num: stats.avgRating.toFixed(1) + " ★", label: "Avg rating" },
      ].map((s) => (
        <div key={s.label} style={{ background: "#f5f5f5", borderRadius: 12, padding: "20px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#e63946" }}>{s.num}</div>
          <div style={{ color: "#666", marginTop: 4, fontSize: 13 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

async function TeamSection() {
  const team = await getTeamMembers() as TeamMember[];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {team.map((m) => (
        <div key={m.name} style={{ padding: 16, border: "1px solid #eee", borderRadius: 10 }}>
          <div style={{ fontWeight: 700 }}>{m.name}</div>
          <div style={{ color: "#e63946", fontSize: 13, fontWeight: 600 }}>{m.role}</div>
          <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>Since {m.since}</div>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 32px" }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>About AutoParts</h1>
      <p style={{ color: "#666", fontSize: 18, marginBottom: 32 }}>Your trusted source for quality car parts since 2005.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>Our Story</h2>
          <p style={{ color: "#444", lineHeight: 1.7 }}>AutoParts was founded in 2005 by a team of automotive engineers frustrated by the lack of reliable, affordable parts online. Today we ship to customers across Europe.</p>
        </div>
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>Our Promise</h2>
          <p style={{ color: "#444", lineHeight: 1.7 }}>Every part we sell is OEM-spec or better. If a part doesn't fit, we'll replace it free of charge. Our team is available 7 days a week.</p>
        </div>
      </div>
      <Suspense fallback={<Loading />}>
        <StatsSection />
      </Suspense>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Our Team</h2>
      <Suspense fallback={<Loading />}>
        <TeamSection />
      </Suspense>
    </main>
  );
}
