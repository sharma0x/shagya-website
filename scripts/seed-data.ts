// =============================================================================
// Shayga — Seed Data (Shared Data Structures)
// =============================================================================
// This file is kept lightweight — no Payload imports — so tests can import
// the data structures without loading the full config.
// =============================================================================

export interface SeedCategory {
  name: string
  description: string
  imagePath: string
}

export interface SeedCollection {
  name: string
  description: string
  imagePath: string
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
  blouseType: string
  palluDetails: string
  borderType: string
  weavePattern: string
  occasion: string
  gstPercent: number
  shippingPrice: number
  imagePath: string
  length: number
  trackQuantity: boolean
  quantity: number
  lowStockThreshold: number
}

// ---------------------------------------------------------------------------
// Page Content Blocks
// ---------------------------------------------------------------------------

export type SeedTextImageBlock = {
  blockType: 'textImage'
  heading: string
  body: string // plain text, converted to Lexical in seed.ts
  imagePosition?: 'left' | 'right'
  imagePath?: string
}

export type SeedFeatureGridBlock = {
  blockType: 'featureGrid'
  heading: string
  features: { title: string; description: string }[]
}

export type SeedFaqBlock = {
  blockType: 'faq'
  heading: string
  questions: { question: string; answer: string }[]
}

export type SeedCtaBlock = {
  blockType: 'cta'
  heading: string
  body?: string
  buttonText?: string
  buttonLink?: string
}

export type SeedTestimonialsBlock = {
  blockType: 'testimonials'
  heading: string
  items: { name: string; role: string; quote: string }[]
}

export type SeedBlock =
  | SeedTextImageBlock
  | SeedFeatureGridBlock
  | SeedFaqBlock
  | SeedCtaBlock
  | SeedTestimonialsBlock

export interface SeedPage {
  title: string
  slug: string
  template: 'default' | 'contact' | 'about' | 'faq'
  status: 'draft' | 'published'
  heroSubheading: string // used for metaDescription
  blocks: SeedBlock[]
}

export interface SeedBlogPost {
  title: string
  status: 'draft' | 'published'
  excerpt: string
  body: string
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
  email: 'admin@shayga.com',
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
    imagePath: '/images/products/saree-01.jpg',
  },
  {
    name: 'Cotton',
    description:
      'Breathable cotton sarees perfect for daily wear and casual occasions',
    imagePath: '/images/products/saree-03.jpg',
  },
  {
    name: 'Bridal',
    description:
      'Exquisite bridal sarees with intricate embroidery and embellishments',
    imagePath: '/images/products/saree-02.jpg',
  },
  {
    name: 'Festive',
    description:
      'Vibrant festive sarees for celebrations, festivals, and special gatherings',
    imagePath: '/images/products/saree-04.jpg',
  },
  {
    name: 'Casual',
    description: 'Comfortable everyday sarees that blend style with simplicity',
    imagePath: '/images/products/saree-09.jpg',
  },
  {
    name: 'Office Wear',
    description:
      'Elegant sarees designed for professional environments and workplace style',
    imagePath: '/images/products/saree-05.jpg',
  },
  {
    name: 'Party Wear',
    description:
      'Glamorous sarees that make a statement at evening events and parties',
    imagePath: '/images/products/saree-20.jpg',
  },
  {
    name: 'Handloom',
    description:
      "Authentic handwoven sarees that celebrate India's rich textile heritage",
    imagePath: '/images/products/saree-10.jpg',
  },
  {
    name: 'Designer',
    description:
      'Contemporary designer sarees with modern silhouettes and unique patterns',
    imagePath: '/images/products/saree-11.jpg',
  },
  {
    name: 'Banarasi',
    description: 'Timeless Banarasi sarees from Varanasi',
    imagePath: '/images/products/saree-07.jpg',
  },
  {
    name: 'Linen',
    description: 'Lightweight linen sarees for summer elegance',
    imagePath: '/images/products/saree-14.jpg',
  },
  {
    name: 'Chiffon',
    description: 'Flowing chiffon sarees for graceful drapes',
    imagePath: '/images/products/saree-12.jpg',
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
  { name: 'Shayga Original', description: 'Our in-house designed sarees' },
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
    imagePath: '/images/products/saree-14.jpg',
  },
  {
    name: 'Bridal Edit',
    description:
      'A curated selection of our finest bridal sarees for the modern bride',
    imagePath: '/images/products/saree-02.jpg',
  },
  {
    name: 'Festive Special',
    description: 'Stunning sarees for Diwali, weddings, and celebrations',
    imagePath: '/images/products/saree-08.jpg',
  },
  {
    name: 'Everyday Elegance',
    description: 'Affordable sarees for daily wear and office',
    imagePath: '/images/products/saree-05.jpg',
  },
  {
    name: 'Handloom Heritage',
    description: "Celebrating India's rich handloom weaving traditions",
    imagePath: '/images/products/saree-10.jpg',
  },
]

// ---------------------------------------------------------------------------
// Products (20 sarees with realistic data)
// ---------------------------------------------------------------------------

