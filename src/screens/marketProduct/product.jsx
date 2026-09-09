import { Box, Container, Typography, Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useProductList } from "../../hook/productList";
import MicImage from "../../assets/icon/mic.jpg";
import StarIcon from "../../assets/icon/star.svg";
import { PRODUCT_COLOURS } from "../../components/productForm/constants";
import ProductDetailSkeleton from "../../components/skeleton/ProductDetailSkeleton";
import useCartStore from "../../zustand/cartStore";
import { toast } from "react-toastify";

const resolveApiProduct = (state) => {
    const detail = state?.productDetail;
    if (detail?.product) return detail.product;
    if (detail?.productId || detail?.name) return detail;
    if (detail?._id) return detail;

    const product = state?.product;
    if (product?.productId || product?.name) return product;
    if (product?._id) return product;
    return product?.raw ?? null;
};

function Product() {
    const { productCode: productCodeParam } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchProductVariants, detailLoading } = useProductList();
    const addToCart = useCartStore((s) => s.addToCart);
    const [fetchedDetail, setFetchedDetail] = useState(null);
    const [detailReady, setDetailReady] = useState(false);

    useEffect(() => {
        const code = productCodeParam;
        if (!code) {
            setDetailReady(true);
            return;
        }

        let cancelled = false;
        setDetailReady(false);
        setFetchedDetail(null);

        (async () => {
            const res = await fetchProductVariants(decodeURIComponent(code));
            if (cancelled) return;
            if (res?.success) {
                setFetchedDetail(res.data);
            }
            setDetailReady(true);
        })();

        return () => {
            cancelled = true;
        };
    }, [productCodeParam, fetchProductVariants]);

    const apiProduct = useMemo(() => {
        const fromFetch = resolveApiProduct({ productDetail: fetchedDetail });
        if (fromFetch) return fromFetch;
        return resolveApiProduct(location.state);
    }, [fetchedDetail, location.state]);

    const variants = useMemo(
        () => (Array.isArray(apiProduct?.variants) ? apiProduct.variants : []),
        [apiProduct],
    );

    const isVariant =
        apiProduct?.productType === "variant" && variants.length > 0;

    const sizes = useMemo(() => {
        const list = [...new Set(variants.map((v) => v.size).filter(Boolean))];
        return list;
    }, [variants]);

    const colors = useMemo(() => {
        const labels = [...new Set(variants.map((v) => v.colour).filter(Boolean))];
        return labels.map((label) => {
            const found = PRODUCT_COLOURS.find((c) => c.label === label);
            return { name: label, hex: found ? `#${found.hex}` : "#cccccc" };
        });
    }, [variants]);

    const images = useMemo(() => {
        const list = apiProduct?.images?.filter(Boolean);
        return list?.length ? list : [MicImage];
    }, [apiProduct]);

    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [mainImageIndex, setMainImageIndex] = useState(0);

    useEffect(() => {
        if (!apiProduct) return;
        setSelectedSize(sizes[0] ?? "");
        setSelectedColor(colors[0]?.name ?? "");
        setQuantity(1);
        setMainImageIndex(0);
    }, [apiProduct?.productId ?? apiProduct?._id, sizes, colors]);

    const selectedVariant = useMemo(() => {
        if (!isVariant) return null;
        const match = variants.find((v) => {
            const sizeOk = !sizes.length || v.size === selectedSize;
            const colourOk = !colors.length || v.colour === selectedColor;
            return sizeOk && colourOk;
        });
        return match ?? variants[0];
    }, [isVariant, variants, selectedSize, selectedColor, sizes.length, colors.length]);

    const displayPrice = useMemo(() => {
        if (selectedVariant?.totalPrice != null) {
            return Number(selectedVariant.totalPrice);
        }
        return Number(apiProduct?.totalPrice ?? apiProduct?.minPrice ?? 0);
    }, [selectedVariant, apiProduct]);

    const maxQuantity = Math.max(
        1,
        Number(selectedVariant?.quantity ?? apiProduct?.quantity ?? 1),
    );

    const STATIC_RATING = 3;

    useEffect(() => {
        setQuantity((q) => Math.min(q, maxQuantity));
    }, [maxQuantity, selectedVariant?._id]);

    const handleQuantityChange = (type) => {
        if (type === "increase" && quantity < maxQuantity) {
            setQuantity((q) => q + 1);
        } else if (type === "decrease" && quantity > 1) {
            setQuantity((q) => q - 1);
        }
    };

    const handleAddToCart = () => {
        if (isVariant && !selectedVariant) {
            toast.error("Please select size and colour");
            return;
        }

        addToCart({
            product: apiProduct,
            variant: selectedVariant,
            quantity,
            image: images[mainImageIndex],
        });
        toast.success("Added to cart");
        navigate("/cart");
    };

    if (detailLoading || !detailReady) {
        return <ProductDetailSkeleton />;
    }

    if (!apiProduct) {
        return (
            <Container maxWidth="lg">
                <Box mt={4} textAlign="center" py={6}>
                    <Typography color="#5E1321" fontWeight={600} mb={2}>
                        Product not found
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/market-place")}>
                        Back to marketplace
                    </Button>
                </Box>
            </Container>
        );
    }

    const mainImage = images[mainImageIndex] ?? images[0];

    return (
        <Container maxWidth="lg">
            <Box mt={4}>
                <Box
                    display="flex"
                    gap={{ xs: 2, sm: 3, md: 4 }}
                    flexDirection={{ xs: "column", md: "row" }}
                    px={{ xs: 1, sm: 2, md: 0 }}
                >
                    <Box flex={1} minWidth={0} sx={{ width: "100%" }}>
                        <Box
                            component="img"
                            src={mainImage}
                            alt={apiProduct.name}
                            sx={{
                                display: "block",
                                width: "100%",
                                maxWidth: "100%",
                                height: { xs: 280, sm: 360, md: 500 },
                                objectFit: "cover",
                                borderRadius: "20px",
                                mb: images.length > 1 ? 2 : 0,
                            }}
                        />

                        {images.length > 1 ? (
                            <Box display="flex" gap={1.5} flexWrap="wrap">
                                {images.map((img, index) => (
                                    <Box
                                        key={`${img}-${index}`}
                                        component="img"
                                        src={img}
                                        alt={`${apiProduct.name} ${index + 1}`}
                                        onClick={() => setMainImageIndex(index)}
                                        sx={{
                                            width: { xs: 72, sm: 88, md: 100 },
                                            height: { xs: 72, sm: 88, md: 100 },
                                            minWidth: { xs: 72, sm: 88, md: 100 },
                                            objectFit: "cover",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            border: "2px solid",
                                            borderColor:
                                                mainImageIndex === index
                                                    ? "#FF1572"
                                                    : "#E8E8E8",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                ))}
                            </Box>
                        ) : null}
                    </Box>

                    <Box flex={1}>
                        <Box mb={3}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Typography
                                    sx={{
                                        fontSize: { xs: "20px", md: "32px" },
                                        fontWeight: 600,
                                        color: "#5E1321",
                                    }}
                                >
                                    {apiProduct.name}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <img
                                            key={star}
                                            src={StarIcon}
                                            alt="star"
                                            width={16}
                                            height={16}
                                            style={{
                                                opacity: star <= STATIC_RATING ? 1 : 0.25,
                                            }}
                                        />
                                    ))}
                                    <Typography
                                        component="span"
                                        fontSize={14}
                                        fontWeight={600}
                                        color="#8E8E8E"
                                        ml={0.5}
                                    >
                                        {STATIC_RATING}.0
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography
                                sx={{
                                    fontSize: { xs: "12px", md: "14px" },
                                    color: "#8E8E8E",
                                    lineHeight: 1.5,
                                }}
                            >
                                {apiProduct.productDetails}
                            </Typography>
                        </Box>

                        <Typography sx={{ fontSize: "10px", color: "#8E8E8E" }}>
                            Total Price
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "24px",
                                fontWeight: 600,
                                color: "#5E1321",
                                mb: 1.5,
                            }}
                        >
                            ${displayPrice.toFixed(2)}
                        </Typography>

                        {sizes.length > 0 ? (
                            <Box mb={3}>
                                <Typography
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        color: "#FF1572",
                                        mb: 1.5,
                                    }}
                                >
                                    Select Size
                                </Typography>
                                <Box display="flex" gap={2} flexWrap="wrap">
                                    {sizes.map((size) => (
                                        <Box
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            sx={{
                                                width: 50,
                                                height: 50,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: "1px solid #74002E",
                                                borderRadius: "10px",
                                                cursor: "pointer",
                                                fontWeight: 600,
                                                fontSize: "24px",
                                                color:
                                                    selectedSize === size
                                                        ? "#FFFFFF"
                                                        : "#FF1572",
                                                backgroundColor:
                                                    selectedSize === size
                                                        ? "#74002E"
                                                        : "transparent",
                                            }}
                                        >
                                            {size}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ) : null}

                        {colors.length > 0 ? (
                            <Box mb={3}>
                                <Typography
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        color: "#FF1572",
                                        mb: 1.5,
                                    }}
                                >
                                    Select Colour
                                </Typography>
                                <Box display="flex" gap={2} flexWrap="wrap">
                                    {colors.map((color) => (
                                        <Box
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            sx={{
                                                width: 50,
                                                height: 50,
                                                backgroundColor: color.hex,
                                                borderRadius: "12px",
                                                cursor: "pointer",
                                                border:
                                                    selectedColor === color.name
                                                        ? "2px solid #74002E"
                                                        : "2px solid transparent",
                                            }}
                                            title={color.name}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ) : null}

                        <Box mb={3}>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#FF1572",
                                    mb: 1.5,
                                }}
                            >
                                Quantity
                                <Typography
                                    component="span"
                                    fontSize={12}
                                    color="#8E8E8E"
                                    ml={1}
                                >
                                    (max {maxQuantity})
                                </Typography>
                            </Typography>
                            <Box
                                display="flex"
                                alignItems="center"
                                sx={{
                                    border: "1px solid #74002E",
                                    borderRadius: "10px",
                                    width: { xs: "100px", md: "120px" },
                                    height: { xs: "36px", md: "40px" },
                                    overflow: "hidden",
                                }}
                            >
                                <Button
                                    onClick={() => handleQuantityChange("decrease")}
                                    sx={{
                                        minWidth: 40,
                                        color: "#5E1321",
                                        fontSize: "20px",
                                    }}
                                >
                                    −
                                </Button>
                                <Typography
                                    sx={{
                                        flex: 1,
                                        textAlign: "center",
                                        fontWeight: 600,
                                        color: "#FF1572",
                                    }}
                                >
                                    {String(quantity).padStart(2, "0")}
                                </Typography>
                                <Button
                                    onClick={() => handleQuantityChange("increase")}
                                    disabled={quantity >= maxQuantity}
                                    sx={{
                                        minWidth: 40,
                                        color: "#5E1321",
                                        fontSize: "20px",
                                    }}
                                >
                                    +
                                </Button>
                            </Box>
                        </Box>

                        <Box display="flex" gap={2} mb={4}>
                            <Button
                                variant="contained"
                                sx={{
                                    flex: 1,
                                    borderRadius: "22px",
                                    textTransform: "none",
                                    height: 48,
                                }}
                                onClick={handleAddToCart}
                            >
                                Add to cart
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    flex: 1,
                                    borderColor: "#5E1321",
                                    color: "#E2007E",
                                    borderRadius: "22px",
                                    textTransform: "none",
                                    height: 48,
                                }}
                            >
                                Buy Now
                            </Button>
                        </Box>

                        <Typography
                            sx={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#FF1572",
                                mb: 1,
                            }}
                        >
                            Product Details
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "12px",
                                color: "#8E8E8E",
                                lineHeight: 1.5,
                            }}
                        >
                            {apiProduct.productDetails}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}

export default Product;
