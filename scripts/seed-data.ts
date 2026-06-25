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

export interface SeedTag {
  name: string
  description: string
}

export interface SeedBrand {
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
  imagePath: string // local image path
}

export interface SeedPage {
  title: string
  template: 'default' | 'contact' | 'about' | 'faq'
  status: 'draft' | 'published'
}

export interface SeedBlogPost {
  title: string
  status: 'draft' | 'published'
  excerpt: string
  imagePath: string
}

export interface SeedNavigationItem {
  label: string
  type: 'custom_url' | 'page' | 'category'
  url?: string
}

export interface SeedNavigation {
  name: string
  location: 'header' | 'footer' | 'sidebar'
  items: SeedNavigationItem[]
}

// ---------------------------------------------------------------------------
// Image Path Helpers
// ---------------------------------------------------------------------------
// Images are stored locally in public/images/ directory
export const productImagePath = (index: number) =>
  `/images/products/saree-${String(index).padStart(2, '0')}.jpg`
export const heroImagePath = (index: number) => `/images/hero/hero-${index}.jpg`
export const blogImagePath = (index: number) =>
  `/images/blogs/blog-${index}.jpg`
export const avatarImagePath = (index: number) =>
  `/images/avatars/avatar-${index}.jpg`

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
  { name: 'Banarasi', description: 'Timeless Banarasi sarees from Varanasi' },
  {
    name: 'Linen',
    description: 'Lightweight linen sarees for summer elegance',
  },
  {
    name: 'Chiffon',
    description: 'Flowing chiffon sarees for graceful drapes',
  },
]

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export const tags: SeedTag[] = [
  { name: 'Handwoven', description: 'Authentic handwoven sarees' },
  { name: 'Zari Work', description: 'Sarees with gold and silver zari' },
  { name: 'Embroidery', description: 'Intricate embroidered designs' },
  { name: 'Block Print', description: 'Traditional block printed patterns' },
  { name: 'Temple Border', description: 'Classic temple border designs' },
  { name: 'Light Weight', description: 'Lightweight and easy to drape' },
  { name: 'Heavy Work', description: 'Richly embellished heavy sarees' },
  { name: 'Pastel', description: 'Soft pastel color palettes' },
  { name: 'Vibrant', description: 'Bright and bold color sarees' },
  { name: 'Eco Friendly', description: 'Sustainable and natural dye sarees' },
]

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------

export const brands: SeedBrand[] = [
  { name: 'Shagya Original', description: 'Our in-house designed sarees' },
  { name: 'Varanasi Weaves', description: 'Authentic Banarasi weavers' },
  { name: 'Kanchipuram Silks', description: 'Traditional South Indian silks' },
  { name: 'Rajasthan Handloom', description: 'Rajasthani handloom artisans' },
  { name: 'Bengal Tant', description: 'Traditional Bengali tant sarees' },
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
  {
    name: 'Festive Special',
    description: 'Stunning sarees for Diwali, weddings, and celebrations',
  },
  {
    name: 'Everyday Elegance',
    description: 'Affordable sarees for daily wear and office',
  },
  {
    name: 'Handloom Heritage',
    description: "Celebrating India's rich handloom weaving traditions",
  },
]