export const products: SeedProduct[] = [
  {
    name: 'Kadhwa Banarasi Silk Saree in Mehendi Green',
    status: 'published',
    fabric: 'silk',
    weave: 'banarasi',
    pattern: 'embroidered',
    basePrice: 18500,
    compareAtPrice: 22000,
    blouseType: 'Running blouse with zari border',
    palluDetails:
      'Rich kadhwa woven pallu with floral jaal and meenakari detailing in gold and copper zari',
    borderType:
      '8-inch broad border with elephant and peacock motifs in real gold zari',
    weavePattern:
      'Kadhwa (cutwork) technique — each motif woven independently without floating threads',
    occasion: 'Wedding, Reception, Diwali',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'A masterpiece from the looms of Varanasi. This mehendi green Banarasi silk saree features the intricate Kadhwa weaving technique where each motif is woven independently — no floating threads on the reverse. The body is adorned with a dense floral jaal in gold zari, while the pallu showcases elaborate meenakari work with copper and gold interplay. The 8-inch border carries traditional elephant and peacock motifs — symbols of royalty in Indian textile art. Pure silk warp and weft ensure a luxurious drape suitable for the most important occasions. Comes with a running blouse piece featuring a matching zari border.',
    imagePath: '/images/products/saree-01.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 15,
    lowStockThreshold: 3,
  },
  {
    name: 'Kanjivaram Temple Border Silk Saree',
    status: 'published',
    fabric: 'silk',
    weave: 'kanchipuram',
    pattern: 'embroidered',
    basePrice: 24500,
    compareAtPrice: 32000,
    blouseType: 'Contrast blouse with temple motifs',
    palluDetails:
      'Grand pallu with annam (swan) and rudraksha motifs woven in real zari against rich red body',
    borderType:
      'Classic 6-inch Korvai temple border with gopuram (temple tower) and yali (mythical lion) motifs',
    weavePattern:
      'Korvai technique — body and border woven separately then interlocked for strength',
    occasion: 'Bridal, Wedding Reception, Seemandham',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'Pure Kanjivaram silk saree woven in the sacred town of Kanchipuram by master weavers with generations of expertise. The deep pomegranate-red body provides the perfect canvas for real gold zari work — each thread is silk twisted with pure gold. The Korvai technique means the body and the contrasting border are woven on separate looms and interlocked with a distinctive serrated edge, ensuring the border never detaches from the body. The pallu features annam (divine swans) and rudraksha beads arranged in a grand composition. Three strands of mulberry silk twisted together give this saree its characteristic weight, rustle, and longevity — an heirloom that will last generations.',
    imagePath: '/images/products/saree-02.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 8,
    lowStockThreshold: 2,
  },
  {
    name: 'Bengal Tant Cotton Saree in Jamdani Weave',
    status: 'published',
    fabric: 'cotton',
    weave: 'tant',
    pattern: 'printed',
    basePrice: 2400,
    compareAtPrice: 2900,
    blouseType: 'Running blouse in solid contrast color',
    palluDetails:
      'Elaborate Jamdani-style pallu with geometric butis graduating to large paisley motifs',
    borderType: 'Thick contrasting border with double-line geometric pattern',
    weavePattern:
      'Jamdani supplementary weft technique — motifs float above the ground weave',
    occasion: 'Daily Wear, Office, Casual Lunch',
    gstPercent: 5,
    shippingPrice: 100,
    description:
      'A classic Bengal Tant saree with Jamdani-inspired motifs — an UNESCO Intangible Cultural Heritage. Woven in Phulia, West Bengal, this saree combines the crispness of fine cotton with the artistry of supplementary weft Jamdani. The off-white body is scattered with delicate geometric butis, while the pallu graduates to larger paisleys and floral motifs. The thick contrasting border with double-line geometry gives structure to the drape. Extremely lightweight and breathable — ideal for Kolkata summers or any humid climate. Each saree takes a weaver 5-7 days to complete on a traditional pit loom. Machine washable on gentle cycle — the cotton becomes softer with every wash.',
    imagePath: '/images/products/saree-03.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 30,
    lowStockThreshold: 5,
  },
  {
    name: 'Bandhani Silk Saree from Bhuj — Chandrokhani Pattern',
    status: 'published',
    fabric: 'silk',
    weave: 'bandhani',
    pattern: 'printed',
    basePrice: 9500,
    compareAtPrice: 12000,
    blouseType: 'Contrast blouse in solid color matching border',
    palluDetails:
      'Elaborate chandrokhani (moon-inspired) bandhani pattern with concentric circles graduating in size',
    borderType: 'Fine bandhani dotted border with gota trim edge',
    weavePattern:
      'Bandhani tie-dye — each dot hand-tied with thread before dyeing, untied to reveal the pattern',
    occasion: 'Navratri, Garba, Festive, Wedding Guest',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'Hand-tied Bandhani silk saree from the artisans of Bhuj, Gujarat. Each tiny dot on this saree has been individually tied with thread, dyed, and untied — a labor of love spanning 3-4 weeks per saree. The Chandrokhani pattern features concentric circles inspired by the moon, creating a mesmerizing optical effect on the rich silk fabric. The vibrant combination of red base with yellow and white dot clusters is classic Kutchi Bandhani. The saree is finished with a fine gota (gold ribbon) trim along the border for festive sparkle. Comes with a certificate of authenticity from the Bhuj Bandhani Weavers Cooperative.',
    imagePath: '/images/products/saree-04.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 12,
    lowStockThreshold: 3,
  },
  {
    name: 'Chanderi Silk-Cotton with Gold Booti',
    status: 'published',
    fabric: 'blend',
    weave: 'chanderi',
    pattern: 'embroidered',
    basePrice: 5500,
    compareAtPrice: 6800,
    blouseType: 'Matching blouse piece with zari border',
    palluDetails:
      'Sheer pallu with dense gold booti work and zari-striped border graduation',
    borderType: '1.5-inch gold zari border with delicate scalloped edge',
    weavePattern:
      'Chanderi weave — silk warp with cotton weft creating sheer, glossy texture',
    occasion: 'Office, Day Wedding, Puja, Lunch Party',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'Ethereal Chanderi saree from the historic weaving town of Chanderi, Madhya Pradesh. The unique silk-cotton blend creates a fabric that is simultaneously sheer, glossy, and lightweight — often described as "woven air." The pastel body is adorned with evenly spaced gold zari bootis (small floral motifs) that catch the light as you move. The pallu features a denser arrangement of bootis graduating to a rich gold-striped end. A delicate scalloped zari border frames the saree beautifully. Perfect for women who want sophistication without the weight of heavy silk. This saree weighs just 350 grams — you will barely feel it on you.',
    imagePath: '/images/products/saree-05.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 20,
    lowStockThreshold: 4,
  },
  {
    name: 'Patola Double Ikat Saree from Patan',
    status: 'published',
    fabric: 'silk',
    weave: 'patola',
    pattern: 'printed',
    basePrice: 42000,
    compareAtPrice: 55000,
    blouseType: 'Plain silk blouse in dominant border color',
    palluDetails:
      'Complex nari-kunj (elephant-floral) bhat design with nine-element geometric grid',
    borderType:
      'Triple-layer border with diamond, floral, and elephant motif bands',
    weavePattern:
      'Double Ikat — both warp and weft resist-dyed before weaving, pattern emerges at intersection',
    occasion: 'Bridal, Heirloom Collection, Museum-Quality Investment',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'A genuine Patan Patola — among the rarest and most complex textiles in the world. This double ikat saree from Patan, Gujarat, requires a master weaver and his family to spend 6-8 months on a single piece. Both warp and weft threads are individually resist-dyed according to a precise mathematical design before weaving begins. When the threads intersect on the loom, the pattern emerges with perfect alignment — a feat of engineering and art combined. The bhat (design) on this piece features the classic nari-kunj motif — elephants amidst floral vines within a nine-element geometric grid. The silk is sourced from Karnataka mulberry farms and the natural dyes use indigo, madder root, turmeric, and pomegranate rind. Only a handful of families in Patan still practice this 900-year-old craft. This saree comes with a detailed provenance document and care instructions for preservation.',
    imagePath: '/images/products/saree-06.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 2,
    lowStockThreshold: 1,
  },
  {
    name: 'Kalamkari Hand-Painted Cotton Saree — Tree of Life',
    status: 'published',
    fabric: 'cotton',
    weave: 'kalamkari',
    pattern: 'painted',
    basePrice: 6500,
    compareAtPrice: 8000,
    blouseType: 'Solid blouse in natural base color',
    palluDetails:
      'Elaborate Tree of Life spanning full pallu width with birds, flowers, and celestial elements',
    borderType:
      'Narrative border depicting episodes from the Panchatantra fables',
    weavePattern:
      'Srikalahasti style Kalamkari — freehand drawing with bamboo kalam (pen) using natural dyes',
    occasion: 'Art Exhibition, Cultural Event, Brunch, Museum Visit',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'A walking canvas. This saree is hand-painted in the Srikalahasti style of Kalamkari by artisans in Andhra Pradesh using a bamboo kalam (pen) dipped in natural dyes. Each line, each wash of color, is applied entirely by hand — no blocks, no screens, no shortcuts. The body features delicate floral creepers, while the pallu is dominated by the spectacular Tree of Life — its branches filled with peacocks, parrots, deer, and celestial flowers. The border narrates stories from the Panchatantra. The dyes are all natural: black from jaggery and iron filings, red from madder root, blue from indigo, yellow from pomegranate rind, green from myrobalan. The painting alone takes 15-20 days per saree. Every piece is unique — no two are exactly alike.',
    imagePath: '/images/products/saree-07.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 6,
    lowStockThreshold: 2,
  },
  {
    name: 'Paithani Silk Saree in Parrot Green',
    status: 'published',
    fabric: 'silk',
    weave: 'paithani',
    pattern: 'embroidered',
    basePrice: 16500,
    compareAtPrice: 21000,
    blouseType: 'Contrast blouse in pallu color',
    palluDetails:
      'Spectacular peacock motif pallu in seven colors — the signature Yeola weave',
    borderType:
      'Oval buti border with peacock feather motifs in alternating gold and silver zari',
    weavePattern:
      'Tapestry weave — each color change requires manual thread insertion, no power loom can replicate',
    occasion: 'Wedding, Paithani Festival, Maharashtra Day, Reception',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'A regal Paithani saree from Yeola, Maharashtra — the royal textile of the Maratha empire. The parrot green body is woven with pure mulberry silk shot with gold zari, creating an iridescent quality that shifts color as it catches light. The signature Paithani pallu features the mayur (peacock) motif in an extraordinary seven-color tapestry weave — each color change requires the weaver to manually insert a new thread. The border is adorned with alternating gold and silver zari oval butis interspersed with peacock feather motifs. The saree takes approximately 8-10 weeks to weave and weighs 850 grams. A traditional Marathi bridal choice, this saree is worn with the pallu draped over the left shoulder (the Nauvari style) for a distinctive look.',
    imagePath: '/images/products/saree-08.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 10,
    lowStockThreshold: 2,
  },
  {
    name: 'Maheshwari Cotton-Silk in Turmeric Yellow',
    status: 'published',
    fabric: 'blend',
    weave: 'maheshwari',
    pattern: 'solid',
    basePrice: 3200,
    compareAtPrice: 4000,
    blouseType: 'Matching blouse with border detail',
    palluDetails:
      'Five-stripe pallu in gold and red zari with reversible design',
    borderType:
      'Signature reversible Maheshwari border — gold zari on one side, colored silk on reverse',
    weavePattern:
      'Plain weave with zari stripe insertion — simplicity as sophistication',
    occasion: 'Daily Wear, Office, Puja, Casual Outing',
    gstPercent: 5,
    shippingPrice: 100,
    description:
      'The saree that defined a royal decree. In the 18th century, Queen Ahilyabai Holkar commissioned the weavers of Maheshwar to create a saree light enough to be worn in the intense Malwa summers yet elegant enough for court appearances. The result was the Maheshwari — a cotton-silk blend with distinctive reversible borders and five-stripe pallus. This turmeric yellow piece carries forward that 250-year tradition. The saree weighs just 250 grams, folds into a handbag, and emerges wrinkle-free. The gold zari stripes on the pallu catch light subtly rather than shouting for attention. Wear it to work with minimalist jewelry for an effortlessly sophisticated look. Machine washable — this is a saree designed to be lived in, not locked away.',
    imagePath: '/images/products/saree-09.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 25,
    lowStockThreshold: 5,
  },
  {
    name: 'Baluchari Silk Saree — Ramayana Pallu',
    status: 'published',
    fabric: 'silk',
    weave: 'baluchari',
    pattern: 'embroidered',
    basePrice: 22000,
    compareAtPrice: 28000,
    blouseType: 'Plain silk blouse in body color',
    palluDetails:
      "Narrative pallu depicting the entire Ramayana — from Rama's exile to the coronation at Ayodhya",
    borderType:
      'Floral vine border with small animal motifs woven in gold and silver zari',
    weavePattern:
      'Jacquard-loom figured weave — the pallu is a tapestry of miniature figurative panels',
    occasion: "Heritage Event, Wedding, Collector's Piece, Cultural Exhibition",
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'A Baluchari that tells the Ramayana. Woven in Bishnupur, West Bengal, this saree uses a Jacquard loom to create miniature narrative panels on the pallu — each panel depicting a key scene from the great epic: Rama breaking the bow at Sita\'s swayamvar, the exile into the forest, the golden deer, Hanuman\'s leap to Lanka, the battle, and the triumphant return to Ayodhya. The body is a deep, rich purple — the color of royalty in Bengal — with delicate floral motifs scattered across. The border carries continuation of the narrative with small animal and nature motifs. Each Baluchari requires 15-20 days of weaving on a complex Jacquard setup where the design is "programmed" through thousands of punched cards — an early form of computing in textile art. A museum-quality piece that preserves a 200-year-old Bengali storytelling tradition.',
    imagePath: '/images/products/saree-10.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 4,
    lowStockThreshold: 1,
  },
  {
    name: 'Organza Silk with Chikankari Embroidery',
    status: 'published',
    fabric: 'silk',
    weave: 'ikkat',
    pattern: 'embroidered',
    basePrice: 12500,
    blouseType: 'Embroidered blouse piece in matching organza',
    palluDetails:
      'Dense chikankari pallu — flowers, paisleys, and jaali work in white thread on pastel organza',
    borderType:
      'Delicate chikankari scalloped border with shadow-work technique',
    weavePattern:
      'Organza base with hand-embroidered chikankari — Lucknowi craft on translucent silk',
    occasion: 'Cocktail, Sangeet, Summer Wedding, High Tea',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      "Where the lightness of organza meets the intricacy of Lucknow's chikankari. This saree combines two distinct Indian textile traditions: the sheer, crisp silk organza from Varanasi and the hand-embroidered chikankari work from Lucknow. The pastel pink base is the perfect canvas for white thread embroidery — delicate floral sprays, paisley vines, and geometric jaali (lattice) work that creates beautiful shadow effects on the sheer fabric. The pallu is a dense garden of chikankari in multiple stitch styles: bakhiya (shadow work), phanda (knot stitch), keel kangan (buttonhole), and murri (rice-grain stitch). Each saree requires 25-30 days of embroidery by skilled Lucknowi karigars. Weighing just 400 grams, this is the ideal summer occasion saree — grand without the weight.",
    imagePath: '/images/products/saree-11.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 10,
    lowStockThreshold: 2,
  },
  {
    name: 'Pochampally Ikat Silk-Cotton in Geometric Blue',
    status: 'published',
    fabric: 'blend',
    weave: 'ikkat',
    pattern: 'printed',
    basePrice: 4200,
    compareAtPrice: 5200,
    blouseType: 'Solid blouse in navy blue',
    palluDetails:
      'Expanding diamond motifs graduating from small repeats to large statement geometrics',
    borderType: 'Triangular sawtooth ikat border with alternating color blocks',
    weavePattern:
      'Single Ikat — warp threads resist-dyed before weaving creating the distinctive blurred-edge geometric patterns',
    occasion: 'Office, Conference, Day Event, Contemporary Wedding Guest',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      "Bold geometry meets traditional ikat technique. This Pochampally silk-cotton saree features striking geometric patterns in deep indigo blue and white — the hallmark of Telangana's ikat tradition. The warp threads were resist-dyed before weaving, creating the characteristic slightly blurred edges where the pattern meets the white — a sign of authentic hand-crafted ikat (not digital print). The body alternates between bands of diamond lozenges and solid color blocks, while the pallu expands into large statement geometrics. The silk-cotton blend gives the sheen of silk with the comfort of cotton. Pairs beautifully with contemporary silver jewelry for a modern Indian aesthetic. The geometric precision of ikat has influenced international designers from Missoni to Dries Van Noten — wear a piece of that global design conversation.",
    imagePath: '/images/products/saree-12.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 18,
    lowStockThreshold: 4,
  },
  {
    name: 'Khadi Cotton Saree in Natural Indigo',
    status: 'published',
    fabric: 'cotton',
    weave: 'tant',
    pattern: 'solid',
    basePrice: 2800,
    compareAtPrice: 3500,
    blouseType: 'Matching solid blouse',
    palluDetails: 'Subtle self-stripe pallu — texture over ornamentation',
    borderType:
      'Simple selvedge edge — no added border, celebrating the fabric itself',
    weavePattern:
      'Hand-spun (khadi) yarn, hand-woven on pit loom — zero electricity used in production',
    occasion: 'Daily Wear, Sustainable Fashion, Travel, Beach Wedding',
    gstPercent: 5,
    shippingPrice: 100,
    description:
      "Fabric with a conscience. This saree is made from hand-spun khadi cotton — the fabric that symbolized India's freedom movement under Gandhi's vision of swadeshi. The cotton was grown organically in Vidarbha, hand-spun on a charkha (spinning wheel) by women in a rural cooperative, and hand-woven on a pit loom — zero electricity, zero carbon footprint. The natural indigo dye is fermented in traditional vats using the age-old reduction method. The result is a saree that breathes beautifully, softens with every wash, and carries a lineage of sustainability and self-reliance. No two pieces are exactly identical — the slight variations in slub and color are signatures of the handmade process, not defects. Wear it and feel the connection to India's greatest textile tradition.",
    imagePath: '/images/products/saree-13.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 22,
    lowStockThreshold: 5,
  },
  {
    name: 'Kota Doria Silk Saree in Mint Green',
    status: 'published',
    fabric: 'blend',
    weave: 'maheshwari',
    pattern: 'solid',
    basePrice: 3800,
    compareAtPrice: 4500,
    blouseType: 'Matching blouse with border trim',
    palluDetails: 'Zari-striped sheer pallu with khat (square check) pattern',
    borderType: 'Fine gold zari border with delicate khat weave pattern',
    weavePattern:
      'Kota Doria — unique square-check weave (khat) created by onion-juice starching technique',
    occasion: 'Summer Wedding, Day Event, Lunch, Resort Wear',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'The saree that floats. Kota Doria is woven in Kaithoon, Rajasthan, using a technique passed down through generations that creates a distinctive square check pattern called "khat." The secret lies in the sizing — the yarn is treated with a mixture of onion juice and rice paste before weaving, giving it extraordinary strength despite being incredibly fine. The mint green body is translucent and feather-light (280 grams), with a subtle khat pattern catching light. The pallu features gold zari stripes against the sheer background. This is the perfect summer occasion saree — cool, elegant, and effortlessly stylish. Pairs wonderfully with silver or kundan jewelry. The saree that every woman in Rajasthan has in her wardrobe — now available to you.',
    imagePath: '/images/products/saree-14.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 18,
    lowStockThreshold: 4,
  },
  {
    name: 'Mysore Silk Crepe Saree in Royal Blue',
    status: 'published',
    fabric: 'crepe',
    weave: 'chanderi',
    pattern: 'solid',
    basePrice: 7800,
    compareAtPrice: 9500,
    blouseType: 'Contrast blouse in gold',
    palluDetails:
      'Rich gold zari pallu with alternating floral and geometric bands',
    borderType: '4-inch gold zari border with peacock eye motif',
    weavePattern:
      'Crepe weave from Mysore silk — distinctive crinkled texture that adds volume to the drape',
    occasion: 'Wedding Guest, Reception, Diwali Party, Award Function',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'The pride of Karnataka. Mysore silk is renowned worldwide for its purity, luster, and richness — the mulberry silk cocoons come exclusively from the sericulture farms around Mysore and Ramanagara. This crepe silk variant has a distinctive crinkled texture that adds body and volume to the drape, making you look regal without needing a heavy saree. The royal blue body has a natural sheen that shifts from cobalt to sapphire as you move. The gold zari border with peacock eye motifs and the richly woven pallu add the perfect touch of celebration. Comes with the KSIC (Karnataka Silk Industries Corporation) hologram for authenticity. A saree that will be the center of attention at any gathering.',
    imagePath: '/images/products/saree-15.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 14,
    lowStockThreshold: 3,
  },
  {
    name: 'Tussar Silk Saree with Tribal Embroidery',
    status: 'published',
    fabric: 'silk',
    weave: 'tant',
    pattern: 'embroidered',
    basePrice: 8500,
    compareAtPrice: 10000,
    blouseType: 'Plain tussar blouse',
    palluDetails:
      'Hand-embroidered pallu with Kantha running stitch in multi-colored threads',
    borderType: 'Simple selvedge with Kantha stitch detail',
    weavePattern:
      'Wild tussar silk — naturally textured golden-beige with slubs — paired with hand embroidery',
    occasion: 'Art Opening, Cultural Event, Day Wedding, Lunch Party',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'Where the wild meets the refined. Tussar silk comes from Antheraea moths raised in the forests of Jharkhand, Bihar, and Chhattisgarh — the silk is not reeled from cultivated cocoons but from wild ones, giving it a natural golden-beige color and a textured, slubby surface. This saree pairs that raw silk beauty with hand-embroidered Kantha work from Bengal — rows of running stitch in vibrant multicolored threads creating floral and geometric patterns across the pallu. The contrast between the rustic, textured silk and the colorful, rhythmic embroidery is stunning. Each Kantha stitch is a meditation — the women who do this work sit in groups, stitching and singing. Your saree carries their stories.',
    imagePath: '/images/products/saree-16.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 9,
    lowStockThreshold: 2,
  },
  {
    name: 'Venkatagiri Cotton Saree in Rose Pink',
    status: 'published',
    fabric: 'cotton',
    weave: 'ikkat',
    pattern: 'printed',
    basePrice: 2200,
    compareAtPrice: 2800,
    blouseType: 'Matching blouse with border',
    palluDetails:
      'Elaborate jamdani-style pallu with geometric butis and contrasting border',
    borderType: 'Thick gold zari border with leaf motif',
    weavePattern:
      "Fine count cotton (100s) with supplementary zari — Andhra Pradesh's finest handloom",
    occasion: 'Office, Puja, Family Gathering, Casual Outing',
    gstPercent: 5,
    shippingPrice: 100,
    description:
      'Elegance in simplicity. Venkatagiri cotton sarees from Andhra Pradesh are woven with the finest count cotton (100s count), making them extraordinarily soft and lightweight. The rose pink body features delicate gold zari butis, while the pallu expands into a more elaborate design. The zari border with leaf motifs adds a touch of occasion-worthiness without being overwhelming. At just 300 grams, this saree is a joy to wear — drapes beautifully, stays in place, and keeps you cool. The finesse of the weave means it looks equally appropriate at work, at a puja, or at a family lunch. Machine washable.',
    imagePath: '/images/products/saree-17.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 28,
    lowStockThreshold: 5,
  },
  {
    name: 'Kantha Stitch Silk Saree — Upcycled Vintage',
    status: 'published',
    fabric: 'silk',
    weave: 'tant',
    pattern: 'embroidered',
    basePrice: 9500,
    blouseType: 'Plain silk blouse',
    palluDetails:
      'Dense Kantha stitch tapestry — entirely hand-embroidered with narrative and floral motifs',
    borderType:
      'Multiple rows of running stitch in graduating colors forming a complex border',
    weavePattern:
      'Vintage silk sarees upcycled with Kantha embroidery — two sarees stitched together with running stitch',
    occasion:
      'Art Collector, Sustainable Fashion, Cultural Event, Gallery Opening',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      'A textile with two lives. This is an upcycled Kantha saree — two vintage silk sarees have been layered together and entirely hand-stitched with the Kantha running stitch, creating a quilted, textured fabric that is warmer, heavier, and more sculptural than a single saree. The embroidery covers the entire surface with narrative and floral motifs in threads sourced from old saree borders — a true zero-waste creation. The artisans are women from the SHE (Self-Help Enterprise) collective in Bolpur, West Bengal, who have revived this dying craft. No two pieces are similar — each is a unique work of art. Wearing this saree carries almost a century of textile tradition: the silk was likely woven decades ago, and now it has been reborn through the needle and thread of a Kantha artisan.',
    imagePath: '/images/products/saree-18.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 4,
    lowStockThreshold: 1,
  },
  {
    name: 'Sambalpuri Cotton Saree in Earth Tones',
    status: 'published',
    fabric: 'cotton',
    weave: 'ikkat',
    pattern: 'printed',
    basePrice: 2800,
    blouseType: 'Matching blouse in solid earth tone',
    palluDetails:
      'Expanding rudraksha and conch shell motifs in jala (net) pattern',
    borderType: 'Elephant and fish motif ikat border in rust and black',
    weavePattern:
      'Bandha (tie-dye ikat) from Odisha — both warp and weft resist-dyed before weaving',
    occasion: 'Daily Wear, Cultural Event, Office, Travel',
    gstPercent: 5,
    shippingPrice: 100,
    description:
      'From the looms of Bargarh, Odisha, comes this Sambalpuri cotton saree in rich earth tones — rust, terracotta, black, and cream. The ikat technique used here is called "Bandha" in Odia, where both warp and weft threads are resist-dyed before weaving, creating precise patterns with a characteristic softness at the edges. The body features a delicate repeat of conch shell and flower motifs, while the pallu expands into larger rudraksha bead and wave patterns. The border carries elephant and fish symbols — both auspicious in Odia culture. The cotton is handwoven and breathable, softening with each wash. A piece of Odisha\'s living textile heritage at an accessible price point.',
    imagePath: '/images/products/saree-19.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 20,
    lowStockThreshold: 5,
  },
  {
    name: 'Gota Patti Silk Saree in Fuchsia Pink',
    status: 'published',
    fabric: 'silk',
    weave: 'maheshwari',
    pattern: 'embellished',
    basePrice: 8500,
    compareAtPrice: 11000,
    blouseType: 'Contrast blouse with gota work',
    palluDetails:
      'Elaborate gota patti pallu with floral medallions and scalloped edges',
    borderType: 'Thick gota ribbon border with chain-stitch detail',
    weavePattern:
      'Silk base with gota patti appliqué — gold and silver ribbons cut and shaped into motifs',
    occasion: 'Mehendi, Sangeet, Festive, Wedding Guest',
    gstPercent: 5,
    shippingPrice: 0,
    description:
      "The sound of celebration. Gota patti work — where ribbons of gold and silver are cut, shaped, and appliquéd onto fabric — is Rajasthan's gift to festive dressing. This fuchsia pink silk saree is alive with gota work: floral medallions across the body, an elaborate scalloped pallu, and a thick gota ribbon border. Each piece of gota is individually shaped and stitched — a single saree requires weeks of meticulous handwork. The fabric rustles with a distinctive sound as you move, a sound that in Rajasthani tradition announces joy and celebration. Wear this to a mehendi, sangeet, or Diwali party — it demands dancing.",
    imagePath: '/images/products/saree-20.jpg',
    length: 5.5,
    trackQuantity: true,
    quantity: 12,
    lowStockThreshold: 3,
  },
]

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export const pages: SeedPage[] = [
  {
    title: 'Home',
    slug: 'home',
    template: 'default',
    status: 'published',
    heroSubheading:
      "Discover India's finest handloom traditions — from Banarasi to Kanchipuram, every saree tells a story.",
    blocks: [],
  },

  // -------------------------------------------------------------------------
  // About Us
  // -------------------------------------------------------------------------
  {
    title: 'About Us',
    slug: 'about',
    template: 'about',
    status: 'published',
    heroSubheading:
      'A mother-daughter story, fifty artisan families, and one quiet belief — that a saree should outlast trends.',
    blocks: [
      {
        blockType: 'textImage',
        heading: 'Forty years on the ghats',
        body: "My mother, Meera, ran a small saree shop near Assi Ghat in Varanasi for four decades. Women came from three districts to buy from her — not because she had the most stock, but because she never lied about the weave. She knew every weaver by name. She knew which cluster in Madanpura was producing the finest Kadhwa work that season. When a customer asked about a saree's zari, she could tell them exactly which family in Pilikothi had woven it.\n\nWhen she retired in 2019, the weavers she had worked with for decades were losing ground to machine-made copies. Power looms in Surat were producing near-identical Banarasi patterns in four hours — pieces that took a handloom weaver three weeks. Prices were being undercut. Younger members of weaver families were leaving the loom for factory work. The tradition that sustained Varanasi's identity for five centuries was hollowing out.\n\nShayga launched in 2020 with twelve sarees and a WhatsApp group of 200 women. We photographed each saree in natural daylight, wrote the weaver's name on the product page, and priced it fairly — no bargaining culture, no inflated MRP. Within six months, all twelve sarees had sold. The weavers asked us to continue.",
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'featureGrid',
        heading: 'What we will never compromise',
        features: [
          {
            title: 'Verified handloom only',
            description:
              'Every saree on Shayga is tested against the India Handloom Mark criteria before listing. No power-loom substitutes — even when they look identical from a photograph.',
          },
          {
            title: 'Maker traceability',
            description:
              'The name of the weaver and the cluster they work from appears on every product page. You will know who wove your saree before it arrives at your door.',
          },
          {
            title: '85% to the artisan',
            description:
              'Through our SHEROES storefronts, 85% of your purchase price goes directly to the artisan. The remaining 15% covers platform and logistics costs — nothing else.',
          },
          {
            title: 'Unedited photography',
            description:
              'Every saree is photographed in natural light on a neutral background. No filters, no colour correction. What you see on the screen is what arrives in the box.',
          },
        ],
      } as SeedFeatureGridBlock,
      {
        blockType: 'textImage',
        heading: 'The SHEROES Initiative',
        body: 'In 2022, we realised that most of our artisan partners were women who were working through male intermediaries — their husbands, fathers, or male relatives who handled sales while the women did the actual weaving. The women received a wage. The men received the relationship.\n\nSHEROES was built to change that structure. We help women weavers set up their own storefronts on Shayga — with their own names, their own craft descriptions, and direct access to customers. We provide training, photography support, and logistics. The women handle everything else.\n\nWe currently have 23 active SHEROES storefronts, run by women weavers from Banarasi silk clusters in Varanasi, Chanderi cotton-silk weavers in Madhya Pradesh, Kantha embroiderers in West Bengal, and Bandhani artisans in Kutch, Gujarat. Our goal is 100 active storefronts by 2027. Every SHEROES purchase is clearly marked on the product page so you know exactly who you are supporting.',
        imagePosition: 'left',
        imagePath: '/images/hero/hero-1.jpg',
      } as SeedTextImageBlock,
      {
        blockType: 'testimonials',
        heading: 'From the loom room',
        items: [
          {
            name: 'Sunita Devi',
            role: 'Banarasi weaver, Madanpura — 3rd generation',
            quote:
              'Before SHEROES, my father-in-law would sell my sarees to traders in the market. I never knew the final price, never met the customer. Now I have my own storefront. Last month I sold a kadhwa saree to a woman in Canada. She sent me a photo of her wedding. I kept it.',
          },
          {
            name: 'Fatima Sheikh',
            role: 'Chanderi weaver, Chanderi, Madhya Pradesh',
            quote:
              'My grandmother wove Chanderi for the Nawab of Bhopal. My mother wove for local traders. I weave for Shayga. For the first time in three generations, I know what my sarees sell for and who buys them. That knowledge changes how I work.',
          },
          {
            name: 'Rukmini Bai',
            role: 'Kantha embroiderer, Bolpur, West Bengal',
            quote:
              'We were making Kantha work and selling to city buyers for very low prices. Shayga listed our sarees at their real value — what the craft actually costs to make. The first month, I earned more from four sarees than in the previous three months combined.',
          },
        ],
      } as SeedTestimonialsBlock,
      {
        blockType: 'cta',
        heading: 'Every saree has a weaver. Every weaver has a name.',
        body: "Browse our collection and read the maker's story on each product page. When you buy handloom, you're telling their children that the loom is still worth sitting at.",
        buttonText: 'Explore the collection',
        buttonLink: '/products',
      } as SeedCtaBlock,
    ],
  },

  // -------------------------------------------------------------------------
  // Contact Us — template handles the form; no additional blocks needed
  // -------------------------------------------------------------------------
  {
    title: 'Contact Us',
    slug: 'contact',
    template: 'contact',
    status: 'published',
    heroSubheading:
      "Whether it's a question about a saree, help with measurements, or just to say hello — we're here.",
    blocks: [],
  },

  // -------------------------------------------------------------------------
  // FAQ
  // -------------------------------------------------------------------------
  {
    title: 'FAQ',
    slug: 'faq',
    template: 'faq',
    status: 'published',
    heroSubheading:
      'Everything you need to know about ordering, shipping, returns, and caring for your saree.',
    blocks: [
      {
        blockType: 'faq',
        heading: 'Ordering & Payment',
        questions: [
          {
            question: 'How do I place an order?',
            answer:
              'Browse the product pages, add your chosen sarees to the cart, and proceed to checkout. You will need to provide your delivery address and select a payment method. Once your order is confirmed, you will receive an email with your order summary and tracking information once the saree is dispatched.',
          },
          {
            question: 'What payment methods do you accept?',
            answer:
              'We accept all major UPI apps (Google Pay, PhonePe, Paytm), credit and debit cards (Visa, Mastercard, RuPay), net banking, and EMI options on select cards. Cash on Delivery is available for orders up to Rs 10,000 within India.',
          },
          {
            question: 'Is Cash on Delivery available?',
            answer:
              'Yes — COD is available for orders up to Rs 10,000 within India. A COD convenience fee of Rs 40 applies. Please have the exact cash amount ready at the time of delivery.',
          },
          {
            question: 'Can I modify or cancel my order after placing it?',
            answer:
              'Orders can be modified or cancelled within 2 hours of placement by contacting us at care@shayga.com or WhatsApp +91 98765 43210. After 2 hours, the order enters processing and cannot be modified. Once dispatched, cancellations are not possible — you would need to initiate a return after delivery.',
          },
          {
            question: 'Do you offer blouse stitching?',
            answer:
              'Yes. Blouse stitching is complimentary on all sarees priced above Rs 15,000. For sarees below that, stitching is available for Rs 600. Please send your measurements (chest, waist, and sleeve preference) to care@shayga.com within 24 hours of ordering. Stitched blouses are custom-made and cannot be returned.',
          },
          {
            question: 'How do I know if a saree is truly handloom?',
            answer:
              'Every saree on Shayga is authenticated before listing. We check for India Handloom Mark criteria: presence of floating weft threads in hand-woven pieces, warp density, and construction technique. We also list the specific weave technique (Kadhwa, Phekwa, Korvai, etc.) on each product page. If you want to verify, you can request a video call with the weaver.',
          },
        ],
      } as SeedFaqBlock,
      {
        blockType: 'faq',
        heading: 'Sizing & Fit',
        questions: [
          {
            question: 'What is the standard length of a saree?',
            answer:
              'All sarees on Shayga are 5.5 metres long, which is the standard length across most Indian weaving traditions. This length works for all body types when draped in the Nivi style. Select weaves — Kanjivaram, Paithani, Banarasi — are available in 6 and 6.5 metre options. Check the product page for available length options.',
          },
          {
            question: 'Is a blouse piece included?',
            answer:
              'Yes — every saree comes with a running blouse piece (0.8 to 1 metre). The blouse piece fabric is the same as the saree body unless otherwise stated. For designer and embellished sarees, the blouse piece is typically a contrasting fabric as described on the product page.',
          },
          {
            question: 'Can sarees be worn by all body types?',
            answer:
              "Absolutely. The saree is one of the most body-inclusive garments in the world — its six metres of fabric can be draped to flatter any silhouette. If you're unsure which draping style would work best for you, our stylist Kavya is available for free 30-minute consultations. Book via the Contact page.",
          },
          {
            question:
              "I've never worn a saree before. Which should I start with?",
            answer:
              "We recommend beginning with a lightweight cotton or Chanderi saree — they are easier to drape, stay in place better, and are forgiving with pleats. Our 'Everyday Elegance' collection is specifically curated for first-time wearers. The Maheshwari cotton-silk or Kota Doria are ideal first sarees — both under 300 grams and drape beautifully.",
          },
        ],
      } as SeedFaqBlock,
      {
        blockType: 'faq',
        heading: 'Shipping & Delivery',
        questions: [
          {
            question: 'How long does delivery take?',
            answer:
              'Standard delivery across India takes 5–7 business days. Express delivery (2–3 business days) is available for Rs 300 extra. International orders to the US, UK, UAE, Canada, Australia, and Singapore take 10–14 business days. Orders placed before 1:00 PM IST are typically dispatched the same day.',
          },
          {
            question: 'What is the shipping charge?',
            answer:
              'Shipping is free on all orders above Rs 5,000 within India. For orders below that, a flat fee of Rs 150 applies. COD orders have an additional Rs 40 handling fee. International shipping starts at Rs 1,500 and varies by destination and weight.',
          },
          {
            question: 'Do you ship internationally?',
            answer:
              'Yes — we ship to over 25 countries including the United States, United Kingdom, UAE, Canada, Australia, Singapore, Malaysia, and all EU countries. International shipping takes 10–14 business days. Customs duties or import taxes applicable in your country are your responsibility.',
          },
          {
            question: 'How do I track my order?',
            answer:
              'Once your order is dispatched, you will receive an SMS and email with the tracking number and courier partner details. We use BlueDart and Delhivery for domestic orders, and DHL or FedEx for international orders. If you have not received tracking details within 2 business days of ordering, write to care@shayga.com.',
          },
          {
            question: 'What if my delivery is delayed?',
            answer:
              'Occasional delays can occur due to courier logistics, especially in remote areas or during festive seasons. If your order has not arrived within the expected window, first check the tracking link. If tracking shows no movement for more than 48 hours, write to care@shayga.com with your order number — we will investigate and resolve within 24 hours.',
          },
        ],
      } as SeedFaqBlock,
      {
        blockType: 'faq',
        heading: 'Returns & Refunds',
        questions: [
          {
            question: 'What is your return policy?',
            answer:
              'We accept returns within 15 days of delivery. The saree must be unworn, undamaged, and have original tags and packaging intact. Custom-stitched blouses are non-returnable. To initiate a return, email care@shayga.com with your order number and reason. We arrange free pickup from most metro and tier-2 cities.',
          },
          {
            question: 'Can I exchange for a different colour or size?',
            answer:
              'Exchanges are treated as a return followed by a new purchase. Return the original saree within the 15-day window, and once the return quality check passes (3–5 business days), the refund is processed. You can then place a new order. We cannot guarantee the specific piece will still be available — our artisan-made inventory is limited.',
          },
          {
            question: 'How do refunds work?',
            answer:
              'Refunds are processed within 7–10 business days after we receive and inspect the returned saree. The refund goes back to the original payment method. For COD orders, refunds are processed via bank transfer (NEFT/IMPS). Shipping charges are not refunded unless the return is due to a defect or error on our part.',
          },
          {
            question: 'What if I receive a damaged or wrong saree?',
            answer:
              'We inspect every saree before dispatch, but if a damaged or incorrect item arrives, we will resolve it immediately — full refund or replacement at no cost to you. Photograph the issue and email care@shayga.com within 48 hours of delivery.',
          },
        ],
      } as SeedFaqBlock,
      {
        blockType: 'faq',
        heading: 'Caring for Your Saree',
        questions: [
          {
            question: 'How do I wash a silk saree?',
            answer:
              'Silk sarees should always be dry cleaned. Never wash silk at home — water can cause irreversible shrinkage, distortion of the zari, and colour bleeding. If a dry cleaner is unavailable in an emergency, hand washing in cold water with a silk-safe shampoo (never detergent) is an option, but professional dry cleaning is strongly recommended for anything with real zari or heavy embellishment.',
          },
          {
            question: 'How should I store my sarees?',
            answer:
              'Fold along the natural creases and wrap in clean, dry muslin cloth or the cotton bag included with your Shayga order. Store flat in a wooden or cardboard box — never in a plastic bag or airtight container, as plastic traps moisture and causes yellowing. Keep in a cool, dry, dark environment. Every 6 months, refold along different lines to prevent permanent crease stress.',
          },
          {
            question: 'Can I iron my saree?',
            answer:
              'Cotton and linen sarees can be ironed on a medium-high setting with a slightly damp cloth between the iron and fabric. Silk sarees should be ironed on the reverse side on a low (silk) setting — never steam iron directly, as steam can damage zari threads. For heavily embellished sarees, hang in a steam-filled bathroom briefly rather than ironing directly.',
          },
          {
            question: 'How do I prevent silver zari from tarnishing?',
            answer:
              'Real silver zari will naturally tarnish when exposed to air. To slow this, wrap your saree with a few cloves or a folded strip of camphor before storing — these absorb moisture and sulfur compounds that cause tarnish. Avoid wearing real-zari sarees with perfume or deodorant sprays applied directly to the fabric.',
          },
        ],
      } as SeedFaqBlock,
      {
        blockType: 'cta',
        heading: "Couldn't find your answer?",
        body: 'Our team responds to all queries within 4 hours on business days. You can also WhatsApp us for faster responses.',
        buttonText: 'Write to us',
        buttonLink: '/contact',
      } as SeedCtaBlock,
    ],
  },

  // -------------------------------------------------------------------------
  // Shipping & Returns
  // -------------------------------------------------------------------------
  {
    title: 'Shipping & Returns',
    slug: 'shipping',
    template: 'default',
    status: 'published',
    heroSubheading:
      'Everything you need to know about delivery timelines, return eligibility, and refunds.',
    blocks: [
      {
        blockType: 'textImage',
        heading: 'Free shipping above ₹5,000',
        body: 'We offer free standard shipping on all orders above Rs 5,000 within India. For orders below Rs 5,000, a flat shipping fee of Rs 150 applies.\n\nOrders placed before 1:00 PM IST (Monday to Saturday) are dispatched the same day. Orders placed after 1:00 PM, or on Sundays and public holidays, are dispatched the next working day. You will receive an SMS and email with your tracking details once the order is on its way.',
        imagePosition: 'left',
      } as SeedTextImageBlock,
      {
        blockType: 'featureGrid',
        heading: 'Delivery options',
        features: [
          {
            title: 'Standard delivery — 5–7 business days',
            description:
              'Free on orders above Rs 5,000. Rs 150 flat fee below that. We ship via BlueDart and Delhivery across all 28 states and 8 union territories.',
          },
          {
            title: 'Express delivery — 2–3 business days',
            description:
              'Available for an additional Rs 300. Order before 1 PM IST for same-day dispatch. Available in all major metros and tier-1 cities.',
          },
          {
            title: 'Cash on delivery',
            description:
              'Available on orders up to Rs 10,000. A Rs 40 COD convenience fee applies. Please have the exact cash amount ready at delivery.',
          },
          {
            title: 'International shipping — 10–14 business days',
            description:
              "Available to 25+ countries via DHL and FedEx. Shipping rates start at Rs 1,500 and vary by destination. Import duties are the customer's responsibility.",
          },
        ],
      } as SeedFeatureGridBlock,
      {
        blockType: 'textImage',
        heading: 'Tracking your order',
        body: "As soon as your saree is dispatched, we will send you an SMS and email containing your tracking number, the courier partner's name, a direct link to track your package, and an estimated delivery date.\n\nFor domestic orders we use BlueDart and Delhivery — both have real-time tracking apps. For international orders we ship via DHL or FedEx.\n\nIf you have not received tracking details within 2 business days of placing your order, please contact us at care@shayga.com with your order number.",
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'Returns: 15-day window',
        body: 'We accept returns within 15 days of delivery. To be eligible, the saree must be unworn and undamaged with original tags still attached, and returned in the original or equivalent protective packaging.\n\nCustom-stitched blouses are made to your exact measurements and cannot be returned.\n\nWe arrange free pickup for all returns from metro cities and most tier-2 cities. For areas where our courier partners do not provide pickup, you will need to send the saree via any courier and we will reimburse the shipping cost (up to Rs 150) upon receipt.',
        imagePosition: 'left',
      } as SeedTextImageBlock,
      {
        blockType: 'featureGrid',
        heading: 'Return eligibility at a glance',
        features: [
          {
            title: 'Eligible for return',
            description:
              'Unworn sarees with original tags and packaging, returned within 15 days of delivery. Sarees received in damaged or incorrect condition (full refund + free return pickup arranged).',
          },
          {
            title: 'Not eligible for return',
            description:
              'Custom-stitched blouses made to your measurements. Sarees that have been worn, washed, or have tags removed. Orders beyond the 15-day return window.',
          },
          {
            title: 'Refund timeline',
            description:
              'Refunds are processed within 7–10 business days after the returned saree passes our quality check. For COD orders, refunds go to your bank account via NEFT/IMPS.',
          },
        ],
      } as SeedFeatureGridBlock,
      {
        blockType: 'textImage',
        heading: 'How to initiate a return',
        body: 'Step 1: Email care@shayga.com with your order number, the reason for return, and photographs if the issue is damage or a wrong item.\n\nStep 2: Our team will review your request and confirm eligibility within 24 hours.\n\nStep 3: We will schedule a free pickup from your address (metro and most tier-2 cities). You will receive an SMS with the pickup date.\n\nStep 4: Once the saree reaches our warehouse and passes quality inspection (3–5 business days), your refund will be initiated to the original payment method.\n\nFor faster resolution, WhatsApp us at +91 98765 43210 with your order number and photographs.',
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'cta',
        heading: 'Questions about your order?',
        body: 'Our support team is available Monday to Saturday, 10 AM to 7 PM IST. Average response time is under 2 hours.',
        buttonText: 'Contact support',
        buttonLink: '/contact',
      } as SeedCtaBlock,
    ],
  },

  // -------------------------------------------------------------------------
  // Privacy Policy
  // -------------------------------------------------------------------------
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    template: 'default',
    status: 'published',
    heroSubheading:
      "We take your privacy seriously. Here's exactly what we collect, how we use it, and what we never do.",
    blocks: [
      {
        blockType: 'textImage',
        heading: 'What information we collect',
        body: 'When you create an account or place an order, we collect your name, email address, phone number, and delivery address. We do not store payment card details — payments are processed entirely by Razorpay and we never see or store your card information.\n\nIf you sign up for our newsletter, we store your email address and your preferences. We also collect anonymised browsing data (pages visited, session duration) to improve our site — this data contains no personal identifiers.\n\nWe do not collect information unless it is necessary for completing your order or meaningfully improving your experience.',
        imagePosition: 'left',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'How we use your information',
        body: 'Order processing: to confirm your purchase, coordinate dispatch, and provide customer support. Delivery: to share your name, phone, and address with our logistics partners (BlueDart, Delhivery, DHL, FedEx) for shipping — nothing else.\n\nCommunication: to send order confirmations, shipping updates, and responses to your support queries. Newsletter: if you opted in, to send weekly updates on new arrivals, weave stories, and exclusive offers — you can unsubscribe at any time.\n\nProduct improvement: anonymised and aggregated purchase data helps us decide which weaves to source and stock. We never use your information for automated profiling, credit scoring, or third-party advertising targeting.',
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'What we never do with your data',
        body: 'We want to be direct about this:\n\nWe do not sell your data to any third party — ever. We do not rent or share your contact information with marketing agencies or data brokers. We do not run retargeting ads using your browsing history from our site. We do not use your purchase data to show you personalised ads on other platforms. We do not share your information with social media platforms for advertising purposes.\n\nIf you receive an email or call claiming to be from Shayga and asking for payment details, do not respond — contact us immediately at privacy@shayga.com.',
        imagePosition: 'left',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'Third parties we share data with',
        body: "We share limited information only with the following partners, strictly for fulfilling your order:\n\nLogistics partners (BlueDart, Delhivery, India Post, DHL, FedEx): receive your name, phone number, and delivery address. Our tailor (for blouse stitching orders): receives your measurements only. Razorpay (payment gateway): processes your payment — Shayga never receives your card details. AWS (Amazon Web Services): hosts our application and database infrastructure.\n\nAll partners are bound by their own privacy policies and applicable data protection laws. We share no more information than is necessary for each partner's specific role.",
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'Your rights',
        body: "Access: you can request a complete copy of the data we hold about you at any time.\n\nCorrection: update or correct your name, address, email, and other details directly from your account settings.\n\nDeletion: you can request that we permanently delete your account and all associated data. Write to privacy@shayga.com and we will process the deletion within 30 days.\n\nUnsubscribe: click 'unsubscribe' in any newsletter email to stop receiving marketing communications immediately. This does not affect transactional emails (order confirmations, shipping updates).\n\nFor any privacy-related requests or concerns, email privacy@shayga.com. We respond to all privacy queries within 5 business days.",
        imagePosition: 'left',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'Cookies',
        body: 'Our website uses three types of cookies:\n\nEssential cookies are required for the site to function — they manage your cart, login session, and security. We cannot disable these. Analytics cookies use anonymised, privacy-compliant analytics to understand which pages are visited and how customers navigate the site. No personal data is included. Preference cookies remember your wishlist and session settings.\n\nWe do not use advertising or tracking cookies. You can manage cookie preferences through your browser settings. Disabling essential cookies may affect site functionality.',
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'cta',
        heading: 'Questions about privacy?',
        body: 'We take privacy questions seriously. Reach us at privacy@shayga.com for any data-related queries or requests.',
        buttonText: 'Write to privacy@shayga.com',
        buttonLink: '/contact',
      } as SeedCtaBlock,
    ],
  },

  // -------------------------------------------------------------------------
  // Terms of Service
  // -------------------------------------------------------------------------
  {
    title: 'Terms of Service',
    slug: 'terms',
    template: 'default',
    status: 'published',
    heroSubheading:
      'Please read these terms carefully before using Shayga. By placing an order you agree to them.',
    blocks: [
      {
        blockType: 'textImage',
        heading: 'Placing an order',
        body: 'When you place an order on shayga.com, you are making an offer to purchase. An order confirmation email does not constitute our acceptance — your order is accepted when we dispatch it. We reserve the right to cancel any order before dispatch, in which case you will receive a full refund.\n\nOrders may be cancelled by us if the product becomes unavailable after your order was placed, if we detect a pricing error (we will notify you and you may confirm at the correct price or cancel), if there are concerns about fraudulent activity on the account, or if your delivery address cannot be serviced by our logistics partners.',
        imagePosition: 'left',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'Pricing and payment',
        body: "All prices displayed on shayga.com are in Indian Rupees (INR) and are inclusive of applicable GST (currently 5% on textile products). Prices do not include shipping charges, which are calculated at checkout.\n\nWe reserve the right to change prices without prior notice. The price applicable to your order is the price confirmed at checkout. In the event of a pricing error, we will notify you at your registered email address before processing the order. Payments are processed by Razorpay and are subject to Razorpay's terms of service.",
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'Product descriptions and authenticity',
        body: "We make every effort to describe our products accurately — weave technique, fabric composition, zari type, origin cluster, and artisan details. Photographs are taken in natural light without colour correction; slight colour variations between the photograph and the physical saree may occur due to monitor calibration differences.\n\nAll products sold as 'handloom' are verified against the India Handloom Mark criteria before listing. All products described as containing 'real zari' or 'pure zari' are verified with the weaver. If you receive a product that materially differs from its description, you are entitled to a full refund.",
        imagePosition: 'left',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'Intellectual property',
        body: 'All content on shayga.com — including product photographs, weave descriptions, blog articles, the Shayga brand name, logo, and design system — is the exclusive intellectual property of Shayga or the individual artisans who have licensed their stories and images to us.\n\nYou may not reproduce, copy, distribute, or commercially exploit any content from this site without prior written permission from Shayga. Linking to our product pages is permitted for non-commercial purposes. For press, editorial, or wholesale inquiries, contact hello@shayga.com.',
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'Limitation of liability',
        body: "To the maximum extent permitted by applicable law, Shayga's liability in connection with any product purchased through this site is limited to the purchase price of that product.\n\nShayga is not liable for indirect, incidental, or consequential damages; loss of profits or business; delays or damages resulting from events beyond our reasonable control (including customs delays, natural disasters, or logistics partner failures); or dissatisfaction with a product that was accurately described in the listing.\n\nNothing in these terms limits our liability for death or personal injury caused by negligence, fraud, or anything else that cannot be excluded under applicable law.",
        imagePosition: 'left',
      } as SeedTextImageBlock,
      {
        blockType: 'textImage',
        heading: 'Governing law',
        body: 'These Terms of Service are governed by the laws of Uttar Pradesh, India. Any dispute arising from your use of shayga.com or from a transaction on the platform shall be subject to the exclusive jurisdiction of the courts in Varanasi, Uttar Pradesh, India.\n\nIf you are a consumer based outside India, applicable mandatory consumer protection laws in your country may also apply. We will always attempt to resolve disputes amicably before either party initiates legal proceedings. Contact legal@shayga.com to raise any legal or compliance concern.',
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'cta',
        heading: 'Questions about these terms?',
        body: 'We try to write legal documents in plain English. If something is unclear, ask us.',
        buttonText: 'Write to legal@shayga.com',
        buttonLink: '/contact',
      } as SeedCtaBlock,
    ],
  },

  // -------------------------------------------------------------------------
  // Careers
  // -------------------------------------------------------------------------
  {
    title: 'Careers',
    slug: 'careers',
    template: 'default',
    status: 'published',
    heroSubheading:
      "We're a small team building something meaningful. If you care deeply about craft, culture, and commerce — we should talk.",
    blocks: [
      {
        blockType: 'textImage',
        heading: 'A small team doing something rare',
        body: 'Shayga is a bootstrapped company of twelve people, distributed between Varanasi, Bangalore, and Mumbai. We work with 50+ artisan families across eight states. Our job is to make their work visible, their prices fair, and their craft sustainable — so that the next generation of weavers has a reason to sit at the loom.\n\nWe are not a fast-fashion company that happens to sell Indian textiles. We are a company built around the belief that a handloom saree has more worth — economic, cultural, environmental — than the market currently recognises. Our role is to correct that gap.\n\nEvery product decision, every pricing call, every piece of content we publish is filtered through one question: does this serve the artisan and the customer honestly?',
        imagePosition: 'right',
      } as SeedTextImageBlock,
      {
        blockType: 'featureGrid',
        heading: 'Open roles — June 2026',
        features: [
          {
            title: 'Content Writer — Varanasi / Remote',
            description:
              'We need someone who can write about Banarasi weaves with the depth of a textile historian and the clarity of a great journalist. You will own product descriptions, the blog, and artisan profiles. Strong Hindi reading ability is a plus.',
          },
          {
            title: 'Full-Stack Developer — Remote',
            description:
              'Next.js, TypeScript, Payload CMS, PostgreSQL. You would be the fourth engineer on a product used by 12,000 customers. We move thoughtfully, not fast. You will own whole features end-to-end.',
          },
          {
            title: 'Artisan Relations Manager — Varanasi',
            description:
              'You will spend roughly half your time in weaving clusters across UP, MP, Gujarat, and West Bengal — meeting weavers, assessing new partnerships, and managing our SHEROES programme. Fluency in Hindi is required.',
          },
        ],
      } as SeedFeatureGridBlock,
      {
        blockType: 'featureGrid',
        heading: 'Why Shayga',
        features: [
          {
            title: 'Measurable impact',
            description:
              'You will see exactly how your work translates to artisan income. We share cluster-level revenue data with the whole team every quarter.',
          },
          {
            title: 'Real ownership',
            description:
              'We are a small team. You will own entire problem spaces, not tickets. If something is broken or missing, you will fix it — and take credit for it.',
          },
          {
            title: 'Remote-first culture',
            description:
              'No mandatory office. The Varanasi studio is available to anyone who wants it. Core hours are 10 AM to 1 PM IST; you manage your own time beyond that.',
          },
          {
            title: 'Competitive compensation',
            description:
              'Market-rate salaries with a simple equity participation plan. We are bootstrapped, so we cannot match VC-backed startups on cash — but we compete on everything else.',
          },
        ],
      } as SeedFeatureGridBlock,
      {
        blockType: 'textImage',
        heading: 'What we look for',
        body: 'More than specific skills, we look for people who think clearly, write well, and care deeply about what they are working on.\n\nEvery person at Shayga can explain — clearly and concisely — why handloom matters. Not because we require a memorised answer, but because you cannot do this work well without genuinely believing in it.\n\nWe look for people who ask good questions before starting work, who admit when they do not know something, and who are made uncomfortable by inaccuracy. We are building something that is honest about what it is — and we need people who hold themselves to that same standard.',
        imagePosition: 'left',
      } as SeedTextImageBlock,
      {
        blockType: 'cta',
        heading: 'Not seeing the right role?',
        body: 'We keep every application on file. Send a short note — three sentences about why you care about handloom and what you are good at — to careers@shayga.com.',
        buttonText: 'Send an open application',
        buttonLink: '/contact',
      } as SeedCtaBlock,
    ],
  },
]

