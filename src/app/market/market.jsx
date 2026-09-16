import { Box, Grid, Typography } from "@mui/material";
import HeartIcon from "../../assets/icon/heart.svg";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MarketCardSkeleton from "../../components/skeleton/MarketCardSkeleton";

const formatPrice = (price) => {
    if (price == null || price === "") return "—";
    if (typeof price === "string" && price.includes("$")) return price;
    const num = Number(price);
    return Number.isNaN(num) ? String(price) : `$${num.toFixed(2)}`;
};

const Market = ({ data, loading }) => {
    const navigate = useNavigate();

    const products = Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data)
          ? data
          : [];

    const cards = products.map((item) => ({
        id: item._id,
        productId: item.productId,
        icon: item.images?.[0],
        name: item.name,
        price: formatPrice(item.totalPrice ?? item.minPrice),
        description: item.productDetails,
        productType: item.productType,
        raw: item,
    }));

    const handleProductClick = (item) => {
        const productId = item.productId ?? item.raw?.productId;
        const urlSegment = productId || item.id;

        if (!urlSegment || !item.raw) {
            toast.error("Product not found");
            return;
        }

        navigate(`/market-product/${encodeURIComponent(urlSegment)}`, {
            state: { product: item.raw },
        });
    };

    if (loading && cards.length === 0) {
        return <MarketCardSkeleton count={4} />;
    }

    if (!loading && cards.length === 0) {
        return (
            <Box bgcolor="background.darkBrown" p={3} borderRadius="20px" mt={2}>
                <Typography color="primary.white" textAlign="center">
                    No products found
                </Typography>
            </Box>
        );
    }

    return (
        <Box bgcolor="background.darkBrown" p={1} borderRadius="20px" mt={2}>
            <Grid container spacing={2} mt={2}>
                {cards.map((item) => (
                    <Grid
                        item
                        key={item.productId ?? item.id}
                        size={{ xs: 12, sm: 6, md: 3 }}
                        md={3}
                        onClick={() => handleProductClick(item)}
                        sx={{ cursor: "pointer" }}
                    >
                        <Box
                            sx={{
                                position: "relative",
                                backgroundImage: `url(${item.icon})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                width: "100%",
                                height: { xs: 300, md: 346 },
                                borderRadius: "20px",
                                overflow: "hidden",
                                boxShadow: "0px 20px 40px rgba(0,0,0,0.45)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    "& .gradient-overlay": {
                                        opacity: 0,
                                    },
                                    "& .content-box": {
                                        opacity: 0,
                                    },
                                },
                            }}
                        >
                            <Box
                                className="gradient-overlay"
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                        "linear-gradient(to bottom, rgba(217,217,217,0) 30%, rgba(94,19,33,1) 100%)",
                                    transition: "opacity 0.3s ease",
                                }}
                            />

                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 12,
                                    right: 12,
                                    zIndex: 2,
                                }}
                            >
                                <img src={HeartIcon} alt="like" />
                            </Box>

                            <Box
                                className="content-box"
                                sx={{
                                    position: "relative",
                                    height: "100%",
                                    px: 2,
                                    textAlign: "center",
                                    mt: 25,
                                    transition: "opacity 0.3s ease",
                                }}
                            >
                                <Typography color="primary.white" fontWeight={600} fontSize={22}>
                                    {item.name}
                                </Typography>

                                <Typography color="text.deepPink" fontSize={18} fontWeight={600}>
                                    {item.price}
                                </Typography>

                                <Typography color="primary.white" fontSize={11}>
                                    {item.description}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Market;
