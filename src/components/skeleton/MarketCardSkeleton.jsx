import { Box, Grid } from "@mui/material";

const shimmerOverlayStyles = {
    position: "absolute",
    inset: 0,
    background:
        "linear-gradient(90deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 80%)",
    animation: "market-card-skeleton-shimmer 2.8s ease-in-out infinite",
};

const boneStyles = {
    position: "relative",
    overflow: "hidden",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
};

const ShimmerBone = ({ sx }) => (
    <Box sx={{ ...boneStyles, ...sx }}>
        <Box sx={shimmerOverlayStyles} />
    </Box>
);

const MarketCardSkeletonItem = () => (
    <Box
        sx={{
            position: "relative",
            width: "100%",
            height: { xs: 300, md: 346 },
            borderRadius: "20px",
            overflow: "hidden",
            backgroundColor: "rgba(94, 19, 33, 0.55)",
            boxShadow: "0px 20px 40px rgba(0,0,0,0.45)",
        }}
    >
        <ShimmerBone
            sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
            }}
        />

        <ShimmerBone
            sx={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 28,
                height: 28,
                borderRadius: "50%",
                zIndex: 2,
            }}
        />

        <Box
            sx={{
                position: "absolute",
                inset: 0,
                background:
                    "linear-gradient(to bottom, rgba(217,217,217,0) 30%, rgba(94,19,33,0.9) 100%)",
            }}
        />

        <Box
            sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                px: 2,
                pb: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.25,
            }}
        >
            <ShimmerBone sx={{ width: "55%", height: 22, borderRadius: "6px" }} />
            <ShimmerBone sx={{ width: "35%", height: 18, borderRadius: "6px" }} />
            <ShimmerBone sx={{ width: "80%", height: 11, borderRadius: "4px" }} />
            <ShimmerBone sx={{ width: "65%", height: 11, borderRadius: "4px" }} />
        </Box>
    </Box>
);

const MarketCardSkeleton = ({ count = 4 }) => (
    <Box bgcolor="background.darkBrown" p={1} borderRadius="20px" mt={2}>
        <Grid container spacing={2} mt={2}>
            {Array.from({ length: count }).map((_, index) => (
                <Grid
                    item
                    key={`market-skeleton-${index}`}
                    size={{ xs: 12, sm: 6, md: 3 }}
                    md={3}
                >
                    <MarketCardSkeletonItem />
                </Grid>
            ))}
        </Grid>
    </Box>
);

const shimmerKeyframes = `
@keyframes market-card-skeleton-shimmer {
  0% { transform: translateX(-120%); }
  50% { transform: translateX(110%); }
  100% { transform: translateX(110%); }
}
`;

if (
    typeof document !== "undefined" &&
    !document.getElementById("market-card-skeleton-style")
) {
    const style = document.createElement("style");
    style.id = "market-card-skeleton-style";
    style.innerHTML = shimmerKeyframes;
    document.head.appendChild(style);
}

export default MarketCardSkeleton;
