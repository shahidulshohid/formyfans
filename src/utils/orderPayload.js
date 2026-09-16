import { ESTIMATED_TAX } from "./cartHelpers";

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

/** Totals for a subset of cart items (e.g. one creator's selected lines). */
export const calcOrderTotalsForItems = (items, taxShare = ESTIMATED_TAX) => {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shipping = items.reduce((sum, i) => sum + Number(i.deliveryCharges || 0), 0);
    const discountAmount = items.reduce((sum, i) => {
        const list = Number(i.listUnitPrice ?? i.unitPrice);
        const savings = (list - i.unitPrice) * i.quantity;
        return sum + Math.max(0, savings);
    }, 0);
    // const estimatedTax = roundMoney(taxShare);
    const estimatedTax = 0;
    const total = roundMoney(subtotal + shipping); // + estimatedTax

    return {
        subtotal: roundMoney(subtotal),
        shipping: roundMoney(shipping),
        estimatedTax,
        total,
        discountAmount: roundMoney(discountAmount),
    };
};

export const buildOrderPayload = ({
    creatorId,
    items,
    shipping,
    paymentMethod,
    stripePayment,
    totals,
}) => {
    const payload = {
        creatorId,
        paymentMethod: paymentMethod === "cod" ? "cash_on_delivery" : "online",
        delivery: {
            name: shipping.name?.trim() || "",
            phoneNumber: shipping.phone?.trim() || "",
            city: shipping.city?.trim() || "",
            email: shipping.email?.trim() || "",
            state: shipping.state?.trim() || "",
            zipCode: shipping.zip?.trim() || "",
            deliveryAddress: shipping.address?.trim() || "",
        },
        items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: roundMoney(item.unitPrice * item.quantity),
            size: item.size ? [item.size] : [],
            colour: item.colour ? [item.colour] : [],
        })),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        estimatedTax: totals.estimatedTax,
        total: totals.total,
        discountAmount: totals.discountAmount,
    };

    if (paymentMethod === "online" && stripePayment?.paymentIntentId) {
        payload.stripePaymentIntentId = stripePayment.paymentIntentId;
        payload.paymentAmount = stripePayment.amount ?? totals.total;
    }

    return payload;
};

export const validateShippingForm = (shipping) => {
    const required = ["name", "phone", "city", "email", "address", "state", "zip"];
    const missing = required.filter((key) => !String(shipping[key] || "").trim());
    return missing;
};
