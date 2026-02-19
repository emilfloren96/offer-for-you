import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "products.db");

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create the Products table
db.exec(`
  CREATE TABLE IF NOT EXISTS Products (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    category     TEXT    NOT NULL,
    unit         TEXT    NOT NULL,
    cost_price   REAL    NOT NULL,
    sale_price   REAL    NOT NULL,
    last_updated TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// Seed data — only insert if the table is empty
const count = db.prepare("SELECT COUNT(*) AS n FROM Products").get();

if (count.n === 0) {
  const insert = db.prepare(`
    INSERT INTO Products (name, category, unit, cost_price, sale_price)
    VALUES (?, ?, ?, ?, ?)
  `);

  const products = [
    ["Konstruktionsvirke 45x195mm", "Virke", "m", 45, 89],
    ["Skruv 4.2x55mm (200-pack)", "Fästelement", "förpackning", 85, 159],
    ["Mineralull 195mm", "Isolering", "m²", 95, 179],
    ["Gipsskiva 13mm", "Skivor", "st", 65, 119],
    ["Betong C25/30", "Betong", "m³", 950, 1650],
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(...item);
    }
  });

  insertMany(products);
  console.log("Database seeded with 5 products.");
}

export default db;
