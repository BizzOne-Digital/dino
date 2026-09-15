export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const CATEGORY_IMAGE_PATHS: Record<string, string> = {
  bagels: "/images/categories/bagels.jpg",
  cookies: "/images/categories/cookies.jpg",
  "combo-deals": "/images/categories/combo-deals.jpg",
};

export const MENU_CATEGORIES = [
  {
    name: "Bagels",
    slug: "bagels",
    description: "12 sourdough flavours",
    startingPrice: 350,
    order: 1,
    image: CATEGORY_IMAGE_PATHS.bagels,
  },
  {
    name: "Cookies",
    slug: "cookies",
    description: "15 cookie flavours",
    startingPrice: 350,
    order: 2,
    image: CATEGORY_IMAGE_PATHS.cookies,
  },
  {
    name: "Combo Deals",
    slug: "combo-deals",
    description: "Bagel + cookie for $6",
    startingPrice: 600,
    order: 3,
    image: CATEGORY_IMAGE_PATHS["combo-deals"],
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
  "Hazelnut Chocolate Chip Cookie",
  "Smarties Cookie",
];

/** Product slug → image file basename in assets (image-{id}.jpg) */
export const COOKIE_IMAGE_IDS: Record<string, string> = {
  "mini-chocolate-chip-cookie": "c9cc5f66-2b05-4050-8841-c9aa7bd01b0d",
  "hazelnut-chocolate-chip-cookie": "3318bde3-f370-4937-9d59-ce1adbfe99f0",
  "cranberry-and-pistachio": "9cf47dd6-1608-4737-9ecd-e34534e42eff",
  "s-mores-cookie": "a0a4290f-3e19-4784-9ee3-724429dd8a6b",
  "original-favourite-chocolate-chip-cookie": "7a753ddb-1468-4288-9f52-636b2f0c9502",
  biscoff: "820784b8-6bf1-433a-9ccf-90275b551aa6",
  "red-velvet-and-white-chocolate-chip": "84ef4bd5-5ee3-4218-b091-302003d3096d",
  "oreo-chocolate-chip": "ae6aa136-6100-4a1e-b276-b505ebd79b1c",
  "pistachio-chocolate-chip": "9671aea4-f72b-4f61-ae19-0cbc654827e9",
  "kitkat-chocolate-chip": "6a6dd2b4-9c3f-4d8c-9f9a-c63e6df204da",
  "double-chocolate-chip": "890f62c6-c528-48ca-aff8-6376a31b5751",
  nutella: "6ba06df6-2693-4d26-88dc-157933ab60d2",
  "smarties-cookie": "3290c520-7c48-4988-99f4-eec5d0dfb3a3",
  "peanut-butter-chocolate-chip": "4105434b-1e2d-45fc-b6f7-fd2983ef9c8e",
  "cookies-and-cream-cookie": "8cecee4a-95fe-4a9b-9193-bc3eda1a52f8",
};

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
