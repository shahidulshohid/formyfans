import { normalizeOrderStatus } from "../constants/orderStatus";

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
};

/** Normalize shop list item or legacy / detail order into one shape */
export const normalizeOrderRecord = (order) => {
    if (!order) return null;

    const details = order.orderDetails ?? order;
    const items = Array.isArray(details.items) ? details.items : Array.isArray(order.items) ? order.items : [];
    const delivery = details.delivery ?? order.delivery ?? {};
    const payment = details.payment ?? order.paymentMethod ?? order.cardDetails;

    const qty = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
    const total = Number(
        details.totalAmount ?? order.totalAmount ?? order.total ?? 0,
    );

    return {
        orderId: order.orderId ?? order._id ?? "—",
        status: order.status,
        placedAt: order.placedAt ?? order.createdAt ?? order.updatedAt,
        billingName:
            delivery.name ||
            order.buyer?.fullName ||
            [order.userId?.firstName, order.userId?.lastName].filter(Boolean).join(" ") ||
            [order.buyer?.firstName, order.buyer?.lastName].filter(Boolean).join(" ") ||
            "—",
        totalAmount: total,
        qty,
        items,
        delivery,
        paymentMethod:
            typeof payment === "string"
                ? payment
                : payment?.method ?? order.paymentMethod ?? "—",
        subtotal: Number(details.subtotal ?? order.subtotal ?? 0),
        shippingCharges: Number(details.shippingCharges ?? order.shippingCharges ?? 0),
        discountAmount: Number(details.discountAmount ?? order.discountAmount ?? 0),
        estimatedTax: Number(details.estimatedTax ?? order.estimatedTax ?? 0),
        buyer: order.buyer,
        raw: order,
    };
};

export const parseOrdersList = (body) => {
    if (!body) return [];
    if (Array.isArray(body.orders)) return body.orders;
    if (Array.isArray(body.data?.orders)) return body.data.orders;
    if (Array.isArray(body)) return body.filter((o) => o?.orderId || o?._id);
    return [];
};

export const extractOrderFromResponse = (body) => {
    if (!body) return null;
    if (body.order && (body.order.orderId || body.order._id)) return body.order;
    if (body.data?.order) return body.data.order;
    if (body.orderId && (body.items || body.orderDetails)) return body;
    if (body._id || body.orderId) return body;
    return null;
};

export const parseOrderDetails = (body) => {
    return normalizeOrderRecord(extractOrderFromResponse(body));
};

export const mapOrderToTableRow = (order) => {
    const n = normalizeOrderRecord(order);
    if (!n) {
        return {
            _id: "unknown",
            orderId: "—",
            billingName: "—",
            orderStatus: "pending",
            totalPricing: "$0.00",
            date: "—",
            qty: "0",
            raw: order,
        };
    }

    return {
        _id: n.orderId,
        orderId: n.orderId,
        billingName: n.billingName,
        orderStatus: n.status || "pending",
        orderStatusValue: normalizeOrderStatus(n.status),
        totalPricing: formatMoney(n.totalAmount),
        date: formatDate(n.placedAt),
        qty: String(n.qty || 0),
        raw: order,
    };
};

export const mapOrderToDetailsView = (order) => {
    const n = normalizeOrderRecord(order);
    if (!n) return null;

    const items = n.items.map((item, index) => {
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        const qty = Number(item.quantity || 1);
        const lineTotal = Number(item.lineTotal ?? unitPrice * qty);
        const sizeLabel = Array.isArray(item.size) ? item.size.join(", ") : item.size;
        const colourLabel = Array.isArray(item.colour) ? item.colour.join(", ") : item.colour;
        const variant =
            sizeLabel || colourLabel
                ? ` (${[sizeLabel, colourLabel].filter(Boolean).join(" / ")})`
                : "";

        return {
            id: `${item.productId}-${index}`,
            name: `${item.product?.name || item.productId || "Product"}${variant}`,
            image: item.product?.images?.[0] || "",
            quantity: qty,
            price: formatMoney(unitPrice),
            total: formatMoney(lineTotal),
        };
    });

    const addressParts = [
        n.delivery.deliveryAddress,
        n.delivery.city,
        n.delivery.state,
        n.delivery.zipCode,
    ].filter(Boolean);

    return {
        orderInfo: {
            orderId: n.orderId,
            idNumber: n.orderId,
            billingName: n.billingName,
            date: n.placedAt
                ? new Date(n.placedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                  })
                : "—",
            trackingId: n.orderId,
        },
        items,
        orderSummary: {
            subTotal: formatMoney(n.subtotal),
            discount: n.discountAmount > 0 ? formatMoney(n.discountAmount) : null,
            shippingCharge: formatMoney(n.shippingCharges),
            estimatedTax: formatMoney(n.estimatedTax),
            total: formatMoney(n.totalAmount),
        },
        status: n.status,
        shippingInfo: {
            name: n.delivery.name || n.billingName,
            address: addressParts.join(", ") || "—",
            phone: n.delivery.phoneNumber || "—",
            mobile: n.delivery.phoneNumber || "—",
        },
        deliveryInfo: {
            paymentType: n.paymentMethod?.replace(/_/g, " ") || "—",
            delivery: "Standard Delivery",
            orderId: n.orderId,
            paymentMode: n.paymentMethod?.replace(/_/g, " ") || "—",
        },
    };
};
