import { Box, Skeleton } from "@mui/material";

const StoryRowItemSkeleton = () => (
  <Box sx={{ width: 70, textAlign: "center", flexShrink: 0 }}>
    <Skeleton variant="circular" width={70} height={70} />
    <Skeleton
      variant="text"
      width={56}
      height={16}
      sx={{ mx: "auto", mt: 0.5 }}
    />
  </Box>
);

const StoryRowSkeleton = ({ count = 6 }) =>
  Array.from({ length: count }).map((_, index) => (
    <StoryRowItemSkeleton key={`story-row-skeleton-${index}`} />
  ));

export default StoryRowSkeleton;
