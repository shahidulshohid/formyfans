import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import CustomButton from "../cutomButon";
import {
  getDisplayName,
  getInitialName,
  getUserHandle,
  getUserProfileImage,
} from "../../utils/helper";
import { Link } from "react-router-dom";

export const FollowingCard = ({ item, handleUnfollow }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={2}
      px={2}
      py={1.5}
      border="1px solid"
      borderColor="divider"
      borderRadius="50px"
      component={Link}
      elevation={0}
      sx={{
        textDecoration: "none",
        boxShadow: "0px 8px 22px -16px rgba(0, 0, 0)",
      }}
      to={`/${item.username}/all-posts`}
    >
      <Avatar
        src={getUserProfileImage(item)}
        sx={{ width: "42px", height: "42px" }}
      >
        {getInitialName(item)}
      </Avatar>
      <Box flex={1}>
        <Typography
          variant="body1"
          color="neutral.deepPink"
          fontWeight={600}
          noWrap
        >
          {getDisplayName(item)}
        </Typography>
        <Typography
          fontSize={"12px"}
          color="text.darkBrown"
          fontWeight={400}
          lineHeight={1}
          noWrap
        >
          {getUserHandle(item)}
        </Typography>
      </Box>

      <Chip
        variant="contained"
        label={"Unfollow"}
        size="small"
        sx={{
          backgroundColor: "neutral.deepPink",
          color: "text.white",
          "&:hover": {
            backgroundColor: "background.deepPink",
            color: "text.white",
          },
        }}
        clickable
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleUnfollow(item._id);
        }}
      />
    </Stack>
  );
};
