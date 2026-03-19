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

// Create the Offers table
db.exec(`
  CREATE TABLE IF NOT EXISTS Offers (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    customer_name  TEXT    NOT NULL,
    customer_email TEXT    NOT NULL,
    customer_phone TEXT    NOT NULL DEFAULT '',
    message        TEXT    NOT NULL DEFAULT '',
    shape          TEXT    NOT NULL,
    floors         INTEGER NOT NULL,
    total_price    REAL    NOT NULL,
    items_json     TEXT    NOT NULL
  )
`);

// Create the Companies table
db.exec(`
  CREATE TABLE IF NOT EXISTS Companies (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    company_name  TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL
  )
`);

// Create the JobRequests table (Quick Post / Open Leads)
db.exec(`
  CREATE TABLE IF NOT EXISTS JobRequests (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    title          TEXT    NOT NULL,
    description    TEXT    NOT NULL DEFAULT '',
    category       TEXT    NOT NULL DEFAULT 'other',
    contact_name   TEXT    NOT NULL,
    contact_email  TEXT    NOT NULL,
    contact_phone  TEXT    NOT NULL DEFAULT '',
    status         TEXT    NOT NULL DEFAULT 'open'
  )
`);

// Create the CompanyProfiles table
db.exec(`
  CREATE TABLE IF NOT EXISTS CompanyProfiles (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id   INTEGER NOT NULL UNIQUE,
    region       TEXT    NOT NULL DEFAULT '',
    categories   TEXT    NOT NULL DEFAULT '[]',
    bio          TEXT    NOT NULL DEFAULT '',
    phone        TEXT    NOT NULL DEFAULT '',
    score        INTEGER NOT NULL DEFAULT 0,
    verified     INTEGER NOT NULL DEFAULT 0,
    premium      INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES Companies(id)
  )
`);

// Create the OfferInterests table (pros express interest in a submitted offer)
db.exec(`
  CREATE TABLE IF NOT EXISTS OfferInterests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    offer_id    INTEGER NOT NULL,
    company_id  INTEGER NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(offer_id, company_id),
    FOREIGN KEY (offer_id)    REFERENCES Offers(id),
    FOREIGN KEY (company_id)  REFERENCES Companies(id)
  )
`);

// Create the JobInterests table (pros express interest in a job request)
db.exec(`
  CREATE TABLE IF NOT EXISTS JobInterests (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    job_request_id  INTEGER NOT NULL,
    company_id      INTEGER NOT NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(job_request_id, company_id),
    FOREIGN KEY (job_request_id) REFERENCES JobRequests(id),
    FOREIGN KEY (company_id)     REFERENCES Companies(id)
  )
`);

export default db;
