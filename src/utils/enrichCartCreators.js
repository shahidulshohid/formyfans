import { fetchProductVariantsApi } from "../api/modules/productsList";
import {
    getCreatorInfo,
    needsCreatorEnrichment,
    resolveProductFromApi,
} from "./cartHelpers";

export const enrichCartCreatorNames = async (items) => {
    const updates = {};
    const registry = {};

    const toEnrich = items.filter(needsCreatorEnrichment);
    const uniqueProductIds = [...new Set(toEnrich.map((i) => i.productId).filter(Boolean))];

    await Promise.all(
        uniqueProductIds.map(async (productId) => {
            try {
                const res = await fetchProductVariantsApi(productId);
                if (res?.status < 200 || res?.status >= 300) return;

                const data = res?.data?.data ?? res?.data;
                const product = resolveProductFromApi(data);
                if (!product) return;

                const { creatorId, creatorName } = getCreatorInfo(product.creatorId, registry);
                if (creatorName && creatorName !== "Creator") {
                    registry[creatorId] = creatorName;
                }

                items
                    .filter((i) => i.productId === productId)
                    .forEach((item) => {
                        updates[item.cartItemId] = { creatorId, creatorName };
                    });
            } catch {
                // skip failed product
            }
        }),
    );

    return { updates, registry };
};
