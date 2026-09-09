import {
  Box,
  Typography,
  Skeleton,
  CircularProgress,
  Avatar,
  Drawer,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getDisplayName,
  getInitialName,
  getUserCoverImage,
  getUserHandle,
  getUserProfileImage,
  modifyConversations,
  numberFormatter,
} from "../../utils/helper";
import { follow, unfollow } from "../../api/modules/follow";
import useUserStore from "../../zustand/userUserStore";
import { createConversation } from "../../api/modules/conversation";
import { useNavigate } from "react-router-dom";
import useActiveChatStore from "../../zustand/activeChatStore";
import useConversationStore from "../../zustand/conversationStore";
import CustomButton from "../../components/cutomButon";
import FollowersAndFollowing from "./followersAndFollowing";

// ─── Small reusable stat pill ───────────────────────────────────────────────
const StatItem = ({ number, label }) => (
  <Box display="flex" flexDirection="column" alignItems="center" minWidth={64}>
    <Typography
      fontWeight={600}
      fontSize={{ xs: 15, md: 17 }}
      color="text.primary"
      lineHeight={1}
    >
      {number}
    </Typography>
    <Typography fontSize={11} color="text.secondary" mt={0.4}>
      {label}
    </Typography>
  </Box>
);

// ─── Follow / Unfollow button ────────────────────────────────────────────────
const FollowButton = ({ isFollowing, onClick, disabled }) => (
  <Box
    component="button"
    onClick={onClick}
    disabled={disabled}
    sx={{
      border: isFollowing ? "2px solid #FF1572" : "2px solid #FF1572",
      background: isFollowing ? "#FFFFFF" : "#FF1572",
      color: isFollowing ? "#5E1321" : "#FFFFFF",
      borderRadius: "20px",
      px: 2.5,
      py: 0.8,
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "inherit",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        background: isFollowing ? "rgba(255, 21, 114, 0.08)" : "#E0115F",
      },
      "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
      whiteSpace: "nowrap",
    }}
  >
    {isFollowing ? "Following" : "Follow"}
  </Box>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const ProfileHeader = ({ profileData, setProfileData, isLoading }) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { setActiveChat } = useActiveChatStore();
  const { fetchConversations } = useConversationStore();
  const [loading, setLoading] = useState({
    follow: false,
    chat: false,
  });
  const [followersDrawerOpen, setFollowersDrawerOpen] = useState(false);

  const displayName = useMemo(
    () => getDisplayName(profileData || { firstName: "", lastName: "" }),
    [profileData],
  );
  const userHandle = useMemo(
    () => getUserHandle(profileData || { username: "" }),
    [profileData],
  );
  const userProfileImage = useMemo(
    () => getUserProfileImage(profileData || { image: "" }),
    [profileData],
  );
  const userCoverImage = useMemo(
    () => getUserCoverImage(profileData || { coverImage: "" }),
    [profileData],
  );
  const userInitialName = useMemo(
    () => getInitialName(profileData || { firstName: "", lastName: "" }),
    [profileData],
  );

  const isOwnProfile = user?._id === profileData?._id;

  const stats = [
    {
      number: numberFormatter.format(profileData?.likesCount || 0),
      label: "Likes",
    },
    {
      number: numberFormatter.format(profileData?.followersCount || 0),
      label: "Followers",
    },
    {
      number: numberFormatter.format(profileData?.followingCount || 0),
      label: "Following",
    },
    {
      number: numberFormatter.format(profileData?.photosCount || 0),
      label: "Photos",
    },
    {
      number: numberFormatter.format(profileData?.videosCount || 0),
      label: "Videos",
    },
  ];

  // ── Follow / Unfollow with optimistic update ────────────────────────────
  const handleFollowUnfollow = async () => {
    if (!profileData?._id || isOwnProfile || loading?.follow) return;

    const type = profileData.isFollowing ? "unfollow" : "follow";
    const prevData = { ...profileData };

    // Optimistic update
    setProfileData((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      followersCount: prev.followersCount + (type === "follow" ? 1 : -1),
    }));

    setLoading((prev) => ({ ...prev, follow: true }));
    try {
      const response = await (type === "follow"
        ? follow({ userId: profileData._id })
        : unfollow(profileData._id));

      if (response?.data?.status === "success") {
        // toast.success(response.data.message);
      } else {
        setProfileData(prevData); // revert
        // toast.error(response?.data?.message || "Action failed");
      }
    } catch {
      setProfileData(prevData); // revert
      // toast.error("Something went wrong, please try again");
    } finally {
      setLoading((prev) => ({ ...prev, follow: false }));
    }
  };

  // Handle Initiate Chat
  const handleInitiateChat = useCallback(async (profileId) => {
    try {
      setLoading((prev) => ({ ...prev, chat: true }));
      const response = await createConversation({
        participantId: profileId,
      });

      if (response.status === 200 || response.status === 201) {
        // toast.success(response.data.message);
        const modifiedConversations = modifyConversations(
          [response.data.data],
          user,
        );

        setActiveChat(modifiedConversations[0]);
        fetchConversations();
        navigate("/chat");
      } else {
        // toast.error(response.data.message);
      }
    } catch (error) {
      // toast.error(error?.message);
    } finally {
      setLoading((prev) => ({ ...prev, chat: false }));
    }
  }, []);

  if (isLoading?.profile) {
    return (
      <Box mt={1}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={260}
          sx={{ borderRadius: "20px" }}
        />
        <Box display="flex" gap={2} mt={2} px={2}>
          <Skeleton variant="circular" width={100} height={100} />
          <Box flex={1}>
            <Skeleton width="40%" height={28} />
            <Skeleton width="25%" height={20} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box mt={1}>
      {/* ── Cover image ───────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 150, md: 260, lg: 320 },
          borderRadius: "20px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #8B3A4A 0%, #3a1020 100%)",
        }}
      >
        {userCoverImage ? (
          <Box
            component="img"
            src={userCoverImage}
            alt="cover"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
            }}
          >
            <Typography
              fontSize={{ xs: 14, md: 16 }}
              fontWeight={500}
              color="rgba(255, 255, 255, 0.75)"
              textAlign="center"
            >
              No cover photo
            </Typography>
          </Box>
        )}

        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(15,5,10,0.65) 100%)",
          }}
        />

        {/* Tagline badge */}
        {profileData?.tagLine && (
          <Box
            sx={{
              position: "absolute",
              top: 14,
              left: 16,
              background: "#FF1572",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              px: 2,
              py: 0.6,
              borderRadius: "20px",
            }}
          >
            {profileData.tagLine}
          </Box>
        )}
      </Box>

      {/* ── Avatar + name + actions row ───────────────────────────────── */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-end" }}
        gap={{ xs: 1.5, sm: 0 }}
        mt={{ xs: "-35px", md: "-56px" }}
        px={2}
        position="relative"
        zIndex={2}
      >
        {/* Avatar + name */}
        <Box display="flex" alignItems="flex-end" gap={1.5} minWidth={0}>
          <Box position="relative" flexShrink={0}>
            <Avatar
              src={userProfileImage}
              alt={displayName}
              sx={{
                width: { xs: 80, md: 110 },
                height: { xs: 80, md: 110 },
                borderRadius: "50%",
                border: { xs: "3px solid #FF1572", md: "4px solid #FF1572" },
                objectFit: "cover",
                background: "#3a1020",
              }}
            >
              {userInitialName}
            </Avatar>
            {/* Online dot */}
            {/* <Box
              sx={{
                position: "absolute",
                bottom: { xs: 4, md: 6 },
                right: { xs: 3, md: 5 },
                width: { xs: 12, md: 14 },
                height: { xs: 12, md: 14 },
                borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid #0f0508",
              }}
            /> */}
          </Box>

          <Box pb={0.5}>
            <Typography
              fontWeight={600}
              fontSize={{ xs: 16, md: 20 }}
              color="text.primary"
              lineHeight={1.2}
              noWrap
            >
              {displayName}
            </Typography>
            <Typography
              fontSize={13}
              color="text.secondary"
              mt={0.3}
              noWrap
              sx={{
                maxWidth: { xs: 160, sm: "none" },
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userHandle}
            </Typography>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box
          display="flex"
          gap={1}
          pb={0.5}
          width={{ xs: "100%", sm: "auto" }}
          justifyContent={{ xs: "flex-end", sm: "flex-start" }}
        >
          {!isOwnProfile ? (
            <>
              <FollowButton
                isFollowing={profileData?.isFollowing}
                onClick={handleFollowUnfollow}
                disabled={loading?.follow}
              />
              <Box
                component="button"
                onClick={() => handleInitiateChat(profileData?._id)}
                disabled={loading?.chat}
                sx={{
                  background: "#5E1321",
                  border: "2px solid #5E1321",
                  color: "#FFFFFF",
                  borderRadius: "20px",
                  px: 2.5,
                  py: 0.8,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": { background: "#4A0F1A", borderColor: "#4A0F1A" },
                  whiteSpace: "nowrap",
                }}
              >
                {loading?.chat ? <CircularProgress size={20} /> : "Message"}
              </Box>
            </>
          ) : (
            <>
              <CustomButton
                title="View Followers"
                handleClickBtn={() => setFollowersDrawerOpen(true)}
              />
              <CustomButton
                title="Edit Profile"
                handleClickBtn={() => navigate("/settings")}
                sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                // sx={{
                //   background: "#5E1321",
                //   border: "2px solid #5E1321",
                //   color: "#FFFFFF",
                // }}
              />
            </>
          )}
        </Box>
      </Box>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        px={2}
        mt={2}
        pb={1.5}
        sx={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        {stats.map((s, i) => (
          <StatItem key={i} number={s.number} label={s.label} />
        ))}
      </Box>

      {/* ── Bio ───────────────────────────────────────────────────────── */}
      {profileData?.bio && (
        <Box px={2} mt={1.5}>
          <Typography fontSize={13} color="text.secondary" lineHeight={1.7}>
            {profileData.bio}
          </Typography>
        </Box>
      )}

      {/* ── Location ──────────────────────────────────────────────────── */}
      {profileData?.location && (
        <Box display="flex" alignItems="center" gap={0.8} px={2} mt={1}>
          <Typography fontSize={13} color="text.secondary">
            📍 {profileData.location}
          </Typography>
        </Box>
      )}

      {/* ── Followers Drawer ──────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={followersDrawerOpen}
        onClose={() => setFollowersDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            maxWidth: "100%",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              Followers & Following
            </Typography>
            <Box
              component="button"
              onClick={() => setFollowersDrawerOpen(false)}
              sx={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              ✕
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <FollowersAndFollowing />
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ProfileHeader;