// ---------------------------------------------------------------------------
// Products (20 sarees with realistic data)
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
    imagePath: '/images/products/saree-01.jpg',
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
    imagePath: '/images/products/saree-02.jpg',
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
    imagePath: '/images/products/saree-03.jpg',
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
    imagePath: '/images/products/saree-04.jpg',
  },
  {
    name: 'Chiffon Designer Saree',
    status: 'published',
    fabric: 'chiffon',
    weave: 'maheshwari',
    pattern: 'solid',
    basePrice: 3500,
    description:
      'Contemporary chiffon saree with a modern minimalist aesthetic. Features a delicate Maheshwari border in silver.',
    imagePath: '/images/products/saree-05.jpg',
  },
  {
    name: 'Bandhani Silk Saree',
    status: 'published',
    fabric: 'silk',
    weave: 'bandhani',
    pattern: 'printed',
    basePrice: 8500,
    compareAtPrice: 9500,
    description:
      'Traditional Bandhani tie-dye silk saree from Gujarat. Each dot is hand-tied, creating mesmerizing patterns.',
    imagePath: '/images/products/saree-06.jpg',
  },
  {
    name: 'Patola Double Ikkat',
    status: 'published',
    fabric: 'silk',
    weave: 'patola',
    pattern: 'printed',
    basePrice: 18000,
    compareAtPrice: 22000,
    description:
      'Exquisite Patan Patola saree with double ikkat weaving. Each warp and weft thread is individually dyed before weaving.',
    imagePath: '/images/products/saree-07.jpg',
  },
  {
    name: 'Kalamkari Art Saree',
    status: 'published',
    fabric: 'cotton',
    weave: 'kalamkari',
    pattern: 'painted',
    basePrice: 5500,
    description:
      'Hand-painted Kalamkari saree depicting mythological stories and motifs. Each piece is a work of art.',
    imagePath: '/images/products/saree-08.jpg',
  },
  {
    name: 'Paithani Silk Saree',
    status: 'published',
    fabric: 'silk',
    weave: 'paithani',
    pattern: 'embroidered',
    basePrice: 15000,
    description:
      'Royal Paithani saree with distinctive peacock motifs and a richly woven pallu. A Maharashtrian heirloom.',
    imagePath: '/images/products/saree-09.jpg',
  },
  {
    name: 'Linen Office Wear',
    status: 'published',
    fabric: 'linen',
    weave: 'tant',
    pattern: 'solid',
    basePrice: 2200,
    description:
      'Crisp linen saree in muted tones perfect for professional settings. Easy to drape and maintain throughout the day.',
    imagePath: '/images/products/saree-10.jpg',
  },
  {
    name: 'Velvet Party Saree',
    status: 'published',
    fabric: 'velvet',
    weave: 'banarasi',
    pattern: 'embellished',
    basePrice: 9500,
    compareAtPrice: 12000,
    description:
      'Luxurious velvet saree with gota patti work. Rich jewel tones make it ideal for winter weddings and receptions.',
    imagePath: '/images/products/saree-11.jpg',
  },
  {
    name: 'Net Embroidered Saree',
    status: 'published',
    fabric: 'net',
    weave: 'chanderi',
    pattern: 'embroidered',
    basePrice: 7500,
    description:
      'Sheer net saree with heavy embroidery and sequin work. Comes with a stitched blouse piece for the complete look.',
    imagePath: '/images/products/saree-12.jpg',
  },
  {
    name: 'Crepe Floral Print',
    status: 'published',
    fabric: 'crepe',
    weave: 'ikkat',
    pattern: 'printed',
    basePrice: 3200,
    description:
      'Soft crepe saree with vibrant floral digital prints. The crinkled texture adds volume and grace to the drape.',
    imagePath: '/images/products/saree-13.jpg',
  },
  {
    name: 'Maheshwari Cotton Silk',
    status: 'published',
    fabric: 'blend',
    weave: 'maheshwari',
    pattern: 'solid',
    basePrice: 2800,
    description:
      'Cotton silk blend Maheshwari saree with the signature reversible border. Lightweight and elegant for summer.',
    imagePath: '/images/products/saree-14.jpg',
  },
  {
    name: 'Baluchari Story Saree',
    status: 'published',
    fabric: 'silk',
    weave: 'baluchari',
    pattern: 'embroidered',
    basePrice: 16000,
    compareAtPrice: 19000,
    description:
      'Narrative Baluchari saree depicting scenes from the Ramayana on the pallu. A museum-worthy piece of Bengal heritage.',
    imagePath: '/images/products/saree-15.jpg',
  },
  {
    name: 'Tant Cotton Saree',
    status: 'published',
    fabric: 'cotton',
    weave: 'tant',
    pattern: 'printed',
    basePrice: 1500,
    description:
      'Classic Bengali tant saree in crisp cotton with a thick border and traditional pallu patterns.',
    imagePath: '/images/products/saree-16.jpg',
  },
  {
    name: 'Organza Embroidered Saree',
    status: 'published',
    fabric: 'chiffon',
    weave: 'ikkat',
    pattern: 'embroidered',
    basePrice: 11000,
    description:
      'Sheer organza saree with delicate floral embroidery. Perfect for cocktail parties and summer weddings.',
    imagePath: '/images/products/saree-17.jpg',
  },
  {
    name: 'Khadi Handspun Saree',
    status: 'published',
    fabric: 'cotton',
    weave: 'tant',
    pattern: 'solid',
    basePrice: 3500,
    description:
      'Handspun khadi cotton saree in natural earth tones. Each thread tells a story of sustainable craftsmanship.',
    imagePath: '/images/products/saree-18.jpg',
  },
  {
    name: 'Chanderi Silk Zari',
    status: 'published',
    fabric: 'blend',
    weave: 'chanderi',
    pattern: 'embroidered',
    basePrice: 6500,
    compareAtPrice: 7500,
    description:
      'Ethereal Chanderi saree with delicate gold zari butis sprinkled across the body. Light as a feather.',
    imagePath: '/images/products/saree-19.jpg',
  },
  {
    name: 'Ikat Geometric Saree',
    status: 'published',
    fabric: 'cotton',
    weave: 'ikkat',
    pattern: 'printed',
    basePrice: 4200,
    description:
      'Bold geometric Ikat saree in striking color combinations. The precision of the dyeing technique is unmatched.',
    imagePath: '/images/products/saree-20.jpg',
  },
]

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export const pages: SeedPage[] = [
  { title: 'Home', template: 'default', status: 'published' },
  { title: 'About Us', template: 'about', status: 'published' },
  { title: 'Contact Us', template: 'contact', status: 'published' },
  { title: 'FAQ', template: 'faq', status: 'published' },
  { title: 'Shipping & Returns', template: 'default', status: 'published' },
  { title: 'Privacy Policy', template: 'default', status: 'published' },
]

