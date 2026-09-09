import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import InstaStories from "react-insta-stories";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getActiveStories } from "../../api/modules/story";
import { getDisplayName } from "../../utils/helper";
import moment from "moment";

const formatSubheading = (author = {}, createdAt) => {
  const username = author.username ? `@${author.username}` : "@user";
  if (!createdAt) return username;

  const createdDate = moment(createdAt);
  if (!createdDate.isValid()) return username;

  return `${username} · ${createdDate.fromNow()}`;
};

export const Stories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [storyGroups, setStoryGroups] = useState(
    location.state?.storyGroups || [],
  );
  const [activeGroupIndex, setActiveGroupIndex] = useState(
    location.state?.startGroupIndex || 0,
  );
  const [loading, setLoading] = useState(storyGroups.length === 0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [forcedStoryIndex, setForcedStoryIndex] = useState(null);
  const storyIndexRef = useRef(0);
  const pendingStoryIndexRef = useRef(null);

  useEffect(() => {
    setIsPaused(false);
    setCurrentStoryIndex(0);

    if (pendingStoryIndexRef.current !== null) {
      const index = pendingStoryIndexRef.current;
      pendingStoryIndexRef.current = null;
      storyIndexRef.current = index;
      setCurrentStoryIndex(index);
      setForcedStoryIndex(index);
      return;
    }

    storyIndexRef.current = 0;
    setForcedStoryIndex(null);
  }, [activeGroupIndex]);

  useEffect(() => {
    if (forcedStoryIndex === null) return undefined;

    const timer = setTimeout(() => setForcedStoryIndex(null), 50);
    return () => clearTimeout(timer);
  }, [forcedStoryIndex]);

  useEffect(() => {
    if (storyGroups.length > 0) return;

    const loadStories = async () => {
      setLoading(true);
      try {
        const response = await getActiveStories();
        if (response?.status === 200 || response?.status === 201) {
          setStoryGroups(response?.data?.storyGroups || []);
        } else {
          toast.error("Could not load stories.");
        }
      } catch (error) {
        toast.error(error?.message || "Could not load stories.");
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [storyGroups.length]);

  const currentGroup = storyGroups[activeGroupIndex];
  const mappedStories = useMemo(() => {
    const stories = currentGroup?.stories || [];
    const author = currentGroup?.author || {};

    return stories.map((story) => ({
      url: story.media,
      type: story.mediaType === "video" ? "video" : "image",
      muted: false,
      duration: story.mediaType === "video" ? 9000 : 5000,
      header: {
        heading: getDisplayName(author),
        subheading: formatSubheading(author, story.createdAt),
        profileImage: author.image || "",
      },
    }));
  }, [currentGroup]);

  const handleAllStoriesEnd = () => {
    if (activeGroupIndex < storyGroups.length - 1) {
      setActiveGroupIndex((prev) => prev + 1);
      return;
    }
    navigate("/home");
  };

  const forceStoryNavigation = (index) => {
    storyIndexRef.current = index;
    setCurrentStoryIndex(index);
    setForcedStoryIndex(index);
    setIsPaused(false);
  };

  const handleStoryStart = (index) => {
    storyIndexRef.current = index;
    setCurrentStoryIndex(index);
  };

  const handlePrevious = () => {
    const currentIndex = storyIndexRef.current;

    if (currentIndex > 0) {
      forceStoryNavigation(currentIndex - 1);
      return;
    }

    if (activeGroupIndex > 0) {
      const previousGroup = storyGroups[activeGroupIndex - 1];
      const lastStoryIndex = Math.max(
        0,
        (previousGroup?.stories?.length || 1) - 1,
      );
      pendingStoryIndexRef.current = lastStoryIndex;
      setActiveGroupIndex((prev) => prev - 1);
      setIsPaused(false);
    }
  };

  const handleNext = () => {
    const currentIndex = storyIndexRef.current;

    if (currentIndex < mappedStories.length - 1) {
      forceStoryNavigation(currentIndex + 1);
      return;
    }

    if (activeGroupIndex < storyGroups.length - 1) {
      setActiveGroupIndex((prev) => prev + 1);
      setIsPaused(false);
      return;
    }

    navigate("/home");
  };

  const canGoPrevious = currentStoryIndex > 0 || activeGroupIndex > 0;
  const canGoNext =
    currentStoryIndex < mappedStories.length - 1 ||
    activeGroupIndex < storyGroups.length - 1;

  const navButtonSx = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    color: "#fff",
    bgcolor: "rgba(0,0,0,0.45)",
    "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
    "&.Mui-disabled": {
      color: "rgba(255,255,255,0.35)",
      bgcolor: "rgba(0,0,0,0.25)",
    },
  };

  const handleClose = () => {
    navigate("/home");
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        bgcolor="#000"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress sx={{ color: "#FF1572" }} />
      </Box>
    );
  }

  if (!currentGroup || mappedStories.length === 0) {
    return (
      <Box
        minHeight="100vh"
        bgcolor="#000"
        color="#fff"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <Typography>No active stories found.</Typography>
        <IconButton
          onClick={handleClose}
          sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      bgcolor="#000"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 2,
          color: "#fff",
          bgcolor: "rgba(0,0,0,0.45)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <IconButton
        onClick={handleTogglePause}
        aria-label={isPaused ? "Play story" : "Pause story"}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          color: "#fff",
          bgcolor: "rgba(0,0,0,0.45)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
        }}
      >
        {isPaused ? (
          <PlayArrowIcon sx={{ fontSize: 28 }} />
        ) : (
          <PauseIcon sx={{ fontSize: 28 }} />
        )}
      </IconButton>

      <IconButton
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        aria-label="Previous story"
        sx={{ ...navButtonSx, left: 12 }}
      >
        <ChevronLeftIcon sx={{ fontSize: 32 }} />
      </IconButton>

      <IconButton
        onClick={handleNext}
        disabled={!canGoNext}
        aria-label="Next story"
        sx={{ ...navButtonSx, right: 12 }}
      >
        <ChevronRightIcon sx={{ fontSize: 32 }} />
      </IconButton>

      <InstaStories
        key={currentGroup?.author?._id || activeGroupIndex}
        stories={mappedStories}
        defaultInterval={5000}
        width={420}
        height="92vh"
        keyboardNavigation
        isPaused={isPaused}
        currentIndex={forcedStoryIndex ?? undefined}
        onStoryStart={handleStoryStart}
        onAllStoriesEnd={handleAllStoriesEnd}
      />
    </Box>
  );
};
