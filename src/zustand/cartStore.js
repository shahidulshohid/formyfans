import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCreatorInfo } from "../utils/cartHelpers";

const resolveCreatorForProduct = (product, creatorRegistry) => {
    const info = getCreatorInfo(product.creatorId, creatorRegistry);
    const nextRegistry = { ...creatorRegistry };

    if (info.creatorName && info.creatorName !== "Creator") {
        nextRegistry[info.creatorId] = info.creatorName;
    }

    return { ...info, nextRegistry };
};

const unitPriceAfterDiscount = (listPrice, discountPercent) => {
    const p = Number(listPrice) || 0;
    const d = Number(discountPercent) || 0;
    return Math.max(0, p - (p * d) / 100);
};

const buildCartItem = (product, variant, quantity, image, creatorRegistry) => {
    const variantId = variant?._id || "default";
    const listUnitPrice = Number(variant?.totalPrice ?? product.totalPrice ?? product.minPrice ?? 0);
    const discountPercent = Number(variant?.discount ?? product.discount ?? 0);
    const unitPrice = unitPriceAfterDiscount(listUnitPrice, discountPercent);
    const maxQuantity = Math.max(1, Number(variant?.quantity ?? product.quantity ?? 99));
    const { creatorId, creatorName } = resolveCreatorForProduct(product, creatorRegistry);
    const resolvedImage = image || product.selectedImage || product.images?.[0];

    return {
        cartItemId: `${product.productId}-${variantId}`,
        productId: product.productId,
        productName: product.name,
        productDetails: product.productDetails,
        image: resolvedImage,
        variantId,
        size: variant?.size ?? "",
        colour: variant?.colour ?? "",
        listUnitPrice,
        discountPercent,
        unitPrice,
        deliveryCharges: Number(variant?.deliveryCharges ?? 0),
        quantity: Math.min(Math.max(1, quantity), maxQuantity),
        maxQuantity,
        creatorId,
        creatorName,
        selected: true,
    };
};

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            creatorRegistry: {},

            addToCart: ({ product, variant, quantity, image }) => {
                const state = get();
                const { nextRegistry } = resolveCreatorForProduct(product, state.creatorRegistry);
                const newItem = buildCartItem(product, variant, quantity, image, state.creatorRegistry);

                set((current) => {
                    const registry = { ...current.creatorRegistry, ...nextRegistry };
                    if (newItem.creatorName && newItem.creatorName !== "Creator") {
                        registry[newItem.creatorId] = newItem.creatorName;
                    }

                    const existing = current.items.find((i) => i.cartItemId === newItem.cartItemId);
                    if (existing) {
                        const nextQty = Math.min(existing.quantity + quantity, newItem.maxQuantity);
                        return {
                            creatorRegistry: registry,
                            items: current.items.map((i) => {
                                if (i.cartItemId === newItem.cartItemId) {
                                    return {
                                        ...i,
                                        quantity: nextQty,
                                        selected: true,
                                        image: newItem.image,
                                        size: newItem.size,
                                        colour: newItem.colour,
                                        creatorId: newItem.creatorId,
                                        creatorName: newItem.creatorName,
                                    };
                                }
                                if (i.creatorId !== newItem.creatorId) {
                                    return { ...i, selected: false };
                                }
                                return i;
                            }),
                        };
                    }
                    return {
                        creatorRegistry: registry,
                        items: [
                            ...current.items.map((i) =>
                                i.creatorId !== newItem.creatorId ? { ...i, selected: false } : i,
                            ),
                            newItem,
                        ],
                    };
                });
            },

            setCreatorRegistry: (registry) =>
                set((state) => ({
                    creatorRegistry: { ...state.creatorRegistry, ...registry },
                })),

            enrichItemsWithCreators: (updates) =>
                set((state) => {
                    const registry = { ...state.creatorRegistry };
                    const items = state.items.map((item) => {
                        const patch = updates[item.cartItemId];
                        if (!patch) return item;
                        if (patch.creatorName && patch.creatorName !== "Creator") {
                            registry[patch.creatorId] = patch.creatorName;
                        }
                        return { ...item, ...patch };
                    });
                    return { items, creatorRegistry: registry };
                }),

            removeItem: (cartItemId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.cartItemId !== cartItemId),
                })),

            updateQuantity: (cartItemId, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.cartItemId === cartItemId
                            ? {
                                  ...i,
                                  quantity: Math.max(1, Math.min(quantity, i.maxQuantity)),
                              }
                            : i,
                    ),
                })),

            toggleItemSelected: (cartItemId) =>
                set((state) => {
                    const target = state.items.find((i) => i.cartItemId === cartItemId);
                    if (!target) return state;
                    const willSelect = !target.selected;
                    return {
                        items: state.items.map((i) => {
                            if (i.cartItemId === cartItemId) {
                                return { ...i, selected: willSelect };
                            }
                            if (willSelect && i.creatorId !== target.creatorId) {
                                return { ...i, selected: false };
                            }
                            return i;
                        }),
                    };
                }),

            toggleCreatorSelected: (creatorId, selected) =>
                set((state) => ({
                    items: state.items.map((i) => {
                        if (i.creatorId === creatorId) {
                            return { ...i, selected };
                        }
                        if (selected) {
                            return { ...i, selected: false };
                        }
                        return i;
                    }),
                })),

            removeSelectedItems: () =>
                set((state) => ({
                    items: state.items.filter((i) => !i.selected),
                })),

            clearCart: () => set({ items: [], creatorRegistry: {} }),
        }),
        { name: "cart-storage" },
    ),
);

export default useCartStore;
