/**
 * Color filter palette — 52 named colors inspired by Myntra's color filter.
 * Each entry has a display name, value slug, and hex for the swatch.
 */

export interface ColorOption {
  label: string
  value: string
  hex: string
}

export const COLOR_PALETTE: ColorOption[] = [
  // --- Whites & Ivories ---
  { label: 'White', value: 'white', hex: '#FFFFFF' },
  { label: 'Off White', value: 'off-white', hex: '#F9F6EE' },
  { label: 'Cream', value: 'cream', hex: '#FFFDD0' },
  { label: 'Ivory', value: 'ivory', hex: '#FFFFF0' },
  { label: 'Beige', value: 'beige', hex: '#F5F5DC' },
  { label: 'Nude', value: 'nude', hex: '#E3BC9A' },

  // --- Blacks & Greys ---
  { label: 'Black', value: 'black', hex: '#000000' },
  { label: 'Charcoal', value: 'charcoal', hex: '#36454F' },
  { label: 'Grey', value: 'grey', hex: '#808080' },
  { label: 'Silver', value: 'silver', hex: '#C0C0C0' },
  { label: 'Taupe', value: 'taupe', hex: '#483C32' },

  // --- Reds ---
  { label: 'Red', value: 'red', hex: '#FF0000' },
  { label: 'Maroon', value: 'maroon', hex: '#800000' },
  { label: 'Burgundy', value: 'burgundy', hex: '#800020' },
  { label: 'Wine', value: 'wine', hex: '#722F37' },
  { label: 'Crimson', value: 'crimson', hex: '#DC143C' },
  { label: 'Ruby', value: 'ruby', hex: '#E0115F' },
  { label: 'Cherry', value: 'cherry', hex: '#DE3163' },
  { label: 'Rose', value: 'rose', hex: '#FF007F' },

  // --- Pinks ---
  { label: 'Pink', value: 'pink', hex: '#FFC0CB' },
  { label: 'Hot Pink', value: 'hot-pink', hex: '#FF69B4' },
  { label: 'Fuchsia', value: 'fuchsia', hex: '#FF00FF' },
  { label: 'Magenta', value: 'magenta', hex: '#FF00FF' },
  { label: 'Blush', value: 'blush', hex: '#DE5D83' },
  { label: 'Peach', value: 'peach', hex: '#FFE5B4' },
  { label: 'Coral', value: 'coral', hex: '#FF7F50' },
  { label: 'Salmon', value: 'salmon', hex: '#FA8072' },

  // --- Oranges & Yellows ---
  { label: 'Orange', value: 'orange', hex: '#FFA500' },
  { label: 'Tangerine', value: 'tangerine', hex: '#F28500' },
  { label: 'Rust', value: 'rust', hex: '#B7410E' },
  { label: 'Mustard', value: 'mustard', hex: '#FFDB58' },
  { label: 'Yellow', value: 'yellow', hex: '#FFFF00' },
  { label: 'Gold', value: 'gold', hex: '#FFD700' },
  { label: 'Saffron', value: 'saffron', hex: '#F4C430' },
  { label: 'Amber', value: 'amber', hex: '#FFBF00' },

  // --- Greens ---
  { label: 'Green', value: 'green', hex: '#008000' },
  { label: 'Olive', value: 'olive', hex: '#808000' },
  { label: 'Emerald', value: 'emerald', hex: '#50C878' },
  { label: 'Mint', value: 'mint', hex: '#98FB98' },
  { label: 'Teal', value: 'teal', hex: '#008080' },
  { label: 'Sage', value: 'sage', hex: '#BCB88A' },
  { label: 'Mehendi', value: 'mehendi', hex: '#4A7C28' },
  { label: 'Pista', value: 'pista', hex: '#93C572' },

  // --- Blues ---
  { label: 'Blue', value: 'blue', hex: '#0000FF' },
  { label: 'Navy Blue', value: 'navy-blue', hex: '#000080' },
  { label: 'Royal Blue', value: 'royal-blue', hex: '#4169E1' },
  { label: 'Sky Blue', value: 'sky-blue', hex: '#87CEEB' },
  { label: 'Turquoise', value: 'turquoise', hex: '#40E0D0' },
  { label: 'Indigo', value: 'indigo', hex: '#4B0082' },
  { label: 'Cobalt', value: 'cobalt', hex: '#0047AB' },

  // --- Purples ---
  { label: 'Purple', value: 'purple', hex: '#800080' },
  { label: 'Lavender', value: 'lavender', hex: '#E6E6FA' },
  { label: 'Lilac', value: 'lilac', hex: '#C8A2C8' },
  { label: 'Violet', value: 'violet', hex: '#8F00FF' },
  { label: 'Plum', value: 'plum', hex: '#DDA0DD' },
  { label: 'Mauve', value: 'mauve', hex: '#E0B0FF' },

  // --- Browns & Earths ---
  { label: 'Brown', value: 'brown', hex: '#A52A2A' },
  { label: 'Tan', value: 'tan', hex: '#D2B48C' },
  { label: 'Coffee', value: 'coffee', hex: '#6F4E37' },
  { label: 'Khaki', value: 'khaki', hex: '#C3B091' },
]
