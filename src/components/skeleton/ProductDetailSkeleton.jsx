import { Box, Container } from "@mui/material";

const shimmerOverlayStyles = {
    position: "absolute",
    inset: 0,
    background:
        "linear-gradient(90deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 80%)",
    animation: "market-card-skeleton-shimmer 2.8s ease-in-out infinite",
};

const boneStyles = {
    position: "relative",
    overflow: "hidden",
    borderRadius: "8px",
    backgroundColor: "rgba(213, 216, 220, 0.75)",
};

const ShimmerBone = ({ sx }) => (
    <Box sx={{ ...boneStyles, ...sx }}>
        <Box sx={shimmerOverlayStyles} />
    </Box>
);

const ProductDetailSkeleton = () => (
    <Container maxWidth="lg">
        <Box mt={4} px={{ xs: 1, sm: 2, md: 0 }}>
            <Box
                display="flex"
                gap={{ xs: 2, sm: 3, md: 4 }}
                flexDirection={{ xs: "column", md: "row" }}
            >
                <Box flex={1} minWidth={0}>
                    <ShimmerBone
                        sx={{
                            width: "100%",
                            height: { xs: 280, sm: 360, md: 500 },
                            borderRadius: "20px",
                            mb: 2,
                        }}
                    />
                    <Box display="flex" gap={1.5} flexWrap="wrap">
                        {[0, 1, 2].map((i) => (
                            <ShimmerBone
                                key={i}
                                sx={{
                                    width: { xs: 72, sm: 88, md: 100 },
                                    height: { xs: 72, sm: 88, md: 100 },
                                    borderRadius: "12px",
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                <Box flex={1}>
                    <ShimmerBone sx={{ width: "70%", height: 36, borderRadius: "8px", mb: 1.5 }} />
                    <ShimmerBone sx={{ width: "40%", height: 20, borderRadius: "6px", mb: 2 }} />
                    <ShimmerBone sx={{ width: "100%", height: 14, borderRadius: "4px", mb: 1 }} />
                    <ShimmerBone sx={{ width: "95%", height: 14, borderRadius: "4px", mb: 1 }} />
                    <ShimmerBone sx={{ width: "80%", height: 14, borderRadius: "4px", mb: 3 }} />

                    <ShimmerBone sx={{ width: "30%", height: 12, borderRadius: "4px", mb: 1 }} />
                    <ShimmerBone sx={{ width: "25%", height: 32, borderRadius: "6px", mb: 3 }} />

                    <ShimmerBone sx={{ width: "35%", height: 18, borderRadius: "4px", mb: 1.5 }} />
                    <Box display="flex" gap={2} mb={3}>
                        {[0, 1, 2, 3].map((i) => (
                            <ShimmerBone
                                key={i}
                                sx={{ width: 50, height: 50, borderRadius: "10px" }}
                            />
                        ))}
                    </Box>

                    <ShimmerBone sx={{ width: "40%", height: 18, borderRadius: "4px", mb: 1.5 }} />
                    <Box display="flex" gap={2} mb={3}>
                        {[0, 1, 2, 3].map((i) => (
                            <ShimmerBone
                                key={i}
                                sx={{ width: 50, height: 50, borderRadius: "12px" }}
                            />
                        ))}
                    </Box>

                    <ShimmerBone sx={{ width: "45%", height: 18, borderRadius: "4px", mb: 1.5 }} />
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <ShimmerBone sx={{ width: 120, height: 44, borderRadius: "10px" }} />
                    </Box>

                    <ShimmerBone
                        sx={{
                            width: "100%",
                            maxWidth: 280,
                            height: 48,
                            borderRadius: "12px",
                        }}
                    />
                </Box>
            </Box>
        </Box>
    </Container>
);

export default ProductDetailSkeleton;
