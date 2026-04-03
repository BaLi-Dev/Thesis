import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const reviewers = ["Alice M.", "Bob K.", "Carlos R.", "Diana S.", "Erik T.", "Fatima L.", "George P.", "Hannah W."];
const comments = [
  "Fits perfectly, no issues at all.",
  "Great quality for the price.",
  "Installed in 20 minutes, works like OEM.",
  "Solid part, would buy again.",
  "Exactly as described, fast shipping.",
  "Good value, does the job.",
  "High quality, very happy with this.",
  "Works great, easy to install.",
];

async function seedReviews() {
  // Create reviews table if not exists (run this SQL in Supabase dashboard first if needed)
  const { data: products, error } = await supabase.from("products").select("id");
  if (error) { console.error(error.message); process.exit(1); }

  const reviews = products!.flatMap((p) =>
    Array.from({ length: 4 }, (_, i) => ({
      product_id: p.id,
      reviewer: reviewers[i % reviewers.length],
      rating: 3 + (i % 3),
      comment: comments[i % comments.length],
    }))
  );

  const { error: insertError } = await supabase.from("reviews").insert(reviews);
  if (insertError) console.error(insertError.message);
  else console.log(`Inserted ${reviews.length} reviews.`);
}

seedReviews();
