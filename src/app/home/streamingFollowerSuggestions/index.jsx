import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  dismissFollowersSuggestion,
  follow,
  getFollowersSuggestions,
  unfollow,
} from "../../../api/modules/follow";
import LiveStreamingIcon from "../../../assets/icon/liveStream.svg";
import { FollowerSuggestionCard } from "../../../components/cards/FollowerSuggestionCard";
import useUserStore from "../../../zustand/userUserStore";
import CustomButton from "../../../components/cutomButon";
import { Star } from "lucide-react";

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

const StreamingFollowerSuggestions = () => {
  const navigate = useNavigate();
  const { user, setUserData } = useUserStore();
  const [isLoading, setIsLoading] = useState(INITIAL_LOADING);
  const [followersSuggestions, setFollowersSuggestions] = useState([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);

  const handleGetFollowersSuggestions = async ({
    page = 1,
    isLoadMore = false,
  } = {}) => {
    try {
      setIsLoading((prev) => ({
        ...prev,
        getFollowersSuggestions: !isLoadMore,
        loadMoreFollowersSuggestions: isLoadMore,
      }));

      const response = await getFollowersSuggestions({
        page,
        limit: pagination.limit,
      });

      if (response?.status === 200 || response?.status === 201) {
        const body = response?.data ?? {};
        const followersSuggestionsList = body?.data ?? [];
        const paginationData = body?.pagination ?? {};

        setFollowersSuggestions((prev) =>
          isLoadMore
            ? [...prev, ...followersSuggestionsList]
            : followersSuggestionsList,
        );
        setPagination((prev) => ({
          ...prev,
          ...paginationData,
          page,
          limit: paginationData?.limit || prev.limit,
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not load followers suggestions");
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
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
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
      <Box>
        <Box

          borderRadius={"20px"}
          px={3}
          display="flex"
          gap={1}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={3}
          sx={{ cursor: "pointer", background: "linear-gradient(150deg, #8E1348, #5E0B2F)" }}
        >


          <CustomButton
            startIcon={<img src={LiveStreamingIcon} />}
            title=" Start Live Streaming"
            bgcolor="background.white"
            color="text.darkBrown"
            fontSize={14}
            fontWeight={700}
            handleClickBtn={() => navigate("/live-streams")}
            width="100%"
            radius={10}
          />

          <CustomButton
            startIcon={<Star />}
            title="Explore Creators"
            bgcolor="background.white"
            color="text.darkBrown"
            fontSize={14}
            fontWeight={700}
            handleClickBtn={() => navigate("/category")}
            width="100%"
            radius={10}
          />
        </Box>

        <Stack
          gap={1}
          mt={2}
          sx={{
            bgcolor: "colors.white",
            width: "100%",
            borderRadius: "25px",
            position: "relative",
            p: 2.5,
            px: 1.5,
            boxSizing: "border-box",
            border: "1px solid",
            borderColor: "neutral.ligthColor",
          }}
        >
          {/* {renderFollowersSuggestions} */}
          {isLoading.getFollowersSuggestions ? (
            <Stack mt={2} justifyContent="center" alignItems="center">
              <CircularProgress size={28} sx={{ color: "#FF1572" }} />
            </Stack>
          ) : followersSuggestions.length === 0 &&
            !isLoading.getFollowersSuggestions ? (
            <Stack mt={2} justifyContent="center" alignItems="center">
              <Typography variant="body1" color="text.black" fontWeight={400}>
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

export default StreamingFollowerSuggestions;
