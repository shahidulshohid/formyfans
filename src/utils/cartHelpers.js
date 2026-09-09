// export const ESTIMATED_TAX = 15.7;
export const ESTIMATED_TAX = 0;

export const getCreatorInfo = (creatorId, creatorRegistry = {}) => {
    if (creatorId && typeof creatorId === "object") {
        const name = [creatorId.firstName, creatorId.lastName].filter(Boolean).join(" ");
        const id = String(creatorId._id || creatorId.id || "unknown");
        return {
            creatorId: id,
            creatorName: name || creatorRegistry[id] || "Creator",
        };
    }

    const id = String(creatorId || "unknown");
    return {
        creatorId: id,
        creatorName: creatorRegistry[id] || "Creator",
    };
};

export const resolveProductFromApi = (data) => {
    if (data?.product) return data.product;
    if (data?.productId || data?.name) return data;
    return null;
};

export const needsCreatorEnrichment = (item) =>
    !item.creatorName || item.creatorName === "Creator";

export const groupCartByCreator = (items, creatorRegistry = {}) => {
    const map = new Map();

    items.forEach((item) => {
        const id = item.creatorId || "unknown";
        const displayName =
            item.creatorName && item.creatorName !== "Creator"
                ? item.creatorName
                : creatorRegistry[id] || item.creatorName || "Creator";

        if (!map.has(id)) {
            map.set(id, {
                vendorId: id,
                vendorName: displayName,
                products: [],
            });
        }

        map.get(id).products.push({
            id: item.cartItemId,
            cartItemId: item.cartItemId,
            name: item.productName,
            description: item.productDetails,
            price: item.unitPrice,
            unitPrice: item.unitPrice,
            listUnitPrice: item.listUnitPrice,
            lineTotal: (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
            quantity: item.quantity,
            image: item.image,
            deliveryCharges: item.deliveryCharges,
            size: item.size,
            colour: item.colour,
            selected: item.selected,
            maxQuantity: item.maxQuantity,
        });
    });

    return Array.from(map.values()).filter((group) => group.products.length > 0);
};

export const getSelectedCreatorIds = (items) => {
    const ids = new Set();
    items.filter((i) => i.selected).forEach((i) => ids.add(i.creatorId || "unknown"));
    return [...ids];
};

export const validateSingleCreatorSelection = (items) => {
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) {
        return { valid: false, message: "Please select at least one product" };
    }
    const creatorIds = getSelectedCreatorIds(items);
    if (creatorIds.length > 1) {
        return {
            valid: false,
            message: "You can only order from one creator at a time. Please select products from a single creator.",
        };
    }
    return { valid: true, creatorId: creatorIds[0] };
};

export const groupSelectedItemsByCreator = (items) => {
    const selected = items.filter((i) => i.selected);
    const map = new Map();

    selected.forEach((item) => {
        const id = item.creatorId || "unknown";
        if (!map.has(id)) {
            map.set(id, { creatorId: id, creatorName: item.creatorName, items: [] });
        }
        map.get(id).items.push(item);
    });

    return Array.from(map.values());
};

export const calcCartTotals = (items, staticTax = ESTIMATED_TAX) => {
    const selected = items.filter((i) => i.selected);
    const subTotal = selected.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shippingCharge = selected.reduce((sum, i) => sum + Number(i.deliveryCharges || 0), 0);
    const discountAmount = selected.reduce((sum, i) => {
        const list = Number(i.listUnitPrice ?? i.unitPrice);
        return sum + Math.max(0, (list - i.unitPrice) * i.quantity);
    }, 0);
    // const estimatedTax = staticTax;
    const estimatedTax = 0;
    const total = subTotal + shippingCharge; // + estimatedTax

    return { subTotal, shippingCharge, estimatedTax, total, discountAmount };
};

export const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;
