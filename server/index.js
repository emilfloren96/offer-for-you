import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  connectDB,
  seedProducts,
  Product,
  Company,
  CompanyProfile,
  Offer,
  JobRequest,
  JobInterest,
  OfferInterest,
} from './db.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme-dev-secret';

// Middleware
app.use(cors({ origin: '*', allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// Auth middleware
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.company = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ------------------------------------
// POST /api/auth/register
// ------------------------------------
app.post('/api/auth/register', async (req, res) => {
  const { companyName, email, password } = req.body;
  if (!companyName || !email || !password) {
    return res.status(400).json({ error: 'companyName, email och password krävs.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Lösenordet måste vara minst 6 tecken.' });
  }
  const existing = await Company.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'E-postadressen är redan registrerad.' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const company = await Company.create({ companyName, email, passwordHash });

  const token = jwt.sign(
    { id: company._id.toString(), email, companyName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.status(201).json({ token, companyName });
});

// ------------------------------------
// POST /api/auth/login
// ------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email och password krävs.' });
  }
  const company = await Company.findOne({ email });
  if (!company) {
    return res.status(401).json({ error: 'Felaktig e-post eller lösenord.' });
  }
  const match = await bcrypt.compare(password, company.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Felaktig e-post eller lösenord.' });
  }
  const token = jwt.sign(
    { id: company._id.toString(), email: company.email, companyName: company.companyName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, companyName: company.companyName });
});

// ------------------------------------
// GET /api/products — Fetch all products
// ------------------------------------
app.get('/api/products', async (_req, res) => {
  const products = await Product.find();
  res.json(products.map(p => ({
    id: p._id,
    name: p.name,
    category: p.category,
    unit: p.unit,
    cost_price: p.costPrice,
    sale_price: p.salePrice,
    last_updated: p.lastUpdated,
  })));
});

// ------------------------------------
// GET /api/products/search?q=term — Search by name
// ------------------------------------
app.get('/api/products/search', async (req, res) => {
  const query = req.query.q;
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }
  const products = await Product.find({ name: { $regex: query.trim(), $options: 'i' } });
  res.json(products.map(p => ({
    id: p._id,
    name: p.name,
    category: p.category,
    unit: p.unit,
    cost_price: p.costPrice,
    sale_price: p.salePrice,
    last_updated: p.lastUpdated,
  })));
});

// ------------------------------------
// POST /api/calculate — Calculate total cost
// Body: { items: [{ productId: string, quantity: number }] }
// ------------------------------------
app.post('/api/calculate', async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "'items' must be a non-empty array." });
  }

  for (const item of items) {
    if (!item.productId) {
      return res.status(400).json({ error: `Invalid productId: ${item.productId}` });
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return res.status(400).json({ error: `Invalid quantity for productId ${item.productId}` });
    }
  }

  const breakdown = [];
  let totalCost = 0;
  let totalSale = 0;

  for (const item of items) {
    let product;
    try {
      product = await Product.findById(item.productId);
    } catch {
      return res.status(400).json({ error: `Invalid productId: ${item.productId}` });
    }
    if (!product) {
      return res.status(404).json({ error: `Product not found: id ${item.productId}` });
    }

    const lineCost = product.costPrice * item.quantity;
    const lineSale = product.salePrice * item.quantity;

    breakdown.push({
      productId: product._id,
      name: product.name,
      unit: product.unit,
      quantity: item.quantity,
      unitPrice: product.salePrice,
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
app.post('/api/offers', async (req, res) => {
  const { customer, shape, floors, totalPrice, items } = req.body;

  if (!customer?.name || !customer?.email) {
    return res.status(400).json({ error: 'customer.name and customer.email are required.' });
  }
  if (!shape || !Number.isInteger(floors)) {
    return res.status(400).json({ error: 'shape and floors are required.' });
  }
  if (typeof totalPrice !== 'number') {
    return res.status(400).json({ error: 'totalPrice must be a number.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array.' });
  }

  const offer = await Offer.create({
    customerName:  customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone ?? '',
    message:       customer.message ?? '',
    shape,
    floors,
    totalPrice,
    itemsJson: JSON.stringify(items),
  });

  res.status(201).json({ id: offer._id });
});

// ------------------------------------
// GET /api/offers — Fetch all offers (company dashboard)
// ------------------------------------
app.get('/api/offers', requireAuth, async (req, res) => {
  const companyId = new mongoose.Types.ObjectId(req.company.id);

  const offers = await Offer.find().sort({ createdAt: -1 }).lean();

  const offerIds = offers.map(o => o._id);

  // Count interests per offer
  const interestCounts = await OfferInterest.aggregate([
    { $match: { offerId: { $in: offerIds } } },
    { $group: { _id: '$offerId', count: { $sum: 1 } } },
  ]);
  const countMap = {};
  for (const ic of interestCounts) countMap[ic._id.toString()] = ic.count;

  // My interests
  const myInterests = await OfferInterest.find({ offerId: { $in: offerIds }, companyId }).lean();
  const mySet = new Set(myInterests.map(mi => mi.offerId.toString()));

  res.json(offers.map(o => ({
    id:             o._id,
    created_at:     o.createdAt,
    customer_name:  o.customerName,
    customer_email: o.customerEmail,
    customer_phone: o.customerPhone,
    message:        o.message,
    shape:          o.shape,
    floors:         o.floors,
    total_price:    o.totalPrice,
    items_json:     o.itemsJson,
    interest_count: countMap[o._id.toString()] ?? 0,
    my_interest:    mySet.has(o._id.toString()) ? 1 : 0,
  })));
});

// ------------------------------------
// POST /api/offers/:id/interest — Express interest in an offer (companies only)
// ------------------------------------
app.post('/api/offers/:id/interest', requireAuth, async (req, res) => {
  const { id } = req.params;

  let offerId;
  try {
    offerId = new mongoose.Types.ObjectId(id);
  } catch {
    return res.status(400).json({ error: 'Invalid offer id' });
  }

  const offer = await Offer.findById(offerId);
  if (!offer) return res.status(404).json({ error: 'Offert hittades inte.' });

  const companyId = new mongoose.Types.ObjectId(req.company.id);
  try {
    await OfferInterest.create({ offerId, companyId });
  } catch (err) {
    if (err.code !== 11000) throw err;
    // Already interested — that's fine
  }

  const interest_count = await OfferInterest.countDocuments({ offerId });
  res.json({ ok: true, interest_count });
});

// ------------------------------------
// POST /api/job-requests — Submit a Quick Post job request
// ------------------------------------
app.post('/api/job-requests', async (req, res) => {
  const { title, description, category, contactName, contactEmail, contactPhone } = req.body;

  if (!title || !contactName || !contactEmail) {
    return res.status(400).json({ error: 'title, contactName och contactEmail krävs.' });
  }

  const job = await JobRequest.create({
    title,
    description:  description ?? '',
    category:     category ?? 'other',
    contactName,
    contactEmail,
    contactPhone: contactPhone ?? '',
  });

  res.status(201).json({ id: job._id });
});

// ------------------------------------
// GET /api/job-requests — Fetch all open job requests (companies only)
// ------------------------------------
app.get('/api/job-requests', requireAuth, async (req, res) => {
  const { category } = req.query;
  const companyId = new mongoose.Types.ObjectId(req.company.id);

  const filter = { status: 'open' };
  if (category && category !== 'all') filter.category = category;

  const jobs = await JobRequest.find(filter).sort({ createdAt: -1 }).lean();
  const jobIds = jobs.map(j => j._id);

  // Count interests per job
  const interestCounts = await JobInterest.aggregate([
    { $match: { jobRequestId: { $in: jobIds } } },
    { $group: { _id: '$jobRequestId', count: { $sum: 1 } } },
  ]);
  const countMap = {};
  for (const ic of interestCounts) countMap[ic._id.toString()] = ic.count;

  // My interests
  const myInterests = await JobInterest.find({ jobRequestId: { $in: jobIds }, companyId }).lean();
  const mySet = new Set(myInterests.map(mi => mi.jobRequestId.toString()));

  res.json(jobs.map(j => ({
    id:             j._id,
    created_at:     j.createdAt,
    title:          j.title,
    description:    j.description,
    category:       j.category,
    contact_name:   j.contactName,
    contact_email:  j.contactEmail,
    contact_phone:  j.contactPhone,
    status:         j.status,
    interest_count: countMap[j._id.toString()] ?? 0,
    my_interest:    mySet.has(j._id.toString()) ? 1 : 0,
  })));
});

// ------------------------------------
// POST /api/job-requests/:id/interest — Express interest in a job (companies only)
// ------------------------------------
app.post('/api/job-requests/:id/interest', requireAuth, async (req, res) => {
  const { id } = req.params;

  let jobRequestId;
  try {
    jobRequestId = new mongoose.Types.ObjectId(id);
  } catch {
    return res.status(400).json({ error: 'Invalid job id' });
  }

  const job = await JobRequest.findOne({ _id: jobRequestId, status: 'open' });
  if (!job) return res.status(404).json({ error: 'Jobbförfrågan hittades inte eller är inte öppen.' });

  const companyId = new mongoose.Types.ObjectId(req.company.id);
  try {
    await JobInterest.create({ jobRequestId, companyId });
  } catch (err) {
    if (err.code !== 11000) throw err;
    // Already interested — that's fine
  }

  const interest_count = await JobInterest.countDocuments({ jobRequestId });
  res.json({ ok: true, interest_count });
});

// ------------------------------------
// GET /api/professionals — Public directory of companies with profiles
// ------------------------------------
app.get('/api/professionals', async (req, res) => {
  const { category, region } = req.query;

  const filter = { region: { $ne: '' }, bio: { $ne: '' } };
  if (region && region !== 'all') filter.region = region;
  if (category && category !== 'all') filter.categories = category;

  const profiles = await CompanyProfile.find(filter)
    .populate('companyId', 'companyName email')
    .sort({ premium: -1, score: -1 })
    .lean();

  res.json(profiles.map(p => ({
    id:         p.companyId._id,
    company:    p.companyId.companyName,
    region:     p.region,
    categories: p.categories,
    bio:        p.bio,
    phone:      p.phone,
    email:      p.companyId.email,
    score:      p.score,
    verified:   p.verified,
    premium:    p.premium,
  })));
});

// ------------------------------------
// GET /api/professionals/me — Get own profile (auth required)
// ------------------------------------
app.get('/api/professionals/me', requireAuth, async (req, res) => {
  const companyId = new mongoose.Types.ObjectId(req.company.id);
  const profile = await CompanyProfile.findOne({ companyId }).lean();
  if (!profile) return res.json(null);
  res.json({
    ...profile,
    categories: profile.categories ?? [],
  });
});

// ------------------------------------
// POST /api/professionals/profile — Create or update own profile (auth required)
// ------------------------------------
app.post('/api/professionals/profile', requireAuth, async (req, res) => {
  const { region, categories, bio, phone } = req.body;

  if (!region || !bio) {
    return res.status(400).json({ error: 'region och bio krävs.' });
  }

  const companyId = new mongoose.Types.ObjectId(req.company.id);
  const cats = Array.isArray(categories) ? categories : [];

  await CompanyProfile.findOneAndUpdate(
    { companyId },
    { $set: { region, categories: cats, bio, phone: phone ?? '' } },
    { upsert: true, new: true }
  );

  res.json({ ok: true });
});

// ------------------------------------
// Start server
// ------------------------------------
const start = async () => {
  await connectDB();
  await seedProducts();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

start();
