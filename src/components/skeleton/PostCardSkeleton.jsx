import {
    Avatar,
    Box,
    Divider,
    Skeleton,
    Stack,
  } from "@mui/material";
  
  const PostCardSkeleton = () => {
    return (
      <Box
        bgcolor="background.lightgray"
        borderRadius="10px"
        mt={2}
        overflow="hidden"
      >
        {/* Header */}
        <Box display="flex" gap={1.5} p={2}>
          <Skeleton variant="circular" width={50} height={50} />
  
          <Stack spacing={0.5}>
            <Skeleton variant="text" width={140} height={24} />
            <Skeleton variant="text" width={80} height={16} />
          </Stack>
        </Box>
  
        {/* Caption */}
        <Box px={2} py={1}>
          <Skeleton variant="text" width="95%" height={22} />
          <Skeleton variant="text" width="80%" height={22} />
        </Box>
  
        {/* Media */}
        <Skeleton
          variant="rectangular"
          width="100%"
          height={350}
          sx={{
            mt: 1,
          }}
        />
  
        {/* Actions */}
        <Stack
          direction="row"
          alignItems="center"
          gap={4}
          px={2}
          py={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={30} />
          </Stack>
  
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={30} />
          </Stack>
  
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={30} />
          </Stack>
        </Stack>
  
        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
  
        {/* Comment Input */}
        <Box p={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="circular" width={40} height={40} />
  
            <Skeleton
              variant="rounded"
              width="100%"
              height={45}
              sx={{ borderRadius: "10px" }}
            />
          </Stack>
        </Box>
      </Box>
    );
  };
  
  export default PostCardSkeleton;