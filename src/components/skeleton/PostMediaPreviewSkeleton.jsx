import { Box, Skeleton } from "@mui/material";

const PostMediaPreviewSkeleton = () => {
  return (
    <Box mt={2}>
      <Box display="flex" gap={1} flexWrap="wrap">
        {Array.from({ length: 1 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 100,
              height: 100,
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Skeleton
              variant="rectangular"
              width={100}
              height={100}
              sx={{
                borderRadius: "10px",
              }}
            />

            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PostMediaPreviewSkeleton;