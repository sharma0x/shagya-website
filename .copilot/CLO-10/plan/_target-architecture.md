# Target Architecture

## Component tree

```
Layout (server)
└── Product Listing Page (server, async)
    ├── Page header (title, description)
    ├── Toolbar row
    │   ├── Product count
    │   ├── Active filter chips (client) ← NEW
    │   │   └── Individually removable, shows "Clear All"
    │   └── SortSelect (client, updated to preserve all filter params)
    ├── Desktop: FilterSidebar (client, sticky, 280px)     ← NEW
    │   └── FilterSection (collapsible)                     ← NEW
    │       ├── CheckboxFilter (weave, fabric, pattern, etc.) ← NEW
    │       ├── PriceRangeFilter (min/max INR inputs)        ← NEW
    │       └── ColorFilter (color name checkboxes)          ← NEW
    ├── Mobile: FilterButton + Drawer (slide-over)          ← NEW
    │   └── Same FilterSidebar content in drawer
    └── Product grid (server-rendered, 3-4 cols)
```

## Data flow

```
User interacts with filter (checkbox / input / slider)
       ↓
FilterSidebar component updates URL searchParams via router.replace()
       ↓
Page re-renders (server component)
       ↓
Dynamic where clause builder reads all searchParams
       ↓
payload.find() with combined where clause + sort
       ↓
Products returned, grid re-renders
```

### URL state shape

```
/category/silk?weave=banarasi,kanchipuram&fabric=silk&priceRange_min=2000&priceRange_max=15000&pattern=embroidered&occasion=festive&color=red,gold&sort=price-asc
```

### Component dependency graph

```
FilterSidebar
├── FilterSection (collapsible wrapper, toggle icon)
│   ├── CheckboxFilter (generic: label, options[], paramName)
│   ├── PriceRangeFilter (min/max inputs, debounced)
│   └── ColorFilter (checkbox list with color names)
├── ActiveFilterChips (shows active filters, removable)
├── ClearAllButton (removes all filter params)
└── FilterCountBadge (mobile-only, shows count on toggle button)
```

### Where clause builder (shared utility)

```
Input: URLSearchParams
Output: Payload where object

Mappings:
  weave[]         → weave: { in: values }
  fabric[]        → fabric: { in: values }
  pattern[]       → pattern: { in: values }
  occasion[]      → occasion: { in: values }
  collection[]    → collections: { in: [ids] }
  color[]         → color: { in: values }
  priceRange_min  → basePrice: { greater_than_equal: value }
  priceRange_max  → basePrice: { less_than_equal: value }
```

[↑ Overview](./README.md)
