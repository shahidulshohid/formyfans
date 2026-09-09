import { useCallback, useEffect, useMemo, useState } from "react";
import { follow, getFollowers, unfollow } from "../../api/modules/follow";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import useUserStore from "../../zustand/userUserStore";
import { FollowerCard } from "../../components/cards";
import { AppInput } from "../../components/input/AppInput";
import { useDebounce } from "../../hooks";
import CustomButton from "../../components/cutomButon";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

const INITIAL_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const INITIAL_LOADING = {
  getFollowers: true,
  loadMoreFollowers: false,
};

const UserFollowers = () => {
  const { user, setUserData } = useUserStore();
  const [isLoading, setIsLoading] = useState(INITIAL_LOADING);
  const [followers, setFollowers] = useState([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const handleGetFollowers = async ({
    page = 1,
    isLoadMore = false,
    search = debouncedSearchValue,
  } = {}) => {
    try {
      setIsLoading((prev) => ({
        ...prev,
        getFollowers: !isLoadMore,
        loadMoreFollowers: isLoadMore,
      }));

      const response = await getFollowers({
        page,
        limit: pagination.limit,
        search,
      });

      if (response?.status === 200 || response?.status === 201) {
        const body = response?.data ?? {};
        const followersList = body?.data ?? [];
        const paginationData = body?.pagination ?? {};

        setFollowers((prev) =>
          isLoadMore ? [...prev, ...followersList] : followersList,
        );
        setPagination((prev) => ({
          ...prev,
          ...paginationData,
          page,
          limit: paginationData?.limit || prev.limit,
        }));
      }
    } catch {
      toast.error("Could not load followers");
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        getFollowers: false,
        loadMoreFollowers: false,
      }));
    }
  };

  const handleLoadMoreFollowers = () => {
    if (!pagination.hasNextPage || isLoading.loadMoreFollowers) return;
    handleGetFollowers({ page: pagination.page + 1, isLoadMore: true });
  };

  useEffect(() => {
    handleGetFollowers({ page: 1, search: debouncedSearchValue });
  }, [debouncedSearchValue]);

  const handleFollowUnfollow = useCallback(async (userId, type = "follow") => {
    let previousFollowers;

    setFollowers((prev) => {
      previousFollowers = prev;
      return prev.map((item) =>
        item.follower._id === userId
          ? { ...item, isFollowing: type === "follow" }
          : item,
      );
    });

    const currentUser = useUserStore.getState().user;
    setUserData({
      ...currentUser,
      followingCount:
        type === "follow"
          ? currentUser.followingCount + 1
          : currentUser.followingCount - 1,
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
        toast.error(response?.data?.message || "Action failed");
        setFollowers(previousFollowers);

        const rollbackUser = useUserStore.getState().user;
        setUserData({
          ...rollbackUser,
          followingCount:
            type === "follow"
              ? rollbackUser.followingCount - 1
              : rollbackUser.followingCount + 1,
        });
      }
    } catch {
      toast.error("Something went wrong, please try again");
      setFollowers(previousFollowers);

      const rollbackUser = useUserStore.getState().user;
      setUserData({
        ...rollbackUser,
        followingCount:
          type === "follow"
            ? rollbackUser.followingCount - 1
            : rollbackUser.followingCount + 1,
      });
    }
  }, []);

  const renderFollowers = useMemo(() => {
    return followers.map((follower) => (
      <FollowerCard
        key={follower._id}
        item={follower.follower}
        isFollowing={follower.isFollowing}
        handleFollowUnfollow={handleFollowUnfollow}
      />
    ));
  }, [followers]);

  return (
    <Box>
      <Stack>
        <Typography variant="h5" color="neutral.deepPink" fontWeight={600}>
          Followers
        </Typography>
        <Typography
          fontSize={"14px"}
          color="text.darkBrown"
          fontWeight={400}
          lineHeight={"normal"}
        >
          {user?.followersCount} followers
        </Typography>
      </Stack>

      <Stack mt={2}>
        <AppInput
          size="small"
          variant="outlined"
          fullWidth
          variantStyles="profileSearch"
          placeholder="Search followers"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          startIcon={<SearchIcon />}
          endIcon={
            searchValue?.trim() ? (
              <CloseIcon
                fontSize="small"
                sx={{ cursor: "pointer" }}
                onClick={() => setSearchValue("")}
              />
            ) : null
          }
        />
      </Stack>

      <Stack gap={0.5} mt={2}>
        {isLoading.getFollowers ? (
          <Stack mt={2} justifyContent="center" alignItems="center">
            <CircularProgress size={28} sx={{ color: "#FF1572" }} />
          </Stack>
        ) : followers.length === 0 && !isLoading.getFollowers ? (
          <Stack mt={2} justifyContent="center" alignItems="center">
            <Typography variant="body1" color="text.darkBrown" fontWeight={400}>
              No followers found
            </Typography>
          </Stack>
        ) : (
          renderFollowers
        )}
      </Stack>

      {pagination.hasNextPage && (
        <Stack mt={2} justifyContent="center" alignItems="center">
          <CustomButton
            title="Load More"
            handleClickBtn={handleLoadMoreFollowers}
            disabled={isLoading.loadMoreFollowers}
            loading={isLoading.loadMoreFollowers}
          />
        </Stack>
      )}
    </Box>
  );
};

export default UserFollowers;
