export type PricingUnit = "sqm" | "m" | "st" | "m³";

export interface Material {
  id: string;
  name: string;
  price: number;
  unit: PricingUnit;
  colour: number; // THREE.js hex int
}

export type MaterialCategory =
  | "walls"
  | "windows"
  | "insulation"
  | "roof"
  | "foundation"
  | "doors";

export const MATERIAL_LIBRARY: Record<MaterialCategory, Material[]> = {
  walls: [
    { id: "walls-stud-45x45", name: "Stud 45x45mm",                 price: 20,    unit: "m",   colour: 0xD4A96A },
    { id: "walls-stud-45x70", name: "Stud 45x70mm",                 price: 30,    unit: "m",   colour: 0xC49A5A },
    { id: "walls-ext-panel",  name: "White Exterior Panel 22x120mm", price: 26.95, unit: "m",   colour: 0xF0EDE8 },
    { id: "walls-plaster",    name: "Plaster/Render",                price: 1100,  unit: "sqm", colour: 0xE8E4DC },
  ],
  windows: [
    { id: "windows-aluminum", name: "Aluminum Window", price: 6649, unit: "st", colour: 0xA8B8C8 },
    { id: "windows-wood",     name: "Wood Window",     price: 3785, unit: "st", colour: 0x8B6B4A },
  ],
  insulation: [
    { id: "ins-glasswool-45",  name: "Glass Wool 45mm",       price: 45, unit: "sqm", colour: 0xF5D78E },
    { id: "ins-glasswool-145", name: "Glass Wool 145-195mm",  price: 95, unit: "sqm", colour: 0xF0C840 },
    { id: "ins-eps",           name: "EPS/Cellplast",          price: 80, unit: "sqm", colour: 0xF8F0C8 },
  ],
  roof: [
    { id: "roof-felt",          name: "Roofing Felt",          price: 70,  unit: "sqm", colour: 0x2C2C2C },
    { id: "roof-concrete",      name: "Concrete Tiles",        price: 125, unit: "sqm", colour: 0x8B7355 },
    { id: "roof-metal-budget",  name: "Metal Sheets (Budget)", price: 100, unit: "sqm", colour: 0x7A8A8A },
    { id: "roof-metal-premium", name: "Metal Sheets (Premium)",price: 180, unit: "sqm", colour: 0x4A6878 },
  ],
  foundation: [
    { id: "found-rebar",     name: "Rebar 10mm",          price: 18,   unit: "m",   colour: 0x888888 },
    { id: "found-mesh",      name: "Reinforcement Mesh",   price: 85,   unit: "sqm", colour: 0x999999 },
    { id: "found-eps-edge",  name: "EPS Edge Elements",    price: 120,  unit: "m",   colour: 0xEEEEAA },
    { id: "found-concrete",  name: "Concrete C25/30",      price: 1650, unit: "m³",  colour: 0xBBBBB0 },
  ],
  doors: [
    { id: "doors-steel", name: "Exterior Door (Steel)", price: 4500, unit: "st", colour: 0x4A4A5A },
    { id: "doors-wood",  name: "Interior Door (Wood)",  price: 2200, unit: "st", colour: 0x7B5C3E },
  ],
};

// Maps mesh category string → MaterialCategory
// terrace and interior intentionally omitted — they show contact form only
export const MESH_TO_MATERIAL: Partial<Record<string, MaterialCategory>> = {
  roof:       "roof",
  walls:      "walls",
  windows:    "windows",
  doors:      "doors",
  foundation: "foundation",
};

export interface SelectedMaterial {
  category: string;
  material: Material;
  quantity: number;
  lineTotal: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface OfferLineItem {
  category: string;
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// Derive a sensible quantity from area and unit type
export function deriveQuantity(unit: PricingUnit, area: number): number {
  switch (unit) {
    case "sqm": return Math.round(area * 10) / 10;
    case "m":   return Math.round(Math.sqrt(area) * 2 * 10) / 10;
    case "st":  return 1;
    case "m³":  return Math.round(area * 0.25 * 10) / 10;
    default:    return 1;
  }
}

export const UNIT_LABEL: Record<PricingUnit, string> = {
  sqm: "m²",
  m:   "m",
  st:  "st",
  "m³": "m³",
};

// Swedish labels for mesh categories
export const CATEGORY_LABELS_SV: Record<string, string> = {
  roof:       "Tak",
  walls:      "Väggar",
  windows:    "Fönster",
  doors:      "Dörrar",
  foundation: "Grund",
  terrace:    "Terrass",
  interior:   "Interiör",
};
