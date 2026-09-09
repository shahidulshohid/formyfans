export const PRODUCT_SIZES = ["S", "M", "L", "XL"];

export const PRODUCT_COLOURS = [
  { label: "Light Blue", hex: "7ec8e3" },
  { label: "Off White", hex: "f4f4f0" },
  { label: "Light Pink", hex: "f4b8d0" },
  { label: "Dark Green", hex: "2d5a3d" },
];

export const variantRowKey = (size, colour) => `${size}|${colour}`;

/** Variant row: price − discount% + delivery (non-negative). */
export const computeVariantFinalPrice = (price, discountPercent, delivery) => {
  const p = Number.parseFloat(String(price ?? "").replace(/[^0-9.]/g, "")) || 0;
  const d =
    Number.parseFloat(String(discountPercent ?? "").replace(/[^0-9.]/g, "")) ||
    0;
  const del =
    Number.parseFloat(String(delivery ?? "").replace(/[^0-9.]/g, "")) || 0;
  const afterDiscount = p - (p * d) / 100;
  return Math.max(0, afterDiscount + del);
};

export const formatVariantFinalPrice = (price, discountPercent, delivery) => {
  const value = computeVariantFinalPrice(price, discountPercent, delivery);
  if (!price && !discountPercent && !delivery) return "—";
  return value.toFixed(2);
};

/** Resolve size for API payload from row state (handles stale rows after size selection). */
export const resolveVariantSize = (row, selectedSizes = []) => {
  if (!selectedSizes.length) return "";
  const fromRow = String(row?.size ?? "").trim();
  if (fromRow) return fromRow;
  const fromId = String(row?.id ?? "")
    .split("|")[0]
    ?.trim();
  if (fromId) return fromId;
  if (selectedSizes.length === 1) return selectedSizes[0];
  return "";
};

export const colourLabelsToHex = (labels = []) =>
  labels.map((label) => {
    const found = PRODUCT_COLOURS.find((c) => c.label === label);
    return found?.hex ?? String(label).replace("#", "").toLowerCase();
  });

export const getCreatorId = () => {
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const user = parsed?.state?.user ?? parsed?.user ?? null;
    return user?._id ?? user?.id ?? user?.creatorId ?? null;
  } catch {
    return null;
  }
};

export const mapApiProductToForm = (product) => {
  if (!product) return null;

  const isVariant = product.productType === "variant";
  const apiVariants = Array.isArray(product.variants) ? product.variants : [];
  const selectedSizes = [
    ...new Set(apiVariants.map((v) => v.size).filter(Boolean)),
  ];
  const selectedColours = [
    ...new Set(apiVariants.map((v) => v.colour).filter(Boolean)),
  ];

  const variantRows = apiVariants.map((v) => ({
    id: variantRowKey(v.size || "", v.colour),
    size: v.size || "",
    colour: v.colour,
    quantity: v.quantity != null ? String(v.quantity) : "",
    totalPrice: v.totalPrice != null ? String(v.totalPrice) : "",
    discount: v.discount != null ? String(v.discount) : "",
    deliveryCharges:
      v.deliveryCharges != null
        ? String(v.deliveryCharges)
        : v.deliveryCharge != null
          ? String(v.deliveryCharge)
          : "",
  }));

  return {
    productName: product.name ?? "",
    productDetails: product.productDetails ?? product.description ?? "",
    pricingMode: isVariant ? "variant" : "normal",
    discount: product.discount != null ? String(product.discount) : "",
    totalPrice:
      product.totalPrice != null && product.totalPrice !== ""
        ? String(product.totalPrice)
        : "",
    quantity:
      product.quantity != null && product.quantity !== ""
        ? String(product.quantity)
        : "",
    selectedSizes,
    selectedColours,
    variants: variantRows,
    images: Array.isArray(product.images) ? product.images : [],
  };
};

/** API list/detail uses productId (e.g. PRD-000005); fallback to Mongo _id */
export const getProductId = (product) =>
  product?.productId ?? product?._id ?? product?.id ?? null;

export const mapProductToTableRow = (product) => {
  const productId = getProductId(product);
  const isVariant = product.productType === "variant";
  const variants = Array.isArray(product.variants) ? product.variants : [];

  const fallbackQuantity = isVariant
    ? variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0)
    : Number(product.quantity) || 0;

  const totalQuantity =
    product.totalQuantity != null
      ? Number(product.totalQuantity)
      : product.quantity != null
        ? Number(product.quantity)
        : fallbackQuantity;

  const totalPrice =
    product.totalPrice != null && product.totalPrice !== ""
      ? Number(product.totalPrice)
      : isVariant && product.minPrice != null
        ? Number(product.minPrice)
        : Number(product.totalPrice) || 0;

  const statusActive =
    product.status === "active" ||
    product.status === true ||
    String(product.status).toLowerCase() === "active";

  return {
    id: productId,
    _id: productId,
    productId,
    name: product.name ?? "—",
    products: Array.isArray(product.images) ? product.images : [],
    productDetails: product.productDetails ?? "—",
    category: isVariant ? "Variant" : "Normal",
    totalPrice: Number.isNaN(totalPrice) ? "—" : `$${totalPrice.toFixed(2)}`,
    totalQuantity: Number.isNaN(totalQuantity) ? "—" : String(totalQuantity),
    status: statusActive,
    statusRaw: statusActive ? "active" : "inactive",
    raw: product,
  };
};

export const buildVariantRows = (sizes = [], colours = [], existing = []) => {
  if (!colours.length) return [];

  const rows = [];
  const findPrev = (size, colour) => {
    const exact = existing.find(
      (row) => row.id === variantRowKey(size, colour),
    );
    if (exact) return exact;
    if (size) {
      return existing.find(
        (row) =>
          row.colour === colour &&
          (!String(row.size ?? "").trim() || row.size === size),
      );
    }
    return existing.find((row) => row.id === variantRowKey("", colour));
  };

  const sizeList = sizes.length > 0 ? sizes : [""];
  for (const size of sizeList) {
    for (const colour of colours) {
      const id = variantRowKey(size, colour);
      const prev = findPrev(size, colour);
      rows.push({
        id,
        size: sizes.length > 0 ? size : "",
        colour,
        quantity: prev?.quantity ?? "",
        totalPrice: prev?.totalPrice ?? "",
        discount: prev?.discount ?? "",
        deliveryCharges: prev?.deliveryCharges ?? "",
      });
    }
  }
  return rows;
};

export const USER_ROLES = {
  USER: "user",
  CREATOR: "creator",
  ADMIN: "admin",
};

export { INTERESTS } from "../../constants/interests";
