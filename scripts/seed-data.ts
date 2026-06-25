// =============================================================================
// Shagya — Seed Data (Shared Data Structures)
// =============================================================================
// This file is kept lightweight — no Payload imports — so tests can import
// the data structures without loading the full config.
// =============================================================================

export interface SeedCategory {
  name: string
  description: string
}

export interface SeedCollection {
  name: string
  description: string
}

export interface SeedProduct {
  name: string
  status: 'draft' | 'published' | 'archived'
  fabric: string
  weave: string
  pattern: string
  basePrice: number
  compareAtPrice?: number
  description: string
}

export interface SeedPage {
  title: string
  template: 'default' | 'contact' | 'about' | 'faq'
  status: 'draft' | 'published'
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const adminUser = {
  email: 'admin@shagya.com',
  password: 'admin123',
  name: 'Admin',
  role: 'super-admin' as const,
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories: SeedCategory[] = [
  {
    name: 'Silk',
    description:
      'Luxurious silk sarees crafted with traditional Indian weaving techniques',
  },
  {
    name: 'Cotton',
    description:
      'Breathable cotton sarees perfect for daily wear and casual occasions',
  },
  {
    name: 'Bridal',
    description:
      'Exquisite bridal sarees with intricate embroidery and embellishments',
  },
  {
    name: 'Festive',
    description:
      'Vibrant festive sarees for celebrations, festivals, and special gatherings',
  },
  {
    name: 'Casual',
    description: 'Comfortable everyday sarees that blend style with simplicity',
  },
  {
    name: 'Office Wear',
    description:
      'Elegant sarees designed for professional environments and workplace style',
  },
  {
    name: 'Party Wear',
    description:
      'Glamorous sarees that make a statement at evening events and parties',
  },
  {
    name: 'Handloom',
    description:
      "Authentic handwoven sarees that celebrate India's rich textile heritage",
  },
  {
    name: 'Designer',
    description:
      'Contemporary designer sarees with modern silhouettes and unique patterns',
  },
  {
    name: 'Banarasi',
    description:
      'Timeless Banarasi sarees woven with gold and silver zari from Varanasi',
  },
]

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export const collections: SeedCollection[] = [
  {
    name: 'Summer Collection',
    description: 'Light, airy sarees designed for the warm summer months',
  },
  {
    name: 'Bridal Edit',
    description:
      'A curated selection of our finest bridal sarees for the modern bride',
  },
]

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const products: SeedProduct[] = [
  {
    name: 'Banarasi Silk Saree',
    status: 'published',
    fabric: 'silk',
    weave: 'banarasi',
    pattern: 'embroidered',
    basePrice: 12500,
    compareAtPrice: 15000,
    description:
      'Handwoven Banarasi silk saree with intricate gold zari work. Features a rich pallu with traditional motifs and a contrasting border.',
  },
  {
    name: 'Kanchipuram Bridal Saree',
    status: 'published',
    fabric: 'silk',
    weave: 'kanchipuram',
    pattern: 'embroidered',
    basePrice: 22000,
    compareAtPrice: 28000,
    description:
      'Stunning Kanchipuram silk bridal saree with real zari border. The rich red body is adorned with traditional temple motifs.',
  },
  {
    name: 'Cotton Linen Daily Wear',
    status: 'published',
    fabric: 'cotton',
    weave: 'tant',
    pattern: 'printed',
    basePrice: 1800,
    description:
      'Soft and breathable cotton-linen blend saree perfect for everyday elegance. Features subtle block prints in natural dyes.',
  },
  {
    name: 'Georgette Party Saree',
    status: 'published',
    fabric: 'georgette',
    weave: 'chanderi',
    pattern: 'embellished',
    basePrice: 4500,
    compareAtPrice: 5500,
    description:
      'Flowing georgette saree with sequin embellishments. The lightweight drape makes it ideal for evening occasions.',
  },
  {
    name: 'Chiffon Designer Saree',
    status: 'draft',
    fabric: 'chiffon',
    weave: 'maheshwari',
    pattern: 'solid',
    basePrice: 3500,
    description:
      'Contemporary chiffon saree with a modern minimalist aesthetic. Features a delicate Maheshwari border in silver.',
  },
]

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export const pages: SeedPage[] = [
  { title: 'Home', template: 'default', status: 'published' },
  { title: 'About', template: 'about', status: 'published' },
  { title: 'Contact', template: 'contact', status: 'published' },
  { title: 'FAQ', template: 'faq', status: 'published' },
]

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------

export const siteSettingsData = {
  siteName: 'Shagya',
  tagline: 'Timeless Indian Sarees, Crafted with Love',
  contactEmail: 'hello@shagya.com',
  contactPhone: '+91 9876543210',
  address: "123 Weaver's Lane\nVaranasi, Uttar Pradesh 221001\nIndia",
  instagramUrl: 'https://instagram.com/shagya',
  facebookUrl: 'https://facebook.com/shagya',
  youtubeUrl: 'https://youtube.com/@shagya',
  pinterestUrl: 'https://pinterest.com/shagya',
  shippingPolicy:
    'We offer free shipping on all orders above ₹5,000. Standard delivery takes 5–7 business days. Express delivery is available for an additional fee.',
  returnPolicy:
    'Returns are accepted within 15 days of delivery. Items must be in original condition with tags attached. Custom-stitched blouses are not eligible for returns.',
  gstPercent: 5,
  currency: 'INR',
}
