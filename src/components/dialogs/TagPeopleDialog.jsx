import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Box,
  Chip,
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
import { searchTaggableUsers } from "../../api/modules/post";
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
  limit: 20,
  hasNextPage: false,
};

export const TagPeopleDialog = forwardRef(({ onDone }, ref) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState({
    fetch: false,
    loadMore: false,
  });
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);

  useImperativeHandle(ref, () => ({
    open: (initialSelected = []) => {
      setOpen(true);
      setSelectedUsers(initialSelected);
    },
    close: () => setOpen(false),
  }));

  const resetDialogState = () => {
    setUsers([]);
    setSelectedUsers([]);
    setSearchValue("");
    setPagination(INITIAL_PAGINATION);
  };

  const handleClose = () => {
    setOpen(false);
    resetDialogState();
  };

  const handleFetchUsers = async ({
    page = 1,
    isLoadMore = false,
    search = debouncedSearchValue,
  } = {}) => {
    try {
      setIsLoading((prev) => ({
        ...prev,
        fetch: !isLoadMore,
        loadMore: isLoadMore,
      }));

      const response = await searchTaggableUsers({
        page,
        limit: 20,
        search,
      });

      if (response?.status === 200 || response?.status === 201) {
        const body = response?.data ?? {};
        const userList = body?.data ?? [];
        const paginationData = body?.pagination ?? {};

        setUsers((prev) =>
          isLoadMore ? [...prev, ...userList] : userList,
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
      toast.error("Could not load users");
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        fetch: false,
        loadMore: false,
      }));
    }
  };

  useEffect(() => {
    if (!open) return;
    handleFetchUsers({ page: 1, search: debouncedSearchValue });
  }, [debouncedSearchValue, open]);

  const handleLoadMore = () => {
    if (!pagination.hasNextPage || isLoading.loadMore) return;
    handleFetchUsers({ page: pagination.page + 1, isLoadMore: true });
  };

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u._id === user._id);
      if (exists) return prev.filter((u) => u._id !== user._id);
      return [...prev, user];
    });
  };

  const handleDone = () => {
    onDone?.(selectedUsers);
    handleClose();
  };

  const isUserSelected = (userId) =>
    selectedUsers.some((u) => u._id === userId);

  const renderUsersList = useMemo(() => {
    return users.map((user) => {
      const selected = isUserSelected(user._id);

      return (
        <Box
          key={user._id}
          onClick={() => toggleUser(user)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1,
            borderRadius: "12px",
            cursor: "pointer",
            bgcolor: selected ? "rgba(255, 21, 114, 0.08)" : "transparent",
            border: "1px solid",
            borderColor: selected
              ? "rgba(255, 21, 114, 0.35)"
              : "transparent",
            "&:hover": {
              bgcolor: selected
                ? "rgba(255, 21, 114, 0.12)"
                : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Avatar
            src={getUserProfileImage(user)}
            sx={{ width: 40, height: 40, flexShrink: 0 }}
          >
            {getInitialName(user)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {getDisplayName(user)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {getUserHandle(user)}
            </Typography>
          </Box>

          {selected ? (
            <CheckCircleIcon sx={{ color: "#FF1572", fontSize: 22 }} />
          ) : (
            <RadioButtonUncheckedIcon
              sx={{ color: "text.secondary", fontSize: 22 }}
            />
          )}
        </Box>
      );
    });
  }, [users, selectedUsers]);

  return (
    <DialogBox open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogHeader title="Tag People" onClose={handleClose} />

      <DialogBody>
        <AppInput
          size="small"
          variant="outlined"
          fullWidth
          variantStyles="profileSearch"
          placeholder="Search people to tag..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          startIcon={<SearchIcon fontSize="small" />}
          sx={{ mb: 2 }}
        />

        {selectedUsers.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1.5 }}>
            {selectedUsers.map((user) => (
              <Chip
                key={user._id}
                label={getDisplayName(user)}
                size="small"
                onDelete={() => toggleUser(user)}
                deleteIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: "rgba(255, 21, 114, 0.1)",
                  color: "neutral.deepPink",
                  fontWeight: 600,
                  "& .MuiChip-deleteIcon": {
                    color: "neutral.deepPink",
                    "&:hover": { color: "#E0115F" },
                  },
                }}
              />
            ))}
          </Stack>
        )}

        <Box
          maxHeight={360}
          display="flex"
          flexDirection="column"
          gap={0.5}
          sx={{ overflowY: "auto" }}
        >
          {isLoading.fetch ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#FF1572" }} />
            </Box>
          ) : users.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No users found
            </Typography>
          ) : (
            renderUsersList
          )}

          {pagination.hasNextPage && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={1}
              onClick={handleLoadMore}
              sx={{
                cursor: "pointer",
                py: 1,
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              {isLoading.loadMore ? (
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
        onConfirm={handleDone}
        cancelText="Cancel"
        confirmText="Done"
      />
    </DialogBox>
  );
});

TagPeopleDialog.displayName = "TagPeopleDialog";
