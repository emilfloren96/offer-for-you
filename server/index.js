import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./db.js";

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme-dev-secret";

// Middleware
app.use(cors({ origin: '*', allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// Auth middleware
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    req.company = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ------------------------------------
// POST /api/auth/register
// ------------------------------------
app.post("/api/auth/register", async (req, res) => {
  const { companyName, email, password } = req.body;
  if (!companyName || !email || !password) {
    return res.status(400).json({ error: "companyName, email och password krävs." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Lösenordet måste vara minst 6 tecken." });
  }
  const existing = db.prepare("SELECT id FROM Companies WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "E-postadressen är redan registrerad." });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const result = db.prepare(
    "INSERT INTO Companies (company_name, email, password_hash) VALUES (?, ?, ?)"
  ).run(companyName, email, passwordHash);

  const token = jwt.sign(
    { id: result.lastInsertRowid, email, companyName },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.status(201).json({ token, companyName });
});

// ------------------------------------
// POST /api/auth/login
// ------------------------------------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email och password krävs." });
  }
  const company = db.prepare("SELECT * FROM Companies WHERE email = ?").get(email);
  if (!company) {
    return res.status(401).json({ error: "Felaktig e-post eller lösenord." });
  }
  const match = await bcrypt.compare(password, company.password_hash);
  if (!match) {
    return res.status(401).json({ error: "Felaktig e-post eller lösenord." });
  }
  const token = jwt.sign(
    { id: company.id, email: company.email, companyName: company.company_name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ token, companyName: company.company_name });
});

// ------------------------------------
// GET /api/products — Fetch all products
// ------------------------------------
app.get("/api/products", (req, res) => {
  const products = db.prepare("SELECT * FROM Products").all();
  res.json(products);
});

// ------------------------------------
// GET /api/products/search?q=term — Search by name
// ------------------------------------
app.get("/api/products/search", (req, res) => {
  const query = req.query.q;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }

  const products = db
    .prepare("SELECT * FROM Products WHERE name LIKE ?")
    .all(`%${query.trim()}%`);

  res.json(products);
});

// ------------------------------------
// POST /api/calculate — Calculate total cost
// Body: { items: [{ productId: number, quantity: number }] }
// ------------------------------------
app.post("/api/calculate", (req, res) => {
  const { items } = req.body;

  // Validate input
  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: "'items' must be a non-empty array." });
  }

  for (const item of items) {
    if (!Number.isInteger(item.productId) || item.productId < 1) {
      return res
        .status(400)
        .json({ error: `Invalid productId: ${item.productId}` });
    }
    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      return res
        .status(400)
        .json({ error: `Invalid quantity for productId ${item.productId}` });
    }
  }

  // Look up each product and calculate
  const getProduct = db.prepare("SELECT * FROM Products WHERE id = ?");
  const breakdown = [];
  let totalCost = 0;
  let totalSale = 0;

  for (const item of items) {
    const product = getProduct.get(item.productId);

    if (!product) {
      return res
        .status(404)
        .json({ error: `Product not found: id ${item.productId}` });
    }

    const lineCost = product.cost_price * item.quantity;
    const lineSale = product.sale_price * item.quantity;

    breakdown.push({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity: item.quantity,
      unitPrice: product.sale_price,
      lineTotal: lineSale,
    });

    totalCost += lineCost;
    totalSale += lineSale;
  }

  res.json({
    breakdown,
    totalCost: Math.round(totalCost * 100) / 100,
    totalSale: Math.round(totalSale * 100) / 100,
    profit: Math.round((totalSale - totalCost) * 100) / 100,
  });
});

