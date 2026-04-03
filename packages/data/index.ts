export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image_url: string;
};

export type Review = {
  id: number;
  product_id: number;
  reviewer: string;
  rating: number;
  comment: string;
};

export type SellerInfo = {
  name: string;
  rating: number;
  sales: number;
  location: string;
};

export type StockStatus = {
  inStock: boolean;
  quantity: number;
  warehouse: string;
  estimatedDelivery: string;
};

export type PriceHistory = {
  month: string;
  price: number;
};

const PLACEHOLDER = "https://placehold.co/600x600";

export const products: Product[] = [
  { id: 1,  name: "Oil Filter",                   price: 8.99,   category: "Filters",     description: "High-quality oil filter compatible with most petrol and diesel engines. Removes contaminants and extends engine life.", image_url: PLACEHOLDER },
  { id: 2,  name: "Air Filter",                   price: 12.49,  category: "Filters",     description: "Performance air filter for improved airflow and engine efficiency. Easy drop-in replacement.", image_url: PLACEHOLDER },
  { id: 3,  name: "Cabin Air Filter",             price: 9.99,   category: "Filters",     description: "Keeps the air inside your car clean by filtering dust, pollen, and pollutants.", image_url: PLACEHOLDER },
  { id: 4,  name: "Fuel Filter",                  price: 14.99,  category: "Filters",     description: "Protects your fuel injectors by removing dirt and debris from the fuel supply.", image_url: PLACEHOLDER },
  { id: 5,  name: "Brake Pads (Front)",           price: 29.99,  category: "Brakes",      description: "OEM-spec front brake pads with low dust formula. Excellent stopping power and long service life.", image_url: PLACEHOLDER },
  { id: 6,  name: "Brake Pads (Rear)",            price: 24.99,  category: "Brakes",      description: "Rear brake pads designed for quiet operation and consistent performance in all conditions.", image_url: PLACEHOLDER },
  { id: 7,  name: "Brake Disc (Front)",           price: 44.99,  category: "Brakes",      description: "Vented front brake disc for superior heat dissipation. Direct OEM replacement.", image_url: PLACEHOLDER },
  { id: 8,  name: "Brake Disc (Rear)",            price: 39.99,  category: "Brakes",      description: "Solid rear brake disc, precision machined for perfect balance and smooth braking.", image_url: PLACEHOLDER },
  { id: 9,  name: "Brake Fluid DOT4",             price: 7.49,   category: "Brakes",      description: "High-performance DOT4 brake fluid with a high boiling point for fade-free braking.", image_url: PLACEHOLDER },
  { id: 10, name: "Spark Plugs (x4)",             price: 18.99,  category: "Ignition",    description: "Iridium-tipped spark plugs for reliable ignition and improved fuel economy. Pack of 4.", image_url: PLACEHOLDER },
  { id: 11, name: "Ignition Coil",                price: 34.99,  category: "Ignition",    description: "High-output ignition coil for strong, consistent spark. Resolves misfires and rough idle.", image_url: PLACEHOLDER },
  { id: 12, name: "Engine Oil 5W-30 (5L)",        price: 27.99,  category: "Fluids",      description: "Fully synthetic 5W-30 engine oil. Provides excellent protection in all temperatures.", image_url: PLACEHOLDER },
  { id: 13, name: "Coolant (1L)",                 price: 6.99,   category: "Fluids",      description: "Long-life coolant concentrate. Protects against frost, overheating, and corrosion.", image_url: PLACEHOLDER },
  { id: 14, name: "Power Steering Fluid",         price: 8.49,   category: "Fluids",      description: "Universal power steering fluid compatible with most hydraulic steering systems.", image_url: PLACEHOLDER },
  { id: 15, name: "Windshield Washer Fluid (2L)", price: 4.99,   category: "Fluids",      description: "All-season washer fluid with anti-freeze formula. Keeps your windscreen clear.", image_url: PLACEHOLDER },
  { id: 16, name: "Timing Belt Kit",              price: 59.99,  category: "Engine",      description: "Complete timing belt kit including belt, tensioner, and idler pulley. OEM quality.", image_url: PLACEHOLDER },
  { id: 17, name: "Serpentine Belt",              price: 22.99,  category: "Engine",      description: "Heavy-duty serpentine belt for reliable drive of alternator, AC, and power steering.", image_url: PLACEHOLDER },
  { id: 18, name: "Thermostat",                   price: 16.99,  category: "Engine",      description: "Precision thermostat to maintain optimal engine operating temperature.", image_url: PLACEHOLDER },
  { id: 19, name: "Water Pump",                   price: 48.99,  category: "Engine",      description: "OEM-replacement water pump for reliable coolant circulation and engine cooling.", image_url: PLACEHOLDER },
  { id: 20, name: "Alternator Belt",              price: 14.49,  category: "Engine",      description: "Durable alternator belt for consistent electrical charging. Easy to install.", image_url: PLACEHOLDER },
  { id: 21, name: "Shock Absorber (Front)",       price: 64.99,  category: "Suspension",  description: "Gas-pressurised front shock absorber for a smooth, controlled ride.", image_url: PLACEHOLDER },
  { id: 22, name: "Shock Absorber (Rear)",        price: 54.99,  category: "Suspension",  description: "Rear shock absorber with twin-tube design for comfort and stability.", image_url: PLACEHOLDER },
  { id: 23, name: "Coil Spring (Front)",          price: 42.99,  category: "Suspension",  description: "High-tensile front coil spring. Restores ride height and handling precision.", image_url: PLACEHOLDER },
  { id: 24, name: "Control Arm Bush",             price: 12.99,  category: "Suspension",  description: "Polyurethane control arm bush for improved handling and reduced noise.", image_url: PLACEHOLDER },
  { id: 25, name: "Tie Rod End",                  price: 19.99,  category: "Suspension",  description: "Heavy-duty tie rod end for precise steering and reduced play.", image_url: PLACEHOLDER },
  { id: 26, name: "Wheel Bearing (Front)",        price: 34.99,  category: "Suspension",  description: "Sealed front wheel bearing for smooth, quiet rotation and long service life.", image_url: PLACEHOLDER },
  { id: 27, name: "CV Axle Shaft",                price: 79.99,  category: "Suspension",  description: "Complete CV axle shaft assembly. Eliminates clicking and vibration on acceleration.", image_url: PLACEHOLDER },
  { id: 28, name: "Battery 60Ah",                 price: 89.99,  category: "Electrical",  description: "Maintenance-free 60Ah car battery. Reliable cold-start performance.", image_url: PLACEHOLDER },
  { id: 29, name: "Headlight Bulb H7 (x2)",       price: 11.99,  category: "Electrical",  description: "Long-life H7 halogen bulbs with 30% more light output. Pack of 2.", image_url: PLACEHOLDER },
  { id: 30, name: "Wiper Blades (pair)",          price: 16.99,  category: "Exterior",    description: "Flat-blade wiper set for streak-free visibility in rain and snow. Universal fit.", image_url: PLACEHOLDER },
];

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