// Blog Posts
// ---------------------------------------------------------------------------

export const blogPosts: SeedBlogPost[] = [
  {
    title: 'The Art of Banarasi Weaving: A 500-Year Legacy',
    status: 'published',
    excerpt:
      "From Mughal ateliers to modern trousseaus, the Banarasi saree remains India's most celebrated handloom treasure. Discover the craftsmanship, the techniques, and how to tell a real Banarasi from an impostor.",
    imagePath: '/images/blogs/blog-1.jpg',
    body: 'Walk through the gullies of Madanpura or Pilikothi in Varanasi and you will hear it before you see it — the rhythmic clack-clack-thump of the drawloom, a sound that has echoed through these lanes for five centuries. The Banarasi saree is not merely fabric; it is woven history. The Mughal seed: Persian motifs — the shikargah hunting scene, the bel creeping vine, the jaal lattice — melded with indigenous Indian sensibilities. Kadhwa versus Phekwa: In Kadhwa, every motif is woven independently with zero floating threads on the reverse. Phekwa uses a running weft — faster, cheaper. A Kadhwa Banarasi takes three to six months. True zari is pure silk twisted with silver wire electroplated in 24-karat gold. Shayga works directly with master weaver families in Varanasi — every Banarasi in our collection is Kadhwa-woven, using only certified pure zari.',
  },
  {
    title: 'How to Choose the Perfect Bridal Saree',
    status: 'published',
    excerpt:
      'The bridal saree is the most photographed garment you will ever wear. From fabric selection to colour symbolism and budget strategy, here is the only guide you need.',
    imagePath: '/images/blogs/blog-2.jpg',
    body: 'A bridal saree carries more emotional weight than any other garment. Start with the fabric: Kanjeevaram silk for South Indian weddings, Banarasi silk for North Indian ceremonies, raw silk for daytime pheras. The colour lexicon: red symbolises shakti and fertility, maroon and fuchsia remain most popular, gold-on-cream conveys regal restraint, midnight blue with silver zari is unexpectedly sophisticated. Budget with intelligence: a genuine handloom bridal saree starts around Rs 25,000. Invest in the zari, weave density, and pallu design. Book your blouse consultation early and do a full trial drape with actual jewellery and shoes one week before the wedding.',
  },
  {
    title: 'Sustainable Fashion: The Rise of Handloom Sarees',
    status: 'published',
    excerpt:
      "The handloom saree is quietly emerging as the most sustainable garment in the world. Here is why a six-yard weave might be fashion's most powerful climate statement.",
    imagePath: '/images/blogs/blog-3.jpg',
    body: "When fashion accounts for nearly ten percent of global carbon emissions, the handloom saree offers an answer that predates the problem. A power loom consumes 3-5 kilowatt-hours per saree. A handloom consumes zero — the entire energy source is the weaver's body. Khadi, the original slow fashion: hand-spun and hand-woven, using roughly three litres of water per metre versus industrial cotton's ten thousand litres. Behind every handloom saree stands an ecosystem of farmer, dyer, weaver, and family. Artisan cooperatives like Khamir in Kutch and Malkha in Andhra Pradesh prove community ownership works. The most sustainable garment is the one you never throw away — a handloom silk saree, properly cared for, lasts generations.",
  },
  {
    title: 'Saree Care Guide: Keeping Your Silks Pristine for Generations',
    status: 'published',
    excerpt:
      'A fine silk saree can outlive its owner — but only with the right care. From storage myths to dry-cleaning rules, here is how to protect your most valuable wardrobe.',
    imagePath: '/images/blogs/blog-4.jpg',
    body: 'Silk is protein — it breathes, ages, and responds to its environment much like skin does. Never store a silk saree in a plastic bag — plastic traps moisture and can react with silk proteins causing permanent yellowing. The correct method: fold along natural creases, wrap in clean muslin cloth, store flat in a wooden box. Every six months, refold along different lines to prevent crease stress. Do not wash silk at home — dry-cleaning is non-negotiable. Store in cool-dark-dry conditions (18-22 C, below 55% humidity). Place silica gel sachets among your saree boxes. Every saree from Shayga arrives with a cotton storage bag, acid-free tissue, and a detailed care card.',
  },
  {
    title: "India's Weaving Traditions: A Regional Journey",
    status: 'published',
    excerpt:
      "From the temple towns of Tamil Nadu to the desert workshops of Gujarat, India's saree traditions form a map of extraordinary living artistry.",
    imagePath: '/images/blogs/blog-5.jpg',
    body: 'Kanjeevaram of Tamil Nadu is the queen of South Indian weaves — three-shuttle technique where body and border are woven separately then interlocked. Banarasi of Uttar Pradesh is poetry in silk — intricate brocade work with Persian-influenced design vocabulary. Paithani of Maharashtra features the signature peacock motif woven into the pallu with a special tapestry technique using separate bobbins for each colour. Baluchari of West Bengal is a storytelling saree with narrative pallus depicting scenes from the Ramayana and Mahabharata. Patola of Gujarat is the most mathematically demanding textile in the world — double ikat where a single misplaced thread corrupts the entire pattern. Shayga sources each weave directly from the communities that create them.',
  },
]

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
        url: 'https://instagram.com/shayga',
      },
      {
        label: 'Facebook',
        type: 'custom_url',
        url: 'https://facebook.com/shayga',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------

export const siteSettingsData = {
  siteName: 'Shayga',
  tagline: 'Timeless Indian Sarees, Crafted with Love',
  contactEmail: 'hello@shayga.com',
  contactPhone: '+91 9876543210',
  address: "123 Weaver's Lane\nVaranasi, Uttar Pradesh 221001\nIndia",
  instagramUrl: 'https://instagram.com/shayga',
  facebookUrl: 'https://facebook.com/shayga',
  youtubeUrl: 'https://youtube.com/@shayga',
  pinterestUrl: 'https://pinterest.com/shayga',
  announcementBar: {
    enabled: true,
    text: 'Free shipping on orders above ₹999 \u00A0·\u00A0 Easy 7-day returns',
  },
  shippingPolicy:
    'We offer free shipping on all orders above ₹5,000. Standard delivery takes 5-7 business days. Express delivery is available for an additional fee.',
  returnPolicy:
    'Returns are accepted within 15 days of delivery. Items must be in original condition with tags attached. Custom-stitched blouses are not eligible for returns.',
  gstPercent: 5,
  currency: 'INR',
}
