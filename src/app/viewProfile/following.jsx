import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getFollowing, unfollow } from "../../api/modules/follow";
import { FollowingCard } from "../../components/cards";
import CustomButton from "../../components/cutomButon";
import { AppInput } from "../../components/input/AppInput";
import { useDebounce } from "../../hooks";
import useUserStore from "../../zustand/userUserStore";

const INITIAL_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const INITIAL_LOADING = {
  getFollowing: true,
  loadMoreFollowing: false,
};

const UserFollowing = () => {
  const { user, setUserData } = useUserStore();
  const [isLoading, setIsLoading] = useState(INITIAL_LOADING);
  const [following, setFollowing] = useState([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const handleGetFollowing = async ({
    page = 1,
    isLoadMore = false,
    search = debouncedSearchValue,
  } = {}) => {
    try {
      setIsLoading((prev) => ({
        ...prev,
        getFollowing: !isLoadMore,
        loadMoreFollowing: isLoadMore,
      }));

      const response = await getFollowing({
        page,
        limit: pagination.limit,
        search,
      });

      if (response?.status === 200 || response?.status === 201) {
        const body = response?.data ?? {};
        const followingList = body?.data ?? [];
        const paginationData = body?.pagination ?? {};

        setFollowing((prev) =>
          isLoadMore ? [...prev, ...followingList] : followingList,
        );
        setPagination((prev) => ({
          ...prev,
          ...paginationData,
          page,
          limit: paginationData?.limit || prev.limit,
        }));
      }
    } catch {
      toast.error("Could not load following");
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        getFollowing: false,
        loadMoreFollowing: false,
      }));
    }
  };

  const handleLoadMoreFollowing = () => {
    if (!pagination.hasNextPage || isLoading.loadMoreFollowing) return;
    handleGetFollowing({ page: pagination.page + 1, isLoadMore: true });
  };

  useEffect(() => {
    handleGetFollowing({ page: 1, search: debouncedSearchValue });
  }, [debouncedSearchValue]);

  const handleUnfollow = useCallback(
    async (userId) => {
      const previousFollowing = following;
      const followingItem = following.find(
        (item) => item.following._id === userId,
      );
      if (!followingItem) return;

      setFollowing((prev) =>
        prev.filter((item) => item.following._id !== userId),
      );
      setUserData({
        ...user,
        followingCount: user.followingCount - 1,
      });

      try {
        const response = await unfollow(userId);

        if (response?.data?.status === "success") {
          toast.success("Unfollowed successfully");
        } else {
          toast.error("Could not unfollow");
          setFollowing(previousFollowing);
          setUserData({
            ...user,
            followingCount: user.followingCount + 1,
          });
        }
      } catch {
        toast.error("Could not unfollow");
        setFollowing(previousFollowing);
        setUserData({
          ...user,
          followingCount: user.followingCount + 1,
        });
      }
    },
    [following],
  );

  const renderFollowing = useMemo(() => {
    return following.map((following) => (
      <FollowingCard
        key={following._id}
        item={following.following}
        handleUnfollow={handleUnfollow}
      />
    ));
  }, [following]);

  return (
    <Box>
      <Stack>
        <Typography variant="h5" color="neutral.deepPink" fontWeight={600}>
          Following
        </Typography>
        <Typography
          fontSize={"14px"}
          color="text.darkBrown"
          fontWeight={400}
          lineHeight={"normal"}
        >
          {user?.followingCount} following
        </Typography>
      </Stack>

      <Stack mt={2}>
        <AppInput
          size="small"
          variant="outlined"
          fullWidth
          variantStyles="profileSearch"
          placeholder="Search following"
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
        {isLoading.getFollowing ? (
          <Stack mt={2} justifyContent="center" alignItems="center">
            <CircularProgress size={28} sx={{ color: "#FF1572" }} />
          </Stack>
        ) : following.length === 0 && !isLoading.getFollowing ? (
          <Stack mt={2} justifyContent="center" alignItems="center">
            <Typography variant="body1" color="text.darkBrown" fontWeight={400}>
              No following found
            </Typography>
          </Stack>
        ) : (
          renderFollowing
        )}
      </Stack>

      {pagination.hasNextPage && (
        <Stack mt={2} justifyContent="center" alignItems="center">
          <CustomButton
            title="Load More"
            handleClickBtn={handleLoadMoreFollowing}
            disabled={isLoading.loadMoreFollowing}
            loading={isLoading.loadMoreFollowing}
          />
        </Stack>
      )}
    </Box>
  );
};

export default UserFollowing;
