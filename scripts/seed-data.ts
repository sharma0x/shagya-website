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

export interface SeedPage {
  title: string
  slug: string
  template: 'default' | 'contact' | 'about' | 'faq'
  status: 'draft' | 'published'
  heroHeading: string
  heroSubheading: string
  bodyContent: string
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
    heroHeading: 'Timeless Sarees, Handcrafted with Love',
    heroSubheading:
      "Discover India's finest handloom traditions — from Banarasi to Kanchipuram, every saree tells a story.",
    bodyContent:
      "We don't stock thousands of sarees. We stock the ones that stopped us mid-scroll. Banarasi silks woven on looms that have been in the same family for seven generations. Kanchipuram silks where the zari still carries real silver. Each piece comes from a weaver we know by name. When you buy from Shagya, you're paying the artisan directly. Browse by craft: Banarasi, Kanchipuram, Chanderi, Maheshwari, Tussar, Patola. Blouse stitching included free on sarees above Rs 15,000. Free shipping over Rs 5,000 across India. Join 12,000+ women who get our weekly newsletter.",
  },
  {
    title: 'About Us',
    slug: 'about',
    template: 'about',
    status: 'published',
    heroHeading: 'We Started in a Gully in Varanasi',
    heroSubheading:
      'A mother-daughter story, fifty artisan families, and one quiet belief — that a saree should outlast trends.',
    bodyContent:
      "My mother, Meera, spent forty years running a small saree shop near Assi Ghat. Women came from three districts to buy from her — not because she had the most stock, but because she never lied about the weave. When she retired in 2019, the weavers she'd worked with for decades were losing ground to machine-made copies. Shagya launched in 2020 with twelve sarees and a WhatsApp group of 200 women. Today we work with 50+ artisan families across eight states. Every saree on this site is photographed unedited, with the weaver's name attached. Our SHEROES initiative gives women weavers their own storefront, pays them 85% of the sale price. Currently 23 women run independent storefronts through SHEROES. We're working toward 100 by 2027. A Banarasi saree takes 15 to 45 days to weave. A power loom knocks out a copy in four hours. When you buy handloom, you're telling their children that the loom is still worth sitting at.",
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    template: 'contact',
    status: 'published',
    heroHeading: "We'd Love to Hear From You",
    heroSubheading:
      "Whether it's a question about a saree, help with measurements, or just to say hello — we're here.",
    bodyContent:
      "Visit us: Shagya House, B-12/47, Bengali Tola, Near Assi Ghat, Varanasi, Uttar Pradesh 221001. Open 11 AM to 7 PM, Tuesday through Sunday. Call or WhatsApp: +91 98765 43210. Email: hello@shagya.com. Not sure which weave suits you? Book a 30-minute video consultation with our stylist, Kavya. She'll walk you through fabrics, colours, and draping styles based on your body type, skin tone, and the occasion. It's free — we'd rather you buy the right saree once than the wrong one twice.",
  },
  {
    title: 'FAQ',
    slug: 'faq',
    template: 'faq',
    status: 'published',
    heroHeading: 'You Ask, We Answer',
    heroSubheading:
      'Everything you need to know about ordering, shipping, returns, and caring for your saree.',
    bodyContent:
      'Sarees are one-size garments — standard length is 5.5 metres with a 0.8-metre blouse piece. We offer 6-metre and 6.5-metre options on select weaves. Yes, we stitch blouses — free on sarees above Rs 15,000, Rs 600 below that. Standard shipping: 5-7 business days. Express: 2-3 days (Rs 300). International: 10-14 days. Free shipping above Rs 5,000. Returns within 15 days — saree must be unworn with tags. Stitched blouse is non-returnable. We accept UPI, cards, netbanking, and COD (up to Rs 10,000). Bulk orders for weddings — email bulk@shagya.com. Dry clean only for silks. Cottons can be hand-washed in cold water. Store in muslin cloth, not plastic.',
  },
  {
    title: 'Shipping & Returns',
    slug: 'shipping-returns',
    template: 'default',
    status: 'published',
    heroHeading: 'Shipping & Returns',
    heroSubheading:
      'Everything you need to know about delivery timelines, return eligibility, and refunds.',
    bodyContent:
      'Free standard shipping on orders above Rs 5,000 within India. Below that, flat Rs 150 fee. Delivery: Standard 5-7 business days, Express 2-3 days (Rs 300 surcharge), International 10-14 days (rates from Rs 1,500). We ship via BlueDart, Delhivery, and India Post domestically; DHL or FedEx internationally. Orders placed before 1 PM IST ship same day. Returns: 15 days from delivery, unworn with original tags. The stitched blouse is custom-made and non-returnable — we deduct Rs 600 from your refund. Refunds processed within 7-10 business days after quality check.',
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    template: 'default',
    status: 'published',
    heroHeading: 'Privacy Policy',
    heroSubheading:
      "We take your privacy seriously. Here's exactly what we collect and what we never do.",
    bodyContent:
      "We collect your name, email, phone, and address when you order. We do not store payment card details — payments are processed through Razorpay. We use your data only for order processing, shipping, and our newsletter (if you opt in). We don't run retargeting ads. We don't buy or rent customer lists. We share data only with logistics partners and our tailor — no marketing agencies, no data brokers. You can request a copy of your data, ask us to delete your account, or unsubscribe anytime. For privacy questions: privacy@shagya.com.",
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
    body: 'Walk through the gullies of Madanpura or Pilikothi in Varanasi and you will hear it before you see it — the rhythmic clack-clack-thump of the drawloom, a sound that has echoed through these lanes for five centuries. The Banarasi saree is not merely fabric; it is woven history. The Mughal seed: Persian motifs — the shikargah hunting scene, the bel creeping vine, the jaal lattice — melded with indigenous Indian sensibilities. Kadhwa versus Phekwa: In Kadhwa, every motif is woven independently with zero floating threads on the reverse. Phekwa uses a running weft — faster, cheaper. A Kadhwa Banarasi takes three to six months. True zari is pure silk twisted with silver wire electroplated in 24-karat gold. Shagya works directly with master weaver families in Varanasi — every Banarasi in our collection is Kadhwa-woven, using only certified pure zari.',
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
    body: 'Silk is protein — it breathes, ages, and responds to its environment much like skin does. Never store a silk saree in a plastic bag — plastic traps moisture and can react with silk proteins causing permanent yellowing. The correct method: fold along natural creases, wrap in clean muslin cloth, store flat in a wooden box. Every six months, refold along different lines to prevent crease stress. Do not wash silk at home — dry-cleaning is non-negotiable. Store in cool-dark-dry conditions (18-22 C, below 55% humidity). Place silica gel sachets among your saree boxes. Every saree from Shagya arrives with a cotton storage bag, acid-free tissue, and a detailed care card.',
  },
  {
    title: "India's Weaving Traditions: A Regional Journey",
    status: 'published',
    excerpt:
      "From the temple towns of Tamil Nadu to the desert workshops of Gujarat, India's saree traditions form a map of extraordinary living artistry.",
    imagePath: '/images/blogs/blog-5.jpg',
    body: 'Kanjeevaram of Tamil Nadu is the queen of South Indian weaves — three-shuttle technique where body and border are woven separately then interlocked. Banarasi of Uttar Pradesh is poetry in silk — intricate brocade work with Persian-influenced design vocabulary. Paithani of Maharashtra features the signature peacock motif woven into the pallu with a special tapestry technique using separate bobbins for each colour. Baluchari of West Bengal is a storytelling saree with narrative pallus depicting scenes from the Ramayana and Mahabharata. Patola of Gujarat is the most mathematically demanding textile in the world — double ikat where a single misplaced thread corrupts the entire pattern. Shagya sources each weave directly from the communities that create them.',
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
  announcementBar: {
    enabled: true,
    text: 'Free shipping on orders above ₹999 &nbsp;·&nbsp; Easy 7-day returns',
  },
  shippingPolicy:
    'We offer free shipping on all orders above ₹5,000. Standard delivery takes 5-7 business days. Express delivery is available for an additional fee.',
  returnPolicy:
    'Returns are accepted within 15 days of delivery. Items must be in original condition with tags attached. Custom-stitched blouses are not eligible for returns.',
  gstPercent: 5,
  currency: 'INR',
}
