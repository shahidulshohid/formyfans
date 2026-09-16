import { loadStripe } from "@stripe/stripe-js";

export const stripePublishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").trim();

const PLACEHOLDER_KEYS = new Set([
    "",
    "pk_test_your_publishable_key_here",
    "pk_test_xxxx",
    "pk_test_...",
]);

/** True when a real pk_test_ / pk_live_ key is in .env */
export const isStripeKeyConfigured = () => {
    const key = stripePublishableKey;
    if (!key || PLACEHOLDER_KEYS.has(key)) return false;
    return key.startsWith("pk_test_") || key.startsWith("pk_live_");
};

export const stripePromise = isStripeKeyConfigured() ? loadStripe(stripePublishableKey) : null;

export const stripeAppearance = {
    theme: "stripe",
    variables: {
        colorPrimary: "#FF1572",
        colorBackground: "#ffffff",
        colorText: "#5E1321",
        colorDanger: "#d32f2f",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "8px",
        spacingUnit: "4px",
    },
    rules: {
        ".Input": {
            border: "1px solid rgba(94, 19, 33, 0.25)",
            boxShadow: "none",
            backgroundColor: "#ffffff",
            color: "#5E1321",
        },
        ".Input:focus": {
            border: "1px solid #FF1572",
            boxShadow: "0 0 0 1px #FF1572",
        },
        ".Label": {
            color: "#5E1321",
            fontWeight: "600",
        },
        ".Tab": {
            color: "#5E1321",
        },
        ".Tab--selected": {
            color: "#FF1572",
        },
    },
};
