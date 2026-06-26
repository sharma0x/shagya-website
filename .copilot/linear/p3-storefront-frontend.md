# P3: Storefront (Frontend)

**Summary:** Homepage, PLP, PDP, search, static pages — Cycles 2-4

## Issues

### CLO-37: Create base layout + theme (Tailwind v4, fonts, shell)

**Priority:** Urgent | **Status:** Backlog
**Description:** Layout shell: HTML5 semantics, font system (Inter + Noto Sans Devanagari), Tailwind v4 theme, dark mode toggle. Base layout with header, footer, metadata. Loading states (skeleton/suspense). Error boundary.

### CLO-38: Homepage: Hero section + carousel

**Priority:** Urgent | **Status:** Backlog
**Description:** Hero section with full-width images, text overlay, CTA buttons. Carousel/slider auto-play. Mobile responsive. Dynamic from Payload pages/globals.

### CLO-39: Homepage: Category grid + product sections

**Priority:** Urgent | **Status:** Backlog
**Description:** Featured categories grid (4-6 categories). Bestsellers / new arrivals / trending product sections. Dynamic from Payload collections/globals. Infinite scroll or paginate.

### CLO-40: Homepage: Newsletter, brand story, testimonials, footer

**Priority:** High | **Status:** Backlog
**Description:** Newsletter signup section. Brand story / values section. Testimonials. Instagram feed. Footer with links, social, policies.

### CLO-41: Category / Collection listing page with filters

**Priority:** Urgent | **Status:** Backlog
**Description:** Category listing page. Product grid with filters sidebar. Filters: price range, fabric, weave, occasion, color, size, rating. Sort by: relevance, price (low-high), newest, rating. Mobile filter sheet.

### CLO-42: Product detail page (PDP)

**Priority:** Urgent | **Status:** Backlog
**Description:** Product detail page: image gallery (zoom, lightbox), product info (name, price, fabric, weave, length), variant selector (size, color, blouse size), add to cart / buy now, accordion sections (description, size chart, shipping info, reviews). Sticky add-to-cart mobile.

### CLO-43: Search page + autocomplete

**Priority:** High | **Status:** Backlog
**Description:** Search page with product results. Auto-complete dropdown (top 5 results). Full-page search results. Filterable after search. Debounce input.

### CLO-44: Header (nav, search, account, cart badges)

**Priority:** Urgent | **Status:** Backlog
**Description:** Header component: logo, navigation (from Payload Nav collection), search icon, account icon, wishlist icon (with count), cart icon (with count). Mobile hamburger menu. Announcement bar. Sticky on scroll.

### CLO-45: Product card component

**Priority:** Urgent | **Status:** Backlog
**Description:** Product card component: image, name, price (sale vs regular), rating stars, quick add to wishlist, add to cart button. Hover color swatches. Lazy load images. Used in grid listings and related sections.

### CLO-46: Blog listing + detail pages

**Priority:** Medium | **Status:** Backlog
**Description:** Blog listing page (cards, pagination). Blog detail page (rich text, share buttons, related posts, comments). Dynamic routing from Payload blog collection.

### CLO-47: Static pages (About, Contact, FAQ, Terms, Privacy)

**Priority:** High | **Status:** Backlog
**Description:** About, Contact form, FAQ, Terms, Privacy pages. Dynamic from Payload Pages collection with blocks. Contact form submits via Payload form builder.

### CLO-48: Wishlist page

**Priority:** Medium | **Status:** Backlog
**Description:** Wishlist page showing saved products. Remove from wishlist, move to cart. Share wishlist link. Login required prompt for guest users.

### CLO-49: Size chart + styling guide / lookbook

**Priority:** Medium | **Status:** Backlog
**Description:** Size chart modal triggered from PDP. Static data per category. Styling guide / lookbook gallery page. Filter by occasion or fabric type.

### CLO-73: Breadcrumbs, pagination, skeletons, error pages

**Priority:** High | **Status:** Backlog
**Description:** UI components: breadcrumbs (auto-generated from path/category), pagination (page numbers, prev/next, ellipsis), loading skeleton cards, error pages (404 with search, 500 with retry).

### CLO-74: Related products section on PDP

**Priority:** High | **Status:** Backlog
**Description:** Section on PDP showing related/upsell products based on same category, fabric, or occasion. Horizontal scroll on mobile. Product card grid on desktop.
