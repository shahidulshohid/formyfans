import ControlPointIcon from "@mui/icons-material/ControlPoint";
import {
  Avatar,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import moment from "moment";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { getPostLikes } from "../../api/modules/post";
import { DialogBody } from "./DialogBody";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";
import { getDisplayName, getInitialName, getUserHandle } from "../../utils/helper";

export const PostLikesDialog = forwardRef((_, ref) => {
  // Open Dialog State
  const [open, setOpen] = useState(false);
  // Data State
  const [data, setData] = useState(null);
  // Likes State
  const [likes, setLikes] = useState([]);
  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    hasNextPage: false,
  });
  // Loading State
  const [isLoading, setIsLoading] = useState({
    getLikes: false,
    loadMoreLikes: false,
  });

  // Use Imperative Handle
  useImperativeHandle(ref, () => ({
    open: (dataParams) => {
      setOpen(true);
      setData(dataParams);
    },
    close: () => setOpen(false),
  }));

  // Handle Close Dialog
  const handleClose = () => {
    setOpen(false);
    setLikes([]);
  };

  // Handle Get Likes API Call
  const handleGetLikes = async (postId, page = 1) => {
    page === 1
      ? setIsLoading((prev) => ({ ...prev, getLikes: true }))
      : setIsLoading((prev) => ({ ...prev, loadMoreLikes: true }));
    try {
      const response = await getPostLikes(postId, { page, limit: 10 });
      if (response.status === 200 || response.status === 201) {
        setLikes((prev) =>
          page === 1 ? response.data.data : [...prev, ...response.data.data],
        );
        setPagination({
          page: page,
          hasNextPage: response.data.pagination.hasNextPage,
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        getLikes: false,
        loadMoreLikes: false,
      }));
    }
  };

  // Handle Load More Likes
  const handleLoadMoreLikes = () => {
    const nextPage = pagination.page + 1;
    setPagination((prev) => ({ ...prev, page: nextPage }));
    handleGetLikes(data.data._id, nextPage);
  };

  // Use Effect to Get Likes
  useEffect(() => {
    if (open && data) handleGetLikes(data.data._id);
  }, [open, data]);

  // Render dialog loading
  const renderDialogLoading = () => {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  };

  // Render dialog no likes
  const renderDialogNoLikes = () => {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center", py: 4 }}
      >
        No likes yet. Be the first to like!
      </Typography>
    );
  };

  // Render dialog likes

  const formatLikeTime = (dateStr) => {
    if (!dateStr) return "";
    return moment(dateStr).fromNow();
  };

  const renderDialogLikes = useMemo(() => {
    return likes.map((like) => {
      const { user } = like;
      const likedAt = like.createdAt || like.likedAt || like.updatedAt;

      return (
        <Box
          key={like._id}
          sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
        >
          <Avatar
            src={user?.image}
            alt={user?.firstName}
            sx={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}
          >
            {getInitialName(user)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                fontSize={13}
                noWrap
              >
                {getDisplayName(user)}
              </Typography>
              {likedAt && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  flexShrink={0}
                >
                  {formatLikeTime(likedAt)}
                </Typography>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" fontSize={12}>
              {getUserHandle(user)}
            </Typography>
          </Box>
        </Box>
      );
    });
  }, [likes]);

  // Return Dialog
  return (
    <DialogBox open={open} onClose={handleClose}>
      <DialogHeader title="Likes" onClose={handleClose} />

      <DialogBody>
        {/* Likes List */}
        <Box
          maxHeight={420}
          display={"flex"}
          flexDirection={"column"}
          gap={2}
          sx={{
            overflowY: "auto",
          }}
        >
          {isLoading.getLikes
            ? renderDialogLoading()
            : likes.length === 0
              ? renderDialogNoLikes()
              : renderDialogLikes}

          {pagination.hasNextPage && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={1}
              onClick={handleLoadMoreLikes}
              sx={{
                cursor: "pointer",
                py: 1,
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              {isLoading.loadMoreLikes ? (
                <CircularProgress size={16} />
              ) : (
                <>
                  <ControlPointIcon fontSize="small" />
                  <Typography variant="caption">Load more likes</Typography>
                </>
              )}
            </Stack>
          )}
        </Box>
      </DialogBody>
    </DialogBox>
  );
});

PostLikesDialog.displayName = "PostLikesDialog";
