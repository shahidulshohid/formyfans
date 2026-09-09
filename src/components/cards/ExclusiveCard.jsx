import {
  Box,
  Typography,
  Stack,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useState } from "react";
import moment from "moment";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import useUserStore from "../../zustand/userUserStore";
import FavoriteIcon from "@mui/icons-material/Favorite";


const ExclusiveCard = ({ data, onEdit, onDelete, onClick }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const { user } = useUserStore();

  const {
    title,
    caption,
    media,
    likesCount,
    createdAt,
    author,
    tags,
    isLiked,
  } = data || {};

  const firstMedia = media?.[0];
  const mediaUrl = firstMedia?.url;
  const mediaType = firstMedia?.mediaType;

  const formattedDate = createdAt
    ? moment(createdAt).format("MMM D, YYYY")
    : "";

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <Box
      onClick={onClick}
      boxShadow={"0px 2px 10px rgba(0,0,0,0.08)"}
      width={"100%"}
      height={"auto"}
      display={"flex"}
      flexDirection={"column"}
      borderRadius={"10px"}
      overflow={"hidden"}
      bgcolor={"neutral.white"}
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": onClick
          ? { boxShadow: "0px 4px 16px rgba(0,0,0,0.12)" }
          : {},
      }}
    >
      {/* Media */}
      <Box width={"100%"} height={"190px"} flexShrink={0} position={"relative"}>
        {mediaType === "video" ? (
          <Box
            component="video"
            src={mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            sx={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              display: "block",
              backgroundColor: "black",
            }}
          />
        ) : (
          <Box
            component="img"
            src={mediaUrl}
            alt={title}
            sx={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        )}

        {/* 3-dot menu - image ke top-right corner par overlay */}
        {user?._id === author?._id && (
          <>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(0,0,0,0.4)",
                color: "neutral.white",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.6)",
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                  handleMenuClose();
                }}
              >
                Edit
              </MenuItem>

              <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                  handleMenuClose();
                }}
                sx={{ color: "text.deepPink" }}
              >
                Delete
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* content */}
      <Box
        p={2}
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <Typography
          color="text.darkBrown"
          fontWeight={700}
          fontSize={"14px"}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </Typography>

        <Typography
          color="neutral.grey"
          fontSize={"12px"}
          mb={1.5}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {caption}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: "auto" }}
        >
          <Typography color="neutral.lightGrey" fontSize={"12px"}>
            {formattedDate}
          </Typography>

          <Stack direction="row" alignItems="center" gap={0.5}>
            {isLiked ? (
              <FavoriteIcon
                sx={{
                  fontSize: 16,
                  color: "text.deepPink",
                }}
              />
            ) : (
              <FavoriteBorderIcon
                sx={{
                  fontSize: 16,
                  color: "text.deepPink",
                }}
              />
            )}
            <Typography color="neutral.lightGrey" fontSize={"12px"}>
              {likesCount} Likes
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default ExclusiveCard;
