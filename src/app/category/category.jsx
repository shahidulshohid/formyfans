import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { follow, unfollow } from "../../api/modules/follow";
import { CreatorCard } from "../../components/cards";
import useCreatorsStore from "../../zustand/creatorsStore";
import {
  addToFavorites,
  removeFromFavorites,
} from "../../api/modules/favourite";

const CARD_BUTTON_SX = {
  width: "100%",
  minWidth: 0,
  height: 40,
  borderRadius: "20px",
  backgroundColor: "background.deepPink",
  whiteSpace: "nowrap",
  px: { xs: 0.75, sm: 1 },
  lineHeight: 1,
  fontSize: { xs: "11px", sm: "12px" },
};

const CategorySection = () => {
  const navigate = useNavigate();
  const loaderRef = useRef(null);
  const observerRef = useRef(null);
  const isFetchingMoreRef = useRef(false);

  const {
    creators,
    pagination,
    isLoading,
    isLoadingMore,
    loadMoreCreators,
    setCreators,
    updateCreatorFollow,
    updateCreatorFavorite,
  } = useCreatorsStore();

  const navigateViewPageProfile = (username) => {
    navigate(`/${username}`);
  };

  useEffect(() => {
    isFetchingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          pagination.hasNextPage &&
          !isFetchingMoreRef.current
        ) {
          loadMoreCreators();
        }
      },
      { threshold: 0.1, rootMargin: "120px" },
    );

    const loaderNode = loaderRef.current;
    if (loaderNode) {
      observerRef.current.observe(loaderNode);
    }

    return () => observerRef.current?.disconnect();
  }, [pagination.hasNextPage, loadMoreCreators, creators.length]);

  if (isLoading && creators.length === 0) {
    return (
      <Box
        bgcolor="background.darkBrown"
        p={4}
        borderRadius="20px"
        mt={2}
        display="flex"
        justifyContent="center"
      >
        <CircularProgress sx={{ color: "#FF1572" }} />
      </Box>
    );
  }

  if (!isLoading && creators.length === 0) {
    return (
      <Box bgcolor="background.darkBrown" p={4} borderRadius="20px" mt={2}>
        <Typography color="primary.white" textAlign="center">
          No creators found.
        </Typography>
      </Box>
    );
  }

  const handleFollowUnfollow = async (userId, type = "follow") => {
    if (!userId) return;

    const creator = creators.find((item) => item._id === userId);
    if (!creator) return;

    const previousCreators = creators;
    const nextIsFollowing = type === "follow";
    const currentCount = creator.followersCount ?? 0;
    const nextFollowersCount = Math.max(
      0,
      currentCount + (nextIsFollowing ? 1 : -1),
    );

    updateCreatorFollow(userId, {
      isFollowing: nextIsFollowing,
      followersCount: nextFollowersCount,
    });

    try {
      const response = await (type === "follow"
        ? follow({ userId })
        : unfollow(userId));

      if (response?.data?.status === "success") {
        // toast.success(response.data.message);
      } else {
        setCreators(previousCreators);
        // toast.error(response?.data?.message || "Action failed");
      }
    } catch {
      setCreators(previousCreators);
      // toast.error("Something went wrong, please try again");
    }
  };

  const handleFavoriteUnfavorite = async (userId, type = "favorite") => {
    if (!userId) return;

    const creator = creators.find((item) => item._id === userId);
    if (!creator) return;

    const previousCreators = creators;
    const nextIsFavorite = type === "favorite";

    updateCreatorFavorite(userId, {
      isFavourite: nextIsFavorite,
    });

    try {
      const response = await (type === "favorite"
        ? addToFavorites({ favouriteUserId: userId })
        : removeFromFavorites(userId));

      if (response?.data?.status === "success") {
        // toast.success(response.data.message);
      } else {
        setCreators(previousCreators);
        // toast.error(response?.data?.message || "Action failed");
      }
    } catch {
      setCreators(previousCreators);
      // toast.error("Something went wrong, please try again");
    }
  };
  return (
    <Box
      bgcolor="background.darkBrown"
      p={{ xs: 2, md: 3 }}
      borderRadius="20px"
      mt={2}
    >
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {creators.map((item, index) => {
          const isFollowing = item.isFollowing ?? false;
          const isFavourite = item.isFavourite ?? false;
          return (
            <Grid
              key={item._id || item.username || index}
              size={{ xs: 12, sm: 6, md: 3 }}
            >
              <CreatorCard
                item={item}
                isFollowing={isFollowing}
                isFavourite={isFavourite}
                navigateViewPageProfile={navigateViewPageProfile}
                handleFollowUnfollow={handleFollowUnfollow}
                handleFavoriteUnfavorite={handleFavoriteUnfavorite}
              />
            </Grid>
          );
        })}
      </Grid>

      <Box
        ref={loaderRef}
        py={3}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={48}
      >
        {isLoadingMore && (
          <CircularProgress size={28} sx={{ color: "#FF1572" }} />
        )}
      </Box>
    </Box>
  );
};

export default CategorySection;
