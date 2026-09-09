import { Box, Skeleton, Stack } from "@mui/material";
import React from "react";

const ExclusiveCardSkeleton = () => {
    return (
        <Box
            boxShadow={"0px 2px 10px rgba(0,0,0,0.08)"}
            sx={{
                backgroundColor: "neutral.white",
                width: "100%",
                overflow: "hidden",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Media placeholder */}
            <Skeleton
                variant="rectangular"
                width="100%"
                height={190}
                animation="wave"
            />

            <Box p={2} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* category */}
                <Skeleton variant="text" width="30%" height={20} sx={{ mb: 0.5 }} />
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={0.5}
                >
                    <Skeleton variant="text" width="60%" height={22} />
                    <Skeleton variant="circular" width={24} height={24} />
                </Stack>
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="90%" height={16} sx={{ mb: 1.5 }} />
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: "auto" }}
                >
                    <Skeleton variant="text" width="30%" height={16} />
                    <Skeleton variant="text" width="25%" height={16} />
                </Stack>
            </Box>
        </Box>
    );
};

export default ExclusiveCardSkeleton;