export const reviews: Review[] = products.flatMap((p) =>
  Array.from({ length: 4 }, (_, i) => ({
    id: (p.id - 1) * 4 + i + 1,
    product_id: p.id,
    reviewer: reviewers[i % reviewers.length],
    rating: 3 + (i % 3),
    comment: comments[i % comments.length],
  }))
);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const DELAY = 300;

export async function getProduct(id: number): Promise<Product | null> {
  await delay(DELAY);
  return products.find((p) => p.id === id) ?? null;
}

export async function getRelated(category: string, excludeId: number): Promise<Product[]> {
  await delay(DELAY);
  return products.filter((p) => p.category === category && p.id !== excludeId).slice(0, 3);
}

export async function getReviews(productId: number): Promise<Review[]> {
  await delay(DELAY);
  return reviews.filter((r) => r.product_id === productId);
}

export async function getSellerInfo(productId: number): Promise<SellerInfo> {
  await delay(DELAY);
  const sellers = ["AutoParts EU", "SpeedShop", "MechDirect", "CarBits Pro"];
  const locations = ["Berlin, DE", "Amsterdam, NL", "Paris, FR", "Warsaw, PL"];
  return {
    name: sellers[productId % sellers.length],
    rating: 4 + (productId % 10) / 10,
    sales: 1000 + productId * 37,
    location: locations[productId % locations.length],
  };
}

export async function getStockStatus(productId: number): Promise<StockStatus> {
  await delay(DELAY);
  const warehouses = ["Berlin", "Rotterdam", "Lyon", "Gdansk"];
  return {
    inStock: productId % 5 !== 0,
    quantity: (productId * 13) % 50 + 1,
    warehouse: warehouses[productId % warehouses.length],
    estimatedDelivery: productId % 5 === 0 ? "5-7 business days" : "1-2 business days",
  };
}

export async function getPriceHistory(productId: number): Promise<PriceHistory[]> {
  await delay(DELAY);
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const base = products.find((p) => p.id === productId)?.price ?? 20;
  return months.map((month, i) => ({
    month,
    price: parseFloat((base * (0.9 + (i + productId) % 5 * 0.05)).toFixed(2)),
  }));
}
