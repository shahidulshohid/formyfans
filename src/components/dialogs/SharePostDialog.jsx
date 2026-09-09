import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { getFollowers } from "../../api/modules/follow";
import { sharePost } from "../../api/modules/post";
import { AppInput } from "../input/AppInput";
import { useDebounce } from "../../hooks";
import {
  getDisplayName,
  getInitialName,
  getUserHandle,
  getUserProfileImage,
} from "../../utils/helper";
import { DialogActionButtons } from "./DialogActions";
import { DialogBody } from "./DialogBody";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";

const INITIAL_PAGINATION = {
  page: 1,
  limit: 10,
  hasNextPage: false,
};

export const SharePostDialog = forwardRef(({ setPostList }, ref) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState({
    getFollowers: false,
    loadMoreFollowers: false,
    sharePost: false,
  });
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);

  useImperativeHandle(ref, () => ({
    open: (dataParams) => {
      setOpen(true);
      setData(dataParams);
    },
    close: () => setOpen(false),
  }));

  const resetDialogState = () => {
    setFollowers([]);
    setSelectedRecipientIds([]);
    setSearchValue("");
    setPagination(INITIAL_PAGINATION);
  };

  const handleClose = () => {
    setOpen(false);
    resetDialogState();
  };

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

  useEffect(() => {
    if (!open) return;
    handleGetFollowers({ page: 1, search: debouncedSearchValue });
  }, [debouncedSearchValue, open]);

  const handleLoadMoreFollowers = () => {
    if (!pagination.hasNextPage || isLoading.loadMoreFollowers) return;
    handleGetFollowers({ page: pagination.page + 1, isLoadMore: true });
  };

  const toggleRecipient = (userId) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleShare = async () => {
    const postId = data?.data?._id;
    if (!postId) {
      toast.error("Post not found");
      return;
    }

    if (selectedRecipientIds.length === 0) {
      toast.error("Please select at least one follower");
      return;
    }

    setPostList((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              sharesCount: p.sharesCount + 1,
            }
          : p,
      ),
    );

    try {
      setIsLoading((prev) => ({ ...prev, sharePost: true }));
      const response = await sharePost({
        postId,
        recipientIds: selectedRecipientIds,
      });

      if (response?.status === 200 || response?.status === 201) {
        toast.success(response?.data?.message || "Post shared successfully");
        handleClose();
      } else {
        toast.error(response?.data?.message || "Could not share post");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not share post");
    } finally {
      setIsLoading((prev) => ({ ...prev, sharePost: false }));
    }
  };

  const renderFollowersList = useMemo(() => {
    return followers.map((item) => {
      const follower = item.follower;
      const isSelected = selectedRecipientIds.includes(follower._id);

      return (
        <Box
          key={item._id}
          onClick={() => toggleRecipient(follower._id)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1,
            borderRadius: "12px",
            cursor: "pointer",
            bgcolor: isSelected ? "rgba(255, 21, 114, 0.08)" : "transparent",
            border: "1px solid",
            borderColor: isSelected
              ? "rgba(255, 21, 114, 0.35)"
              : "transparent",
            "&:hover": {
              bgcolor: isSelected
                ? "rgba(255, 21, 114, 0.12)"
                : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Avatar
            src={getUserProfileImage(follower)}
            sx={{ width: 40, height: 40, flexShrink: 0 }}
          >
            {getInitialName(follower)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {getDisplayName(follower)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {getUserHandle(follower)}
            </Typography>
          </Box>

          {isSelected ? (
            <CheckCircleIcon sx={{ color: "#FF1572", fontSize: 22 }} />
          ) : (
            <RadioButtonUncheckedIcon
              sx={{ color: "text.secondary", fontSize: 22 }}
            />
          )}
        </Box>
      );
    });
  }, [followers, selectedRecipientIds]);

  return (
    <DialogBox open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogHeader title="Share Post" onClose={handleClose} />

      <DialogBody>
        <AppInput
          size="small"
          variant="outlined"
          fullWidth
          variantStyles="profileSearch"
          placeholder="Search followers"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          startIcon={<SearchIcon fontSize="small" />}
          sx={{ mb: 2 }}
        />

        {selectedRecipientIds.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            {selectedRecipientIds.length} selected
          </Typography>
        )}

        <Box
          maxHeight={360}
          display="flex"
          flexDirection="column"
          gap={0.5}
          sx={{ overflowY: "auto" }}
        >
          {isLoading.getFollowers ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#FF1572" }} />
            </Box>
          ) : followers.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No followers found
            </Typography>
          ) : (
            renderFollowersList
          )}

          {pagination.hasNextPage && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={1}
              onClick={handleLoadMoreFollowers}
              sx={{
                cursor: "pointer",
                py: 1,
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              {isLoading.loadMoreFollowers ? (
                <CircularProgress size={16} />
              ) : (
                <>
                  <ControlPointIcon fontSize="small" />
                  <Typography variant="caption">Load more</Typography>
                </>
              )}
            </Stack>
          )}
        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={handleClose}
        onConfirm={handleShare}
        cancelText="Cancel"
        confirmText={isLoading.sharePost ? "Sharing..." : "Share"}
        confirmProps={{
          disabled: isLoading.sharePost || selectedRecipientIds.length === 0,
          loading: isLoading.sharePost,
        }}
      />
    </DialogBox>
  );
});

SharePostDialog.displayName = "SharePostDialog";
