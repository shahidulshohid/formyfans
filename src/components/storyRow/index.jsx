import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { getActiveStories } from "../../api/modules/story";
import { getUserHandle, getUserProfileImage } from "../../utils/helper";
import useUserStore from "../../zustand/userUserStore";
import { StoryUploadDialog } from "../dialogs";
import StoryRowSkeleton from "../skeleton/StoryRowSkeleton";
import { useNavigate } from "react-router-dom";
import { DUMMY_STORIES } from "../../constants/dummyAuth";

const StoryRow = () => {
  const navigate = useNavigate();
  // State for user details
  const { user } = useUserStore();
  // State for upload story dialog
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  // State for active stories (other users only — for story row UI)
  const [activeStories, setActiveStories] = useState(DUMMY_STORIES);
  const [allStoryGroups, setAllStoryGroups] = useState(DUMMY_STORIES);
  const [isLoading, setIsLoading] = useState(false);
  // State for show left and right arrows
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  // State for show right arrow
  const [showRightArrow, setShowRightArrow] = useState(false);
  // User current story
  const [userCurrentStory, setUserCurrentStory] = useState({
    story: null,
    index: 0,
  });
  // Scroll ref for scrollable container
  const scrollRef = useRef(null);

  // Function to open upload dialog
  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };

  // Function to close upload dialog
  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
  };

  // Function to get active stories
  const handleGetActiveStories = async () => {
    try {
      const response = await getActiveStories();
      if (response?.status === 200 || response?.status === 201) {
        const data = response.data?.storyGroups || [];
        if (Array.isArray(data) && data.length > 0) {
          setAllStoryGroups(data);

          const userStory = data.find((story) => story?.author?._id === user?._id);
          const userStoryIndex = data.findIndex(
            (story) => story?.author?._id === user?._id,
          );

          if (userStory) {
            setUserCurrentStory({
              story: userStory,
              index: userStoryIndex,
            });
          } else {
            setUserCurrentStory({ story: null, index: 0 });
          }

          const otherStories = data.filter(
            (story) => story?.author?._id !== user?._id,
          );
          setActiveStories(otherStories);
        }
      }
    } catch {
      // Backend offline: keep DUMMY_STORIES
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update arrows visibility
  const updateArrowsVisibility = () => {
    const node = scrollRef.current;
    if (!node) return;

    const hasOverflow = node.scrollWidth > node.clientWidth;
    setShowLeftArrow(hasOverflow && node.scrollLeft > 0);
    setShowRightArrow(
      hasOverflow && node.scrollLeft < node.scrollWidth - node.clientWidth - 1,
    );
  };

  // Function to scroll stories
  const handleScrollStories = (direction) => {
    const node = scrollRef.current;
    if (!node) return;

    const amount = Math.max(180, node.clientWidth * 0.65);
    node.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const openStoriesViewer = (startGroupIndex) => {
    navigate("/stories", {
      state: {
        storyGroups: allStoryGroups,
        startGroupIndex,
      },
    });
  };

  // Effect to get active stories
  useEffect(() => {
    handleGetActiveStories();
  }, []);

  // Effect to update arrows visibility
  useEffect(() => {
    updateArrowsVisibility();
  }, [activeStories.length]);

  // Effect to update arrows visibility on resize
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    node.addEventListener("scroll", updateArrowsVisibility);
    window.addEventListener("resize", updateArrowsVisibility);

    return () => {
      node.removeEventListener("scroll", updateArrowsVisibility);
      window.removeEventListener("resize", updateArrowsVisibility);
    };
  }, []);

  return (
    <>
      <Box sx={{ position: "relative" }}>
        {showLeftArrow && (
          <IconButton
            onClick={() => handleScrollStories("left")}
            sx={{
              position: "absolute",
              left: -6,
              top: 28,
              zIndex: 2,
              width: 28,
              height: 28,
              bgcolor: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
        {showRightArrow && (
          <IconButton
            onClick={() => handleScrollStories("right")}
            sx={{
              position: "absolute",
              right: -6,
              top: 28,
              zIndex: 2,
              width: 28,
              height: 28,
              bgcolor: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}

        <Box
          ref={scrollRef}
          display="flex"
          alignItems="flex-start"
          gap="20px"
          sx={{
            overflowX: "auto",
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {/* <Box>
            <Box
              sx={{
                position: "relative",
                cursor: userCurrentStory.story ? "pointer" : "default",
              }}
              onClick={() => {
                if (!userCurrentStory.story) return;
                openStoriesViewer(userCurrentStory.index);
              }}
            >
              <Avatar
                src={getUserProfileImage(user)}
                sx={{
                  width: 70,
                  height: 70,
                  border: userCurrentStory.story
                    ? "4px solid rgba(255, 21, 114, 1)"
                    : "4px solid rgb(197, 184, 187)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 1,
                  right: 1,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "1px solid rgb(116, 115, 115)",
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenUploadDialog();
                }}
              >
                <AddIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
          </Box> */}

          {isLoading ? (
            <StoryRowSkeleton count={6} />
          ) : (
            <>
              <Box>
                <Box
                  sx={{
                    position: "relative",
                    cursor: userCurrentStory.story ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (!userCurrentStory.story) return;
                    openStoriesViewer(userCurrentStory.index);
                  }}
                >
                  <Avatar
                    src={getUserProfileImage(user)}
                    sx={{
                      width: 70,
                      height: 70,
                      border: userCurrentStory.story
                        ? "4px solid rgba(94, 19, 33, 1)"
                        : "4px solid rgb(197, 184, 187)",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "1px solid rgb(116, 115, 115)",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenUploadDialog();
                    }}
                  >
                    <AddIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>
              </Box>
              {activeStories.length > 0 &&
                activeStories.map(({ author }) => (
                  <Box
                    key={author._id}
                    sx={{
                      width: 70,
                      textAlign: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    onClick={() => {
                      const startGroupIndex = allStoryGroups.findIndex(
                        (group) => group.author._id === author._id,
                      );
                      openStoriesViewer(startGroupIndex);
                    }}
                  >
                    <Avatar
                      src={getUserProfileImage(author)}
                      sx={{
                        width: 70,
                        height: 70,
                        border: !author.isActive
                          ? "4px solid rgba(94, 19, 33, 1)"
                          : "4px solid rgb(197, 184, 187)",
                      }}
                    />

                    <Typography
                      fontSize="12px"
                      fontWeight={500}
                      mt={0.5}
                      noWrap
                    >
                      {getUserHandle(author)}
                    </Typography>
                  </Box>
                ))}
            </>
          )}
        </Box>
      </Box>

      <StoryUploadDialog
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        onUploaded={handleGetActiveStories}
      />
    </>
  );
};

export default StoryRow;