// ------------------------------------
// POST /api/offers — Save a submitted offer
// ------------------------------------
app.post("/api/offers", (req, res) => {
  const { customer, shape, floors, totalPrice, items } = req.body;

  if (!customer?.name || !customer?.email) {
    return res.status(400).json({ error: "customer.name and customer.email are required." });
  }
  if (!shape || !Number.isInteger(floors)) {
    return res.status(400).json({ error: "shape and floors are required." });
  }
  if (typeof totalPrice !== "number") {
    return res.status(400).json({ error: "totalPrice must be a number." });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items must be a non-empty array." });
  }

  const stmt = db.prepare(`
    INSERT INTO Offers
      (customer_name, customer_email, customer_phone, message, shape, floors, total_price, items_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    customer.name,
    customer.email,
    customer.phone ?? "",
    customer.message ?? "",
    shape,
    floors,
    totalPrice,
    JSON.stringify(items)
  );

  res.status(201).json({ id: result.lastInsertRowid });
});

// ------------------------------------
// GET /api/offers — Fetch all offers (company dashboard)
// ------------------------------------
app.get("/api/offers", requireAuth, (req, res) => {
  const offers = db
    .prepare("SELECT * FROM Offers ORDER BY created_at DESC")
    .all();
  res.json(offers);
});

// ------------------------------------
// POST /api/job-requests — Submit a Quick Post job request
// ------------------------------------
app.post("/api/job-requests", (req, res) => {
  const { title, description, category, contactName, contactEmail, contactPhone } = req.body;

  if (!title || !contactName || !contactEmail) {
    return res.status(400).json({ error: "title, contactName och contactEmail krävs." });
  }

  const result = db.prepare(`
    INSERT INTO JobRequests (title, description, category, contact_name, contact_email, contact_phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description ?? "",
    category ?? "other",
    contactName,
    contactEmail,
    contactPhone ?? ""
  );

  res.status(201).json({ id: result.lastInsertRowid });
});

// ------------------------------------
// GET /api/job-requests — Fetch all open job requests (companies only)
// ------------------------------------
app.get("/api/job-requests", requireAuth, (req, res) => {
  const { category } = req.query;

  let query = "SELECT * FROM JobRequests WHERE status = 'open' ORDER BY created_at DESC";
  const params = [];

  if (category && category !== "all") {
    query = "SELECT * FROM JobRequests WHERE status = 'open' AND category = ? ORDER BY created_at DESC";
    params.push(category);
  }

  const jobs = db.prepare(query).all(...params);
  res.json(jobs);
});

// ------------------------------------
// GET /api/professionals — Public directory of companies with profiles
// ------------------------------------
app.get("/api/professionals", (req, res) => {
  const { category, region } = req.query;

  let rows = db.prepare(`
    SELECT
      c.id,
      c.company_name,
      p.region,
      p.categories,
      p.bio,
      p.phone,
      c.email,
      p.score,
      p.verified,
      p.premium
    FROM Companies c
    JOIN CompanyProfiles p ON p.company_id = c.id
    WHERE p.region != '' AND p.bio != ''
    ORDER BY p.premium DESC, p.score DESC
  `).all();

  // Parse categories JSON and filter
  rows = rows.map(r => ({ ...r, categories: JSON.parse(r.categories || '[]') }));

  if (category && category !== 'all') {
    rows = rows.filter(r => r.categories.includes(category));
  }
  if (region && region !== 'all') {
    rows = rows.filter(r => r.region === region);
  }

  res.json(rows);
});

// ------------------------------------
// GET /api/professionals/me — Get own profile (auth required)
// ------------------------------------
app.get("/api/professionals/me", requireAuth, (req, res) => {
  const profile = db.prepare(
    "SELECT * FROM CompanyProfiles WHERE company_id = ?"
  ).get(req.company.id);

  if (!profile) return res.json(null);
  res.json({ ...profile, categories: JSON.parse(profile.categories || '[]') });
});

// ------------------------------------
// POST /api/professionals/profile — Create or update own profile (auth required)
// ------------------------------------
app.post("/api/professionals/profile", requireAuth, (req, res) => {
  const { region, categories, bio, phone } = req.body;

  if (!region || !bio) {
    return res.status(400).json({ error: "region och bio krävs." });
  }

  const categoriesJson = JSON.stringify(Array.isArray(categories) ? categories : []);
  const existing = db.prepare(
    "SELECT id FROM CompanyProfiles WHERE company_id = ?"
  ).get(req.company.id);

  if (existing) {
    db.prepare(`
      UPDATE CompanyProfiles
      SET region = ?, categories = ?, bio = ?, phone = ?, updated_at = datetime('now')
      WHERE company_id = ?
    `).run(region, categoriesJson, bio, phone ?? '', req.company.id);
  } else {
    db.prepare(`
      INSERT INTO CompanyProfiles (company_id, region, categories, bio, phone)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.company.id, region, categoriesJson, bio, phone ?? '');
  }

  res.json({ ok: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
