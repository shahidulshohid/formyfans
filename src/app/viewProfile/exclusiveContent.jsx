import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AddExclusiveContentDialog from "./addExclusiveContent";
import ExclusiveCard from "../../components/cards/exclusiveCard";
import ConfirmPopup from "../../components/pops";
import {
  createExclusiveContent,
  deleteExclusiveContent,
  getExclusiveContentByUsername,
  updateExclusiveContent,
} from "../../api/modules/exclusiveContent";
import ExclusiveCardSkeleton from "../../components/skeleton/ExclusiveCardSkeleton";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import useUserStore from "../../zustand/userUserStore";
import { PostDetailDialog } from "../../components/dialogs/PostDetailDialog";
import { ExclusiveContentDetailDialog } from "../../components/dialogs";

const renderAddExclusiveContentButton = (handleAdd, loading = false) => (
  <Box
    onClick={!loading ? handleAdd : undefined}
    display="flex"
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
    gap={1}
    width="100%"
    height="310px"
    bgcolor="grey.200"
    borderRadius={1}
    border="1px dashed"
    borderColor="grey.300"
    sx={{
      opacity: loading ? 0.7 : 1,
      "&:hover": {
        borderColor: loading ? "grey.300" : "grey.400",
        cursor: loading ? "default" : "pointer",
      },
    }}
  >
    <AddCircleOutlineOutlinedIcon />
    <Typography>Add Exclusive Content</Typography>
  </Box>
);

const mapPostToDialogEditData = (post) => {
  if (!post) return null;

  const mediaType = post.media?.[0]?.mediaType;

  return {
    selectedType: mediaType === "video" ? "video" : "photo",
    title: post.title || "",
    description: post.caption || "",
    tag: post.tags?.[0] || "",
    image: post.media?.[0]?.url || "",
  };
};

const ExclusiveContent = ({ customSize }) => {
  const { username } = useParams();
  const { user } = useUserStore();
  const postDetailDialogRef = useRef(null);

  const isOwnProfile = user?.username === username;

  const [exclusiveContentList, setExclusiveContentList] = useState([]);

  const [isLoading, setIsLoading] = useState({
    getExclusiveContent: false,
    createExclusiveContent: false,
  });

  const [open, setOpen] = useState(false);
  const [selectedExclusive, setSelectedExclusive] = useState(null);

  // ---- Delete Confirmation State ----
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const editData = useMemo(
    () => mapPostToDialogEditData(selectedExclusive),
    [selectedExclusive],
  );
  const handleGetExclusiveContent = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, getExclusiveContent: true }));
      const response = await getExclusiveContentByUsername(username);

      if (response.status === 200 || response.status === 201) {
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setExclusiveContentList(list);
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, getExclusiveContent: false }));
    }
  };

  useEffect(() => {
    if (username) handleGetExclusiveContent();
  }, [username]);

  const handleAdd = () => {
    setSelectedExclusive(null);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedExclusive(null);
  };
  const handleConfirm = async (formPayload) => {
    try {
      setIsLoading((prev) => ({ ...prev, createExclusiveContent: true }));
      const isEdit = Boolean(selectedExclusive);
      const payload = {
        ...(isEdit
          ? {}
          : {
              isExclusive: true,
              visibility: "exclusive",
            }),
        title: formPayload.title,
        caption: formPayload.description,
        media: formPayload.image
          ? [
              {
                url: formPayload.image,
                mediaType:
                  formPayload.selectedType === "video" ? "video" : "image",
              },
            ]
          : [],
        tags: formPayload.tag ? [formPayload.tag] : [],
      };

      const response = isEdit
        ? await updateExclusiveContent(
            selectedExclusive.id || selectedExclusive._id,
            payload,
          )
        : await createExclusiveContent(payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        await handleGetExclusiveContent();
        setOpen(false);
        setSelectedExclusive(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, createExclusiveContent: false }));
    }
  };

  const handleEditExclusive = (item) => {
    setSelectedExclusive(item);
    setOpen(true);
  };

  const handleDeleteExclusive = (item) => {
    setDeleteTarget(item);
  };

  const handleOpenPostDetail = (item) => {
    postDetailDialogRef.current?.open(item);
  };
  const handleConfirmDeleteExclusive = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const response = await deleteExclusiveContent(
        deleteTarget.id || deleteTarget._id,
      );
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        await handleGetExclusiveContent();
        setDeleteTarget(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {isOwnProfile && (
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            {renderAddExclusiveContentButton(handleAdd)}
          </Grid>
        )}

        {isLoading.getExclusiveContent
          ? Array.from({ length: 3 }).map((_, index) => (
              <Grid item size={{ xs: 12, sm: 4, md: 3 }} key={index}>
                <ExclusiveCardSkeleton />
              </Grid>
            ))
          : exclusiveContentList.map((item) => {
              return (
                <Grid item size={{ xs: 12, sm: 4 }} key={item?._id}>
                  <ExclusiveCard
                    data={item}
                    onClick={() => handleOpenPostDetail(item)}
                    onEdit={() => handleEditExclusive(item)}
                    onDelete={() => handleDeleteExclusive(item)}
                  />
                </Grid>
              );
            })}
      </Grid>

      <AddExclusiveContentDialog
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        editData={editData}
        loading={isLoading.createExclusiveContent}
      />

      {/* Delete Confirmation Popup */}
      <ConfirmPopup
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteExclusive}
        title="Delete Exclusive Content?"
        message="Are you sure you want to delete this exclusive content? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        variant="delete"
      />

      {/* Post Detail Dialog */}
      <ExclusiveContentDetailDialog
        ref={postDetailDialogRef}
        setPostList={setExclusiveContentList}
      />
    </Box>
  );
};

export default ExclusiveContent;