// ---------------------------------------------------------------------------
// Blog Posts
// ---------------------------------------------------------------------------

export const blogPosts: SeedBlogPost[] = [
  {
    title: 'The Art of Banarasi Weaving: A 500-Year Legacy',
    status: 'published',
    excerpt:
      'Discover the intricate craftsmanship behind every Banarasi saree, from the silk farms to the handlooms of Varanasi.',
    imagePath: '/images/blogs/blog-1.jpg',
  },
  {
    title: 'How to Choose the Perfect Bridal Saree',
    status: 'published',
    excerpt:
      'A comprehensive guide to selecting your dream bridal saree — fabric, color, weave, and styling tips for the modern bride.',
    imagePath: '/images/blogs/blog-2.jpg',
  },
  {
    title: 'Sustainable Fashion: The Rise of Handloom Sarees',
    status: 'published',
    excerpt:
      'Why handloom sarees are the sustainable fashion choice of 2024. Supporting artisans while looking elegant.',
    imagePath: '/images/blogs/blog-3.jpg',
  },
  {
    title: 'Saree Care Guide: Keeping Your Silks Pristine',
    status: 'published',
    excerpt:
      'Expert tips on storing, cleaning, and maintaining your precious silk and handloom sarees for generations.',
    imagePath: '/images/blogs/blog-4.jpg',
  },
  {
    title: "India's Weaving Traditions: A Regional Journey",
    status: 'published',
    excerpt:
      'From Kanchipuram to Paithan, explore the diverse weaving traditions that make Indian sarees unique.',
    imagePath: '/images/blogs/blog-5.jpg',
  },
]

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const navigations: SeedNavigation[] = [
  {
    name: 'Header Menu',
    location: 'header',
    items: [
      { label: 'Home', type: 'custom_url', url: '/' },
      { label: 'Shop', type: 'custom_url', url: '/products' },
      {
        label: 'Silk Sarees',
        type: 'custom_url',
        url: '/products?fabric=silk',
      },
      {
        label: 'Cotton Sarees',
        type: 'custom_url',
        url: '/products?fabric=cotton',
      },
      {
        label: 'Bridal',
        type: 'custom_url',
        url: '/products?weave=kanchipuram',
      },
      { label: 'Blog', type: 'custom_url', url: '/blog' },
      { label: 'About', type: 'custom_url', url: '/about' },
      { label: 'Contact', type: 'custom_url', url: '/contact' },
    ],
  },
  {
    name: 'Footer Menu',
    location: 'footer',
    items: [
      { label: 'About Us', type: 'custom_url', url: '/about' },
      { label: 'Contact', type: 'custom_url', url: '/contact' },
      { label: 'FAQ', type: 'custom_url', url: '/faq' },
      { label: 'Shipping & Returns', type: 'custom_url', url: '/shipping' },
      { label: 'Privacy Policy', type: 'custom_url', url: '/privacy' },
      {
        label: 'Instagram',
        type: 'custom_url',
        url: 'https://instagram.com/shagya',
      },
      {
        label: 'Facebook',
        type: 'custom_url',
        url: 'https://facebook.com/shagya',
      },
    ],
  },
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
    'We offer free shipping on all orders above ₹5,000. Standard delivery takes 5-7 business days. Express delivery is available for an additional fee.',
  returnPolicy:
    'Returns are accepted within 15 days of delivery. Items must be in original condition with tags attached. Custom-stitched blouses are not eligible for returns.',
  gstPercent: 5,
  currency: 'INR',
}
