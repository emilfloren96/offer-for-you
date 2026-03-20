import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/offer-for-you';

export const connectDB = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');
};

// ─── Product ───────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, required: true },
  unit:        { type: String, required: true },
  costPrice:   { type: Number, required: true },
  salePrice:   { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

export const Product = mongoose.model('Product', productSchema);

export const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      { name: 'Konstruktionsvirke 45x195mm', category: 'Virke',        unit: 'm',           costPrice: 45,   salePrice: 89   },
      { name: 'Skruv 4.2x55mm (200-pack)',   category: 'Fästelement',  unit: 'förpackning', costPrice: 85,   salePrice: 159  },
      { name: 'Mineralull 195mm',            category: 'Isolering',    unit: 'm²',          costPrice: 95,   salePrice: 179  },
      { name: 'Gipsskiva 13mm',              category: 'Skivor',       unit: 'st',          costPrice: 65,   salePrice: 119  },
      { name: 'Betong C25/30',               category: 'Betong',       unit: 'm³',          costPrice: 950,  salePrice: 1650 },
    ]);
    console.log('Database seeded with 5 products.');
  }
};

// ─── Company ───────────────────────────────────────────────────────────────
const companySchema = new mongoose.Schema({
  companyName:  { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt:    { type: Date, default: Date.now },
});

export const Company = mongoose.model('Company', companySchema);

// ─── CompanyProfile ────────────────────────────────────────────────────────
const companyProfileSchema = new mongoose.Schema({
  companyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
  region:     { type: String, default: '' },
  categories: { type: [String], default: [] },
  bio:        { type: String, default: '' },
  phone:      { type: String, default: '' },
  score:      { type: Number, default: 0 },
  verified:   { type: Boolean, default: false },
  premium:    { type: Boolean, default: false },
});

export const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

// ─── Offer ─────────────────────────────────────────────────────────────────
const offerSchema = new mongoose.Schema({
  customerName:  { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  message:       { type: String, default: '' },
  shape:         { type: String, required: true },
  floors:        { type: Number, required: true },
  totalPrice:    { type: Number, required: true },
  itemsJson:     { type: String, required: true },
  createdAt:     { type: Date, default: Date.now },
});

export const Offer = mongoose.model('Offer', offerSchema);

// ─── JobRequest ────────────────────────────────────────────────────────────
const jobRequestSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  category:     { type: String, default: 'other' },
  contactName:  { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, default: '' },
  status:       { type: String, default: 'open' },
  createdAt:    { type: Date, default: Date.now },
});

export const JobRequest = mongoose.model('JobRequest', jobRequestSchema);

// ─── JobInterest ───────────────────────────────────────────────────────────
const jobInterestSchema = new mongoose.Schema({
  jobRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRequest', required: true },
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company',    required: true },
  createdAt:    { type: Date, default: Date.now },
});

jobInterestSchema.index({ jobRequestId: 1, companyId: 1 }, { unique: true });

export const JobInterest = mongoose.model('JobInterest', jobInterestSchema);

// ─── OfferInterest ─────────────────────────────────────────────────────────
const offerInterestSchema = new mongoose.Schema({
  offerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Offer',   required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  createdAt: { type: Date, default: Date.now },
});

offerInterestSchema.index({ offerId: 1, companyId: 1 }, { unique: true });

export const OfferInterest = mongoose.model('OfferInterest', offerInterestSchema);
