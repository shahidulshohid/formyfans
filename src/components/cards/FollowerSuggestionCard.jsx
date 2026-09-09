import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import {
  getDisplayName,
  getInitialName,
  getShortTimeAgo,
  getUserProfileImage,
} from "../../utils/helper";

export const FollowerSuggestionCard = ({
  item,
  handleFollowUnfollow,
  isFollowing,
  handleRemove,
  createdAt,
}) => {
  return (
    <Box
      px={1}
      py={1}
      border="1px solid"
      borderColor="divider"
      borderRadius="10px"
      component={Link}
      bgcolor={"background.deepMaroon"}
      sx={{
        textDecoration: "none",
        boxShadow: "0px 8px 22px -16px rgba(0, 0, 0)",
        display: "block",
      }}
      to={`/${item.username}`}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <Avatar
          src={getUserProfileImage(item)}
          sx={{ width: "42px", height: "42px" }}
        >
          {getInitialName(item)}
        </Avatar>
        <Box flex={1}>
          <Typography
            variant="body1"
            color="text.white"
            fontWeight={600}
            noWrap
          >
            {getDisplayName(item)}
          </Typography>

          <Typography
            fontSize="12px"
            color="text.halfWhite"
            fontWeight={400}
            lineHeight={1.3}
            noWrap
          >
            Started following you
            {createdAt ? (
              <>
                <Box component="span" sx={{ mx: 0.5, opacity: 0.6 }}>
                  ·
                </Box>
                <Box component="span" sx={{ color: "secondary.main" }}>
                  {getShortTimeAgo(createdAt)}
                </Box>
              </>
            ) : null}
          </Typography>
        </Box>

        {/* <CustomButton title="Follow"
      sx={{
        height:"30px",
      }}
      /> */}
      </Stack>
      <Stack
        mt={1}
        gap={1}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        bgcolor="background.softPink"
        borderRadius="20px"
        px={1}
        py={0.5}
      >
        {!isFollowing && (
          <Chip
            variant="contained"
            label={"Remove"}
            size="small"
            sx={{
              width: "100%",
              backgroundColor: "background.white",
              color: "text.white",
              "&:hover": {
                backgroundColor: "background.white",
                color: "text.white",
              },
            }}
            clickable
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove(item._id);
            }}
          />
        )}
        <Chip
          variant="contained"
          label={isFollowing ? "Unfollow" : "Follow Back"}
          size="small"
          sx={{
            width: "100%",
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
            handleFollowUnfollow(item._id, isFollowing ? "unfollow" : "follow");
          }}
        />
      </Stack>
    </Box>
  );
};
