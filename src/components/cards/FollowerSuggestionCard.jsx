import { Avatar, Box, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import {
  getDisplayName,
  getInitialName,
  getShortTimeAgo,
  getUserProfileImage,
} from "../../utils/helper";
import { AppChip } from "../chip";

export const FollowerSuggestionCard = ({
  item,
  handleFollowUnfollow,
  isFollowing,
  handleRemove,
  createdAt,
}) => {
  return (
    <Box
      py={1.25}
      width="100%"
      component={Link}
      bgcolor="colors.white"
      sx={{
        textDecoration: "none",
        display: "block",
      }}
      to={`/${item.username}`}
    >
      <Stack direction="column" alignItems="start" gap={1.5} width="100%">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
          <Avatar
            src={getUserProfileImage(item)}
            sx={{ width: "42px", height: "42px" }}
          >
            {getInitialName(item)}
          </Avatar>
          <Box flex={1} minWidth={0} width="100%">
            <Typography
              variant="body1"
              color="neutral.black"
              fontWeight={700}
              noWrap
            >
              {getDisplayName(item)}
            </Typography>

            <Typography
              fontSize="12px"
              color="text.neutralGrey"
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
                  <Box component="span" sx={{ color: "neutral.deepPink" }}>
                    {getShortTimeAgo(createdAt)}
                  </Box>
                </>
              ) : null}
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          gap={1}
          flexShrink={0}
          width="100%"
        >
          {!isFollowing && (
            <AppChip
              label="Remove"
              borderColor="neutral.ligthColor"
              textColor="text.neutralGrey"
              bgColor="colors.white"
              hoverBgColor="background.lightgray"
              px={0.5}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemove(item._id);
              }}
            />
          )}
          <AppChip
            label={isFollowing ? "Unfollow" : "Follow Back"}
            borderColor="neutral.deepPink"
            textColor="neutral.deepPink"
            bgColor="colors.white"
            hoverBgColor="background.softPink"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFollowUnfollow(item._id, isFollowing ? "unfollow" : "follow");
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
};