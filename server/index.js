import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
