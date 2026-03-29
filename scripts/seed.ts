import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const products = [
  { name: "Oil Filter", description: "High-performance oil filter for most petrol engines", price: 12.99, category: "Filters", stock: 150 },
  { name: "Air Filter", description: "Replacement air filter for improved airflow", price: 18.49, category: "Filters", stock: 120 },
  { name: "Cabin Air Filter", description: "Keeps interior air clean from dust and pollen", price: 14.99, category: "Filters", stock: 100 },
  { name: "Fuel Filter", description: "Protects fuel injectors from contaminants", price: 22.99, category: "Filters", stock: 80 },
  { name: "Brake Pads (Front)", description: "Ceramic front brake pads for smooth stopping", price: 39.99, category: "Brakes", stock: 90 },
  { name: "Brake Pads (Rear)", description: "Ceramic rear brake pads", price: 34.99, category: "Brakes", stock: 85 },
  { name: "Brake Disc (Front)", description: "Ventilated front brake disc, 280mm", price: 59.99, category: "Brakes", stock: 60 },
  { name: "Brake Disc (Rear)", description: "Solid rear brake disc, 260mm", price: 49.99, category: "Brakes", stock: 55 },
  { name: "Brake Fluid DOT4", description: "500ml DOT4 brake fluid", price: 8.99, category: "Brakes", stock: 200 },
  { name: "Spark Plugs (x4)", description: "Iridium spark plugs for better ignition", price: 29.99, category: "Ignition", stock: 110 },
  { name: "Ignition Coil", description: "Direct ignition coil for 4-cylinder engines", price: 44.99, category: "Ignition", stock: 70 },
  { name: "Engine Oil 5W-30 (5L)", description: "Fully synthetic engine oil", price: 34.99, category: "Oils & Fluids", stock: 180 },
  { name: "Coolant (1L)", description: "Ready-mixed engine coolant, blue", price: 9.99, category: "Oils & Fluids", stock: 160 },
  { name: "Power Steering Fluid", description: "Universal power steering fluid 500ml", price: 7.49, category: "Oils & Fluids", stock: 140 },
  { name: "Windshield Washer Fluid (2L)", description: "All-season washer fluid", price: 4.99, category: "Oils & Fluids", stock: 250 },
  { name: "Timing Belt Kit", description: "Complete timing belt kit with tensioner", price: 89.99, category: "Engine", stock: 40 },
  { name: "Serpentine Belt", description: "Replacement drive belt for alternator and AC", price: 24.99, category: "Engine", stock: 65 },
  { name: "Thermostat", description: "Engine thermostat with gasket, 87°C", price: 19.99, category: "Engine", stock: 75 },
  { name: "Water Pump", description: "OEM-spec water pump with seal", price: 54.99, category: "Engine", stock: 45 },
  { name: "Alternator Belt", description: "V-ribbed alternator belt", price: 16.99, category: "Engine", stock: 90 },
  { name: "Shock Absorber (Front)", description: "Gas-pressure front shock absorber", price: 74.99, category: "Suspension", stock: 50 },
  { name: "Shock Absorber (Rear)", description: "Gas-pressure rear shock absorber", price: 64.99, category: "Suspension", stock: 50 },
  { name: "Coil Spring (Front)", description: "Replacement front coil spring", price: 49.99, category: "Suspension", stock: 40 },
  { name: "Control Arm Bush", description: "Polyurethane front control arm bush", price: 12.99, category: "Suspension", stock: 100 },
  { name: "Tie Rod End", description: "Outer tie rod end with nut", price: 27.99, category: "Steering", stock: 70 },
  { name: "Wheel Bearing (Front)", description: "Front wheel bearing hub assembly", price: 69.99, category: "Drivetrain", stock: 55 },
  { name: "CV Axle Shaft", description: "Complete front CV axle with boots", price: 94.99, category: "Drivetrain", stock: 35 },
  { name: "Battery 60Ah", description: "12V 60Ah starter battery", price: 89.99, category: "Electrical", stock: 45 },
  { name: "Headlight Bulb H7 (x2)", description: "55W H7 halogen bulbs", price: 11.99, category: "Electrical", stock: 200 },
  { name: "Wiper Blades (pair)", description: "Flat beam wiper blades 600/400mm", price: 19.99, category: "Exterior", stock: 130 },
];

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function uploadPlaceholder(name: string): Promise<string> {
  const filename = `${slug(name)}.png`;
  const url = `https://placehold.co/400x400/1a1a2e/ffffff/png?text=${encodeURIComponent(name)}`;

  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());

  const { error } = await supabase.storage
    .from("products")
    .upload(filename, buffer, { contentType: "image/png", upsert: true });

  if (error) throw new Error(`Upload failed for ${name}: ${error.message}`);

  const { data } = supabase.storage.from("products").getPublicUrl(filename);
  return data.publicUrl;
}

async function seed() {
  console.log("Uploading images...");
  const withImages = await Promise.all(
    products.map(async (p) => ({
      ...p,
      image_url: await uploadPlaceholder(p.name),
    }))
  );

  console.log("Inserting products...");
  const { error } = await supabase.from("products").insert(withImages);
  if (error) {
    console.error("Seed failed:", error.message);
  } else {
    console.log(`Seeded ${withImages.length} products with images.`);
  }
}

seed();
