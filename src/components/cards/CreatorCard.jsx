import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { Box, Typography } from "@mui/material";
import { getDisplayName } from "../../utils/helper";
import CustomButton from "../cutomButon";

const CARD_BUTTON_SX = {
    width: "100%",
    minWidth: 0,
    height: 40,
    borderRadius: "20px",
    backgroundColor: "background.deepPink",
    whiteSpace: "nowrap",
    px: { xs: 0.75, sm: 1 },
    lineHeight: 1,
    fontSize: { xs: "11px", sm: "12px" },
  };

export const CreatorCard = ({
  item,
  isFollowing,
  isFavourite,
  navigateViewPageProfile,
  handleFollowUnfollow,
  handleFavoriteUnfavorite,
}) => {

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backgroundImage: item.coverImage
          ? `url(${item.coverImage})`
          : "linear-gradient(180deg, #8B3A4A 0%, #5E1321 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: { xs: 320, sm: 340, md: 360 },
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0px 16px 32px rgba(0, 0, 0, 0.35)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(94,19,33,0.75) 55%, rgba(94,19,33,0.95) 100%)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
        }}
      >
        {isFavourite ? (
          <FavoriteIcon
            onClick={() => handleFavoriteUnfavorite(item._id, "unfavorite")}
            sx={{
              fontSize: 22,
              color: "text.deepPink",
              cursor: "pointer",
            }}
          />
        ) : (
          <FavoriteBorderOutlinedIcon
            onClick={() => handleFavoriteUnfavorite(item._id, "favorite")}
            sx={{
              fontSize: 22,
              color: "text.deepPink",
              cursor: "pointer",
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 2, sm: 2.5 },
          pb: { xs: 2, sm: 2.5 },
          pt: 6,
          textAlign: "center",
        }}
      >
        <Typography
          color="primary.white"
          fontWeight={700}
          fontSize={{ xs: 18, sm: 20 }}
          lineHeight={1.2}
          noWrap
          title={getDisplayName(item)}
        >
          {getDisplayName(item)}
        </Typography>

        <Box display="flex" gap={2} justifyContent="center" mt={0.75}>
          <Typography color="primary.white" fontSize={12}>
            Following {item.followingCount ?? 0}
          </Typography>
          <Typography color="primary.white" fontSize={12}>
            Followers {item.followersCount ?? 0}
          </Typography>
        </Box>

        <Typography
          color="primary.white"
          fontSize={11}
          mt={1.5}
          mb={1.5}
          lineHeight={1.45}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minHeight: "2.9em",
          }}
        >
          {item.bio?.trim() || "No bio yet."}
        </Typography>

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} width="100%">
          <CustomButton
            title="View Profile"
            handleClickBtn={() => navigateViewPageProfile(item.username)}
            sx={CARD_BUTTON_SX}
          />
          <CustomButton
            title={isFollowing ? "Following" : "Follow"}
            handleClickBtn={() =>
              handleFollowUnfollow(
                item._id,
                isFollowing ? "unfollow" : "follow",
              )
            }
            // loading={followLoadingId === item._id}
            // disabled={followLoadingId === item._id}
            sx={CARD_BUTTON_SX}
          />
        </Box>
      </Box>
    </Box>
  );
};
