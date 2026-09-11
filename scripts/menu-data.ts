export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const MENU_CATEGORIES = [
  {
    name: "Bagels",
    slug: "bagels",
    description: "Hand-rolled sourdough bagels, boiled and baked fresh daily.",
    startingPrice: 350,
    order: 1,
  },
  {
    name: "Cookies",
    slug: "cookies",
    description: "Thick, chewy cookies baked in small batches with premium ingredients.",
    startingPrice: 350,
    order: 2,
  },
  {
    name: "Combo Deals",
    slug: "combo-deals",
    description: "Mix and match your favourites at a special price.",
    startingPrice: 600,
    order: 3,
  },
] as const;

export const LEGACY_CATEGORY_SLUGS = [
  "gluten-free",
  "english-muffins",
  "sourdough-bread",
  "seasonal",
  "gift-boxes",
];

export const BAGEL_FLAVORS = [
  "Plain Bagel",
  "Poppy Seed",
  "Cheese & Jalapeño",
  "Everything",
  "Onion",
  "Blueberry",
  "Cinnamon Raisin",
  "Pumpernickel",
  "Pesto & Sun-Dried Tomato",
  "Italian & Garlic",
  "Bacon, Cheese & Maple Syrup",
  "Pumpkin Spice",
];

export const COOKIE_FLAVORS = [
  "Original Favourite Chocolate Chip Cookie",
  "Biscoff",
  "Nutella",
  "Red Velvet & White Chocolate Chip",
  "Pistachio Chocolate Chip",
  "Double Chocolate Chip",
  "KitKat Chocolate Chip",
  "Cranberry & Pistachio",
  "Oreo Chocolate Chip",
  "Peanut Butter Chocolate Chip",
  "Cookies & Cream Cookie",
  "Mini Chocolate Chip Cookie",
  "S'mores Cookie",
];

export const BAGEL_PACK_VARIANTS = [
  { name: "1 Bagel", price: 350 },
  { name: "6 Bagels", price: 1800 },
  { name: "1 Dozen", price: 3000 },
];

export const COOKIE_PACK_VARIANTS = [
  { name: "1 Cookie", price: 350 },
  { name: "6 Cookies", price: 1800 },
  { name: "1 Dozen", price: 3000 },
];

/** Expected image path when photos are added to public/images/products/ */
export function productImagePath(categorySlug: string, slug: string): string {
  return `/images/products/${categorySlug}/${slug}.jpg`;
}
