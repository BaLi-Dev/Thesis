import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verified Unsplash photo IDs, matched by category
// All use the stable /photo-{id} format
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format`;

const BRAKES    = u("1600712242805-5f78671b24da");  // brake disc on car
const ENGINE    = u("1486262715619-67b85e0b08d3");  // car engine bay
const FLUIDS    = u("1615906655593-ad0386982a0f");  // motor oil bottle
const SPARK     = u("1609630875171-b1321377ee65");  // spark plug close-up
const BATTERY   = u("1609630875171-b1321377ee65");  // electrical/spark
const WIPER     = u("1503376780353-7e6692767b70");  // car windshield/wiper
const WHEEL     = u("1558618666-fcd25c85cd64");     // car wheel/suspension
const BULB      = u("1609630875171-b1321377ee65");  // electrical/spark

const images: Record<string, string> = {
  "Oil Filter":                   FLUIDS,
  "Air Filter":                   ENGINE,
  "Cabin Air Filter":             ENGINE,
  "Fuel Filter":                  FLUIDS,
  "Brake Pads (Front)":           BRAKES,
  "Brake Pads (Rear)":            BRAKES,
  "Brake Disc (Front)":           BRAKES,
  "Brake Disc (Rear)":            BRAKES,
  "Brake Fluid DOT4":             FLUIDS,
  "Spark Plugs (x4)":             SPARK,
  "Ignition Coil":                SPARK,
  "Engine Oil 5W-30 (5L)":        FLUIDS,
  "Coolant (1L)":                 FLUIDS,
  "Power Steering Fluid":         FLUIDS,
  "Windshield Washer Fluid (2L)": FLUIDS,
  "Timing Belt Kit":              ENGINE,
  "Serpentine Belt":              ENGINE,
  "Thermostat":                   ENGINE,
  "Water Pump":                   ENGINE,
  "Alternator Belt":              ENGINE,
  "Shock Absorber (Front)":       WHEEL,
  "Shock Absorber (Rear)":        WHEEL,
  "Coil Spring (Front)":          WHEEL,
  "Control Arm Bush":             WHEEL,
  "Tie Rod End":                  WHEEL,
  "Wheel Bearing (Front)":        WHEEL,
  "CV Axle Shaft":                WHEEL,
  "Battery 60Ah":                 BATTERY,
  "Headlight Bulb H7 (x2)":       BULB,
  "Wiper Blades (pair)":          WIPER,
};

async function reseed() {
  const { data: products, error } = await supabase.from("products").select("id, name");
  if (error) { console.error(error.message); process.exit(1); }

  for (const p of products!) {
    const image_url = images[p.name];
    if (!image_url) { console.warn(`No image for: ${p.name}`); continue; }
    const { error } = await supabase.from("products").update({ image_url }).eq("id", p.id);
    if (error) console.error(`✗ ${p.name}: ${error.message}`);
    else console.log(`✓ ${p.name}`);
  }
  console.log("Done.");
}

reseed();
