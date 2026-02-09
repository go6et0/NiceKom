/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString =
  process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is not set.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "HydraMax 5W-30",
    brand: "NiceKom",
    shortDescription: "Synthetic engine oil for modern passenger vehicles.",
    description:
      "Advanced synthetic formula designed for clean starts and extended drain intervals.",
    advantages: [
      "Improves cold-start protection",
      "Reduces deposits and sludge",
      "Stable viscosity under heat",
    ],
    type: "OIL",
    viscosity: "5W-30",
    unit: "LITERS",
    packageSize: 5,
    application: "Passenger cars, light-duty fleets",
    certification: "API SP, ILSAC GF-6A",
    baseOil: "SYNTHETIC",
    operatingTempMin: -30,
    operatingTempMax: 160,
    price: 64.9,
    quantity: 120,
    images: [
      "https://images.unsplash.com/photo-1516697073-419b2bd1e2b5?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    name: "GearGuard 80W-90",
    brand: "NiceKom",
    shortDescription: "Heavy-duty gear oil for industrial transmissions.",
    description:
      "High-pressure additive package for protection of gears under load.",
    advantages: [
      "Excellent anti-wear performance",
      "Reduces noise and vibration",
      "Protects under shock loads",
    ],
    type: "OIL",
    viscosity: "80W-90",
    unit: "LITERS",
    packageSize: 20,
    application: "Industrial gearboxes, axles, drives",
    certification: "API GL-5",
    baseOil: "MINERAL",
    operatingTempMin: -20,
    operatingTempMax: 140,
    price: 189.0,
    quantity: 60,
    images: [
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    name: "TurboShield EP2 Grease",
    brand: "NiceKom",
    shortDescription: "Extreme-pressure grease for bearings and chassis.",
    description:
      "Lithium-based EP grease with strong water resistance and adhesion.",
    advantages: [
      "Excellent water washout resistance",
      "Long-lasting protection",
      "Strong mechanical stability",
    ],
    type: "GREASE",
    viscosity: "NLGI 2",
    unit: "KILOGRAMS",
    packageSize: 18,
    application: "Bearings, chassis, heavy-duty joints",
    certification: "DIN 51502 KP2K-20",
    baseOil: "MINERAL",
    operatingTempMin: -20,
    operatingTempMax: 130,
    price: 210.0,
    quantity: 40,
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    name: "BlueLine Bio Grease",
    brand: "NiceKom",
    shortDescription: "Environment-friendly grease for sensitive sites.",
    description:
      "Biodegradable grease formulated for high load and outdoor use.",
    advantages: [
      "Biodegradable base oils",
      "High load carrying capacity",
      "Resists corrosion and oxidation",
    ],
    type: "GREASE",
    viscosity: "NLGI 1.5",
    unit: "KILOGRAMS",
    packageSize: 5,
    application: "Outdoor equipment, forestry, marine",
    certification: "EU Ecolabel",
    baseOil: "SEMI_SYNTHETIC",
    operatingTempMin: -25,
    operatingTempMax: 120,
    price: 78.0,
    quantity: 75,
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

async function main() {
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log("Products already exist. Seed skipped.");
    return;
  }

  await prisma.product.createMany({ data: products });
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
