import ControlPointIcon from "@mui/icons-material/ControlPoint";
import SendIcon from "@mui/icons-material/Send";
import {
  Avatar,
  Box,
  CircularProgress,
  DialogActions,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import moment from "moment";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { createComment, getComments } from "../../api/modules/post";
import { DialogBody } from "./DialogBody";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";

export const PostCommentsDialog = forwardRef(({ setPostList }, ref) => {
  // Scroll Top Ref
  const scrollTopRef = useRef(null);
  // Open Dialog State
  const [open, setOpen] = useState(false);
  // Data State
  const [data, setData] = useState(null);
  // Comments State
  const [comments, setComments] = useState([]);
  // Comment Input State
  const [commentInput, setCommentInput] = useState("");
  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    hasNextPage: false,
  });
  // Loading State
  const [isLoading, setIsLoading] = useState({
    getComments: false,
    createComment: false,
    loadMoreComments: false,
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
    setComments([]);
    setCommentInput("");
    setPagination({
      page: 1,
      hasNextPage: false,
    });
    setIsLoading({
      getComments: false,
      createComment: false,
      loadMoreComments: false,
    });
  };

  // Handle Get Comments API Call
  const handleGetComments = async (postId, page = 1) => {
    page === 1
      ? setIsLoading((prev) => ({ ...prev, getComments: true }))
      : setIsLoading((prev) => ({ ...prev, loadMoreComments: true }));
    try {
      const response = await getComments(postId, { page, limit: 10 });
      if (response.status === 200 || response.status === 201) {
        setComments((prev) =>
          page === 1
            ? response.data.comments
            : [...prev, ...response.data.comments],
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
        getComments: false,
        loadMoreComments: false,
      }));
    }
  };

  // Handle Load More Comments
  const handleLoadMoreComments = () => {
    const nextPage = pagination.page + 1;
    setPagination((prev) => ({ ...prev, page: nextPage }));
    handleGetComments(data.data._id, nextPage);
  };

  // Handle Create Comment
  const handleCreateComment = useCallback(async () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    const postId = data?.data?._id;
    setCommentInput("");
    setIsLoading((prev) => ({ ...prev, createComment: true }));

    // Optimistic update
    setPostList((prev) =>
      prev.map((post) =>
        post._id === postId
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post,
      ),
    );

    try {
      const response = await createComment(postId, { content: trimmed });
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        setComments((prev) => [response.data.comment, ...prev]);
        scrollTopRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        toast.error(response.data.message);
        setPostList((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, commentsCount: post.commentsCount - 1 }
              : post,
          ),
        );
      }
    } catch (error) {
      toast.error(error?.message);
      setPostList((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, commentsCount: post.commentsCount - 1 }
            : post,
        ),
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, createComment: false }));
    }
  }, [commentInput, data, setPostList]);

  // Handle Key Down
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleCreateComment();
      }
    },
    [handleCreateComment],
  );

  // Use Effect to Get Comments
  useEffect(() => {
    if (open && data) handleGetComments(data.data._id);
  }, [open, data]);

  // Handle Format Time
  const formatTime = useCallback((dateStr) => {
    return moment(dateStr).fromNow();
  }, []);

  // Handle Get Initials
  const getInitials = useCallback((firstName, lastName) => {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  }, []);

  // Render Dialog Loading
  const renderDialogLoading = () => {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  };

  // Render Dialog No Comments
  const renderDialogNoComments = () => {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center", py: 4 }}
      >
        No comments yet. Be the first to comment!
      </Typography>
    );
  };

  // Render Dialog Comments
  const renderDialogComments = useMemo(() => {
    return comments.map((comment) => (
      <Box key={comment._id} sx={{ display: "flex", gap: 1.5 }}>
        <Avatar
          src={comment.author?.image}
          alt={comment.author?.firstName}
          sx={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}
        >
          {getInitials(comment.author?.firstName, comment.author?.lastName)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.3,
            }}
          >
            <Typography variant="body2" fontWeight={600} fontSize={13}>
              {comment.author?.firstName} {comment.author?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(comment.createdAt)}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "background.default",
              borderRadius: "4px 12px 12px 12px",
              display: "inline-block",
              maxWidth: "100%",
            }}
          >
            <Typography
              variant="body2"
              fontSize={13}
              sx={{ wordBreak: "break-word" }}
            >
              {comment.content}
            </Typography>
          </Box>
        </Box>
      </Box>
    ));
  }, [comments, formatTime, getInitials]);

  // Render Comment Input
  const renderCommentInput = () => {
    return (
      <TextField
        fullWidth
        multiline
        maxRows={3}
        size="small"
        placeholder="Write a comment..."
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading.createComment}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleCreateComment}
                disabled={!commentInput.trim() || isLoading.createComment}
                color="primary"
              >
                {isLoading.createComment ? (
                  <CircularProgress size={16} />
                ) : (
                  <SendIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  };

  // Return Dialog
  return (
    <DialogBox open={open} onClose={handleClose}>
      <DialogHeader title="Comments" onClose={handleClose} />

      <DialogBody>
        {/* Comments List */}
        <Box
          // maxHeight={420}
          display={"flex"}
          flexDirection={"column"}
          gap={2}
          sx={{
            overflowY: "auto",
          }}
        >
          <div ref={scrollTopRef} />
          {isLoading.getComments
            ? renderDialogLoading()
            : comments.length === 0
              ? renderDialogNoComments()
              : renderDialogComments}

          {pagination.hasNextPage && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={1}
              onClick={handleLoadMoreComments}
              sx={{
                cursor: "pointer",
                py: 1,
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              {isLoading.loadMoreComments ? (
                <CircularProgress size={16} />
              ) : (
                <>
                  <ControlPointIcon fontSize="small" />
                  <Typography variant="caption">Load more comments</Typography>
                </>
              )}
            </Stack>
          )}
        </Box>

        {/* Comment Input */}
      </DialogBody>
      <DialogActions>{renderCommentInput()}</DialogActions>
    </DialogBox>
  );
});

PostCommentsDialog.displayName = "PostCommentsDialog";
