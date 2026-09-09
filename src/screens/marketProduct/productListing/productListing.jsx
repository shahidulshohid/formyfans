import { Box, Typography, CircularProgress } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../components/header";
import Table from "../../../components/table";
import Sidebar from "../../../components/sidebar";
import MarketplaceNavBar from "../../../components/marketplace/MarketplaceNavBar";
import useProducts from "../../../hook/products";
import { getCreatorId, getProductId, mapProductToTableRow } from "../../../components/productForm/constants";
import ConfirmPopup from "../../../components/pops";

const ProductListing = () => {
    const navigate = useNavigate();
    const [deleteTarget, setDeleteTarget] = useState(null);
    const {
        products,
        loading,
        fetchProducts,
        updateProductStatus,
        deleteProduct,
        deleteLoadingId,
    } = useProducts();

    const loadProducts = useCallback(() => {
        const creatorId = getCreatorId();
        if (!creatorId) {
            toast.error("Please log in to view your products.");
            return;
        }
        fetchProducts({ creatorId });
    }, [fetchProducts]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const tableData = useMemo(
        () => products.map(mapProductToTableRow),
        [products],
    );

    const handleToggleStatus = async (row) => {
        const productId = getProductId(row.raw) ?? row.productId ?? row._id;
        if (!productId) return;
        const nextStatus = row.status ? "inactive" : "active";
        const response = await updateProductStatus(productId, nextStatus);
        if (response?.success) loadProducts();
    };

    const handleEdit = (row) => {
        const productId = getProductId(row.raw) ?? row.productId ?? row._id;
        navigate(`/create-product?id=${productId}`, {
            state: { product: row.raw },
        });
    };

    const handleDeleteClick = (row) => {
        setDeleteTarget(row);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        const productId = getProductId(deleteTarget.raw) ?? deleteTarget.productId ?? deleteTarget._id;
        const response = await deleteProduct(productId);
        if (response?.success) {
            setDeleteTarget(null);
            loadProducts();
        }
    };

    const menuItems = [
        { label: "Product List", path: "/product-listing" },
        { label: "Create Product", path: "/create-product" },
        { label: "Orders List", path: "/order-listing" },
    ];

    const tableHeaders = [
        { key: "products", label: "Products", flex: 1.4 },
        { key: "productDetails", label: "Product Details", flex: 1.5 },
        { key: "category", label: "Category", flex: 0.9 },
        { key: "totalPrice", label: "Total Price", flex: 1 },
        { key: "totalQuantity", label: "Total Quantity", flex: 0.9 },
        { key: "status", label: "Status", flex: 0.8, align: "center" },
        { key: "actions", label: "Actions", flex: 0.9, align: "center" },
    ];

    return (
        <Box>
            <Header />
            <Box sx={{ boxSizing: "border-box", padding: 2 }}>
                <MarketplaceNavBar activePath="/product-listing" />

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        minHeight: "calc(100vh - 64px)",
                    }}
                >
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <Sidebar menuItems={menuItems} activeItem="Product List" />
                    </Box>

                    <Box sx={{ flex: 1, bgcolor: "#F5F5F5", minWidth: 0, overflow: "auto" }}>
                        <Typography
                            fontSize={18}
                            fontWeight={600}
                            color="#5E1321"
                            mb={2}
                            px={{ xs: 2, md: 3 }}
                            py={2}
                        >
                            List of Products
                        </Typography>
                        <Box sx={{ overflowX: "auto", px: { xs: 2, md: 3 }, pb: 3 }}>
                            {loading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                                    <CircularProgress sx={{ color: "#FF1572" }} />
                                </Box>
                            ) : (
                                <Table
                                    headers={tableHeaders}
                                    data={tableData}
                                    onToggleStatus={handleToggleStatus}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteClick}
                                    deleteLoadingId={deleteLoadingId}
                                    sx={{
                                        width: { xs: "max-content", md: "100%" },
                                        minWidth: { xs: 900, md: "auto" },
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <ConfirmPopup
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Product?"
                message={
                    deleteTarget
                        ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
                        : ""
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                loading={
                    deleteLoadingId ===
                    (getProductId(deleteTarget?.raw) ?? deleteTarget?.productId ?? deleteTarget?._id)
                }
                variant="delete"
            />
        </Box>
    );
};

export default ProductListing;
