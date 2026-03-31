import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Real product images from Unsplash (free, no API key)
const products = [
  { name: "Oil Filter", description: "High-performance oil filter for most petrol engines", price: 12.99, category: "Filters", stock: 150, image_url: "https://images.unsplash.com/photo-1635784063388-a2c6b1f4b1b1?w=400&h=400&fit=crop" },
  { name: "Air Filter", description: "Replacement air filter for improved airflow", price: 18.49, category: "Filters", stock: 120, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { name: "Cabin Air Filter", description: "Keeps interior air clean from dust and pollen", price: 14.99, category: "Filters", stock: 100, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { name: "Fuel Filter", description: "Protects fuel injectors from contaminants", price: 22.99, category: "Filters", stock: 80, image_url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop" },
  { name: "Brake Pads (Front)", description: "Ceramic front brake pads for smooth stopping", price: 39.99, category: "Brakes", stock: 90, image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop" },
  { name: "Brake Pads (Rear)", description: "Ceramic rear brake pads", price: 34.99, category: "Brakes", stock: 85, image_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop" },
  { name: "Brake Disc (Front)", description: "Ventilated front brake disc, 280mm", price: 59.99, category: "Brakes", stock: 60, image_url: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=400&h=400&fit=crop" },
  { name: "Brake Disc (Rear)", description: "Solid rear brake disc, 260mm", price: 49.99, category: "Brakes", stock: 55, image_url: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=400&h=400&fit=crop" },
  { name: "Brake Fluid DOT4", description: "500ml DOT4 brake fluid", price: 8.99, category: "Brakes", stock: 200, image_url: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&h=400&fit=crop" },
  { name: "Spark Plugs (x4)", description: "Iridium spark plugs for better ignition", price: 29.99, category: "Ignition", stock: 110, image_url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop" },
  { name: "Ignition Coil", description: "Direct ignition coil for 4-cylinder engines", price: 44.99, category: "Ignition", stock: 70, image_url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop" },
  { name: "Engine Oil 5W-30 (5L)", description: "Fully synthetic engine oil", price: 34.99, category: "Oils & Fluids", stock: 180, image_url: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&h=400&fit=crop" },
  { name: "Coolant (1L)", description: "Ready-mixed engine coolant, blue", price: 9.99, category: "Oils & Fluids", stock: 160, image_url: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&h=400&fit=crop" },
  { name: "Power Steering Fluid", description: "Universal power steering fluid 500ml", price: 7.49, category: "Oils & Fluids", stock: 140, image_url: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&h=400&fit=crop" },
  { name: "Windshield Washer Fluid (2L)", description: "All-season washer fluid", price: 4.99, category: "Oils & Fluids", stock: 250, image_url: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&h=400&fit=crop" },
  { name: "Timing Belt Kit", description: "Complete timing belt kit with tensioner", price: 89.99, category: "Engine", stock: 40, image_url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop" },
  { name: "Serpentine Belt", description: "Replacement drive belt for alternator and AC", price: 24.99, category: "Engine", stock: 65, image_url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop" },
  { name: "Thermostat", description: "Engine thermostat with gasket, 87°C", price: 19.99, category: "Engine", stock: 75, image_url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop" },
  { name: "Water Pump", description: "OEM-spec water pump with seal", price: 54.99, category: "Engine", stock: 45, image_url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop" },
  { name: "Alternator Belt", description: "V-ribbed alternator belt", price: 16.99, category: "Engine", stock: 90, image_url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop" },
  { name: "Shock Absorber (Front)", description: "Gas-pressure front shock absorber", price: 74.99, category: "Suspension", stock: 50, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { name: "Shock Absorber (Rear)", description: "Gas-pressure rear shock absorber", price: 64.99, category: "Suspension", stock: 50, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { name: "Coil Spring (Front)", description: "Replacement front coil spring", price: 49.99, category: "Suspension", stock: 40, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { name: "Control Arm Bush", description: "Polyurethane front control arm bush", price: 12.99, category: "Suspension", stock: 100, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { name: "Tie Rod End", description: "Outer tie rod end with nut", price: 27.99, category: "Steering", stock: 70, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { name: "Wheel Bearing (Front)", description: "Front wheel bearing hub assembly", price: 69.99, category: "Drivetrain", stock: 55, image_url: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=400&h=400&fit=crop" },
  { name: "CV Axle Shaft", description: "Complete front CV axle with boots", price: 94.99, category: "Drivetrain", stock: 35, image_url: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=400&h=400&fit=crop" },
  { name: "Battery 60Ah", description: "12V 60Ah starter battery", price: 89.99, category: "Electrical", stock: 45, image_url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop" },
  { name: "Headlight Bulb H7 (x2)", description: "55W H7 halogen bulbs", price: 11.99, category: "Electrical", stock: 200, image_url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop" },
  { name: "Wiper Blades (pair)", description: "Flat beam wiper blades 600/400mm", price: 19.99, category: "Exterior", stock: 130, image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
];

async function seed() {
  console.log("Updating products with real image URLs...");
  for (const p of products) {
    const { error } = await supabase
      .from("products")
      .update({ image_url: p.image_url })
      .eq("name", p.name);
    if (error) console.error(`Failed to update ${p.name}:`, error.message);
    else console.log(`Updated: ${p.name}`);
  }
  console.log("Done.");
}

seed();
