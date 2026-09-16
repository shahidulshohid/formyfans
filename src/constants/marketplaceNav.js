import CategoryIcon from "../assets/icon/category.svg";
import HeartIcon from "../assets/icon/Heart-white.svg";
import FilterIcon from "../assets/icon/filter.svg";
import ShippingIcon from "../assets/icon/shipping-fast.svg";

export const getUserRole = () => {
    try {
        return JSON.parse(localStorage.getItem("userData"))?.state?.user?.role ?? "user";
    } catch {
        return "user";
    }
};

export const getMarketplaceNavItems = () => {
    const role = getUserRole();
    const isCreator = role === "creator";

    return [
        { icon: CategoryIcon, iconName: "Categories", path: "/market-place" },
        // { icon: HeartIcon, iconName: "Liked Products" },
        // { icon: FilterIcon, iconName: "Filter" },
        ...(isCreator
            ? [{ icon: FilterIcon, iconName: "my listing", path: "/product-listing" }]
            : []),
        { icon: ShippingIcon, iconName: "My Orders", path: "/my-orders" },
    ];
};
