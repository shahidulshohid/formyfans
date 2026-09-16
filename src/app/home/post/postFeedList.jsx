import { Box, CircularProgress, Typography } from "@mui/material";
import PostCardSkeleton from "../../../components/skeleton/PostCardSkeleton";

// Pure rendering of the post/campaign feed — no handlers or state logic
// live here, only the same render conditions that used to live inline
// inside MessageSection.
const PostFeedList = ({
  isLoadingCreatePost,
  isLoadingGetPosts,
  postList,
  posts,
  loaderRef,
  isFetchingMoreRef,
}) => {
  const renderPostSkeletonLoader = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <PostCardSkeleton key={index} />
    ));
  };

  const renderNoPostsFound = () => {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <Typography variant="body1" color="text.neutralGrey">
          No posts found
        </Typography>
      </Box>
    );
  };

  return (
    <>
      {isLoadingCreatePost && <PostCardSkeleton />}

      {isLoadingGetPosts
        ? renderPostSkeletonLoader()
        : isLoadingGetPosts === false && postList?.length === 0
          ? renderNoPostsFound()
          : posts}

      <Box ref={loaderRef} display="flex" justifyContent="center" py={2}>
        {isFetchingMoreRef.current && <CircularProgress size={24} />}
      </Box>
    </>
  );
};

export default PostFeedList;