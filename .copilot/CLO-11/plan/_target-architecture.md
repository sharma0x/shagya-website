# Target Architecture

## Products Collection — Target State

```
Products (collection)
├── slug: 'products'
├── admin: useAsTitle='name', group='Products'
├── timestamps: true
├── hooks: beforeChange [slugify name → slug]
├── fields:
│   ├── name: text (required)
│   ├── slug: text (unique, index, admin.readOnly)
│   ├── description: richText (Lexical)
│   ├── fabric: select (required)
│   │   └── options: silk, cotton, linen, georgette, chiffon, crepe, velvet, net, blend
│   ├── weave: select (required)
│   │   └── options: banarasi, kanchipuram, bandhani, patola, kalamkari, ikkat, paithani, maheshwari, chanderi, tant, baluchari
│   ├── pattern: select (required)
│   │   └── options: solid, printed, embroidered, embellished, painted
│   ├── length: number (admin.step=0.1, min=1, max=9, suffix=meters)
│   ├── blouseType: text
│   ├── palluDetails: text
│   ├── borderType: text
│   ├── weavePattern: text
│   ├── occasion: text (placeholder until CLO-23 Occasion collection)
│   └── status: select (default='draft')
│       └── options: draft, published, archived
└── access: authenticated users can read; admin can create/update/delete
```

## Payload Config — Target

```
src/payload.config.ts
├── collections: [Users, Products]
└── ...other config
```

## Slug Generation Flow

```
1. User enters product name
2. beforeChange hook fires
3. slug = name → lowercase → replace spaces/special chars with '-' → trim
4. slug stored as unique indexed field
5. Admin UI shows slug as read-only
```

[↑ Overview](./README.md)
