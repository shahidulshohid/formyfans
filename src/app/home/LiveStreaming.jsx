import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  dismissFollowersSuggestion,
  follow,
  getFollowersSuggestions,
  unfollow,
} from "../../api/modules/follow";
import LiveStreamingIcon from "../../assets/icon/liveStream.svg";
import { FollowerSuggestionCard } from "../../components/cards/FollowerSuggestionCard";
import useUserStore from "../../zustand/userUserStore";
import CustomButton from "../../components/cutomButon";

const INITIAL_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const INITIAL_LOADING = {
  getFollowersSuggestions: true,
  loadMoreFollowersSuggestions: false,
};

import { DUMMY_SUGGESTIONS } from "../../constants/dummyAuth";

const LiveStreaming = () => {
  const navigate = useNavigate();
  const { user, setUserData } = useUserStore();
  const [isLoading, setIsLoading] = useState({
    getFollowersSuggestions: false,
    loadMoreFollowersSuggestions: false,
  });
  const [followersSuggestions, setFollowersSuggestions] = useState(DUMMY_SUGGESTIONS);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);

  const handleGetFollowersSuggestions = async ({
    page = 1,
    isLoadMore = false,
  } = {}) => {
    try {
      const response = await getFollowersSuggestions({
        page,
        limit: pagination.limit,
      });

      if (response?.status === 200 || response?.status === 201) {
        const body = response?.data ?? {};
        const followersSuggestionsList = body?.data ?? [];
        const paginationData = body?.pagination ?? {};

        if (Array.isArray(followersSuggestionsList) && followersSuggestionsList.length > 0) {
          setFollowersSuggestions((prev) =>
            isLoadMore
              ? [...prev, ...followersSuggestionsList]
              : followersSuggestionsList,
          );
        }
        setPagination((prev) => ({
          ...prev,
          ...paginationData,
          page,
          limit: paginationData?.limit || prev.limit,
        }));
      }
    } catch {
      // Backend offline: keep DUMMY_SUGGESTIONS
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        getFollowersSuggestions: false,
        loadMoreFollowersSuggestions: false,
      }));
    }
  };

  const handleLoadMoreFollowersSuggestions = () => {
    if (!pagination.hasNextPage || isLoading.loadMoreFollowersSuggestions)
      return;
    handleGetFollowersSuggestions({
      page: pagination.page + 1,
      isLoadMore: true,
    });
  };

  useEffect(() => {
    handleGetFollowersSuggestions({ page: 1 });
  }, []);

  const handleFollowUnfollow = async (userId, type = "follow") => {
    const previousFollowersSuggestions = followersSuggestions;
    const followerSuggestion = followersSuggestions.find(
      (item) => item.follower._id === userId,
    );
    if (!followerSuggestion) return;
    setFollowersSuggestions((prev) =>
      prev.map((item) =>
        item.follower._id === userId
          ? { ...item, isFollowing: type === "follow" }
          : item,
      ),
    );
    const currentUser = useUserStore.getState().user;
    setUserData({
      ...currentUser,
      followingCount: currentUser.followingCount + (type === "follow" ? 1 : -1),
    });

    try {
      const response = await (type === "follow"
        ? follow({ userId })
        : unfollow(userId));

      if (response?.data?.status === "success") {
        toast.success(
          type === "follow"
            ? "Followed successfully"
            : "Unfollowed successfully",
        );
      } else {
        toast.error(
          type === "follow" ? "Could not follow" : "Could not unfollow",
        );
        setFollowersSuggestions(previousFollowersSuggestions);
        const currentUser = useUserStore.getState().user;
        setUserData({
          ...currentUser,
          followingCount:
            currentUser.followingCount - (type === "follow" ? 1 : 0),
        });
      }
    } catch {
      setFollowersSuggestions(previousFollowersSuggestions);
      toast.error(
        type === "follow" ? "Could not follow" : "Could not unfollow",
      );
      const currentUser = useUserStore.getState().user;
      setUserData({
        ...currentUser,
        followingCount:
          currentUser.followingCount - (type === "follow" ? 1 : 0),
      });
    }
  };

  const handleRemove = async (userId) => {
    const previousFollowersSuggestions = followersSuggestions;
    const followerSuggestion = followersSuggestions.find(
      (item) => item.follower._id === userId,
    );
    if (!followerSuggestion) return;
    setFollowersSuggestions((prev) =>
      prev.filter((item) => item.follower._id !== userId),
    );

    try {
      const response = await dismissFollowersSuggestion({
        dismissedUserId: userId,
      });
      if (response?.data?.status === "success") {
        toast.success("Followers suggestion removed successfully");
      } else {
        toast.error("Could not remove followers suggestion");
        setFollowersSuggestions(previousFollowersSuggestions);
      }
    } catch {
      setFollowersSuggestions(previousFollowersSuggestions);
      toast.error("Could not remove followers suggestion");
    }
  };

  const renderFollowersSuggestions = useMemo(() => {
    return followersSuggestions.map((followerSuggestion) => (
      <FollowerSuggestionCard
        key={followerSuggestion._id}
        item={followerSuggestion.follower}
        createdAt={followerSuggestion.createdAt}
        isFollowing={followerSuggestion.isFollowing}
        handleFollowUnfollow={handleFollowUnfollow}
        handleRemove={handleRemove}
        // handleFollowUnfollow={handleFollowUnfollow}
      />
    ));
  }, [followersSuggestions]);

  return (
    <>
      <Box mt={{ xs: 1, md: 4 }}>
        <Box
          bgcolor={"background.deepPink"}
          borderRadius={"30px"}
          px={3}
          py={1}
          onClick={() => navigate("/live-streams")}
          sx={{ cursor: "pointer" }}
        >
          <Box
            display={"flex"}
            justifyContent={"center"}
            gap={"20px"}
            alignItems={"center"}
          >
            <Box>
              <img src={LiveStreamingIcon} />
            </Box>
            <Box>
              <Typography
                color="text.darkBrown"
                fontSize={"14px"}
                fontWeight={700}
              >
                Live STREAMING
              </Typography>
            </Box>
          </Box>
        </Box>

        <Stack
          gap={1}
          mt={2}
          p={1}
          py={3}
          bgcolor={"primary.main"}
          borderRadius={"20px"}
          width={"100%"}
        >
          {/* {renderFollowersSuggestions} */}
          {isLoading.getFollowersSuggestions ? (
            <Stack mt={2} justifyContent="center" alignItems="center">
              <CircularProgress size={28} sx={{ color: "#FF1572" }} />
            </Stack>
          ) : followersSuggestions.length === 0 &&
            !isLoading.getFollowersSuggestions ? (
            <Stack mt={2} justifyContent="center" alignItems="center">
              <Typography variant="body1" color="text.white" fontWeight={400}>
                No followers suggestions found
              </Typography>
            </Stack>
          ) : (
            renderFollowersSuggestions
          )}
          {pagination.hasNextPage && (
            <Stack mt={2} justifyContent="center" alignItems="center">
              <CustomButton
                title="Load More"
                handleClickBtn={handleLoadMoreFollowersSuggestions}
                disabled={isLoading.loadMoreFollowersSuggestions}
                loading={isLoading.loadMoreFollowersSuggestions}
              />
            </Stack>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default LiveStreaming;
