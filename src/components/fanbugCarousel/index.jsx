import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Avatar, Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Gift, Gem } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDisplayName,
  getInitialName,
  getUserProfileImage,
} from "../../utils/helper";

const AUTO_PLAY_MS = 3500;

export const FanbugCarousel = ({ items = [] }) => {
  const [index, setIndex] = useState(0);
  const active = items[index] || items[0];
  const canNavigate = items.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [items.length, items[0]?._id]);

  useEffect(() => {
    if (!canNavigate) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [canNavigate, items.length, index]);

  const goPrev = () => {
    if (!canNavigate) return;
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setIndex((prev) => (prev + 1) % items.length);
  };

  if (!active) return null;

  return (
    <Box
      flexShrink={0}
      px={1}
      pt={1.25}
      pb={1}
      borderBottom="1px solid"
      borderColor="background.lightGray"
      bgcolor="rgba(255, 21, 114, 0.04)"
    >
      <Box display="flex" alignItems="center" gap={0.1}>
        <IconButton
          size="small"
          onClick={goPrev}
          disabled={!canNavigate}
          aria-label="Previous Fanbug"
          sx={{
            color: "text.deepPink",
            flexShrink: 0,
            "&.Mui-disabled": { color: "rgba(255, 21, 114, 0.25)" },
          }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        <Box
          key={active._id}
          flex={1}
          minWidth={0}
          display="flex"
          gap={1}
          alignItems="flex-start"
          sx={{
            bgcolor: "rgba(255, 21, 114, 0.1)",
            border: "1px solid rgba(255, 21, 114, 0.28)",
            borderRadius: "10px",
            px: 1.25,
            py: 1,
          }}
        >
          <Avatar
            src={getUserProfileImage(active.author)}
            sx={{ width: 26, height: 26, fontSize: 10 }}
          >
            {getInitialName(active.author)}
          </Avatar>
          <Box minWidth={0} flex={1}>
            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              minWidth={0}
              sx={{ overflow: "hidden" }}
            >
              <Typography
                fontSize={12}
                fontWeight={700}
                color="text.darkBrown"
                noWrap
                sx={{ flexShrink: 1, minWidth: 0 }}
              >
                {active.author?.username || getDisplayName(active.author)}
              </Typography>
              <Box
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                width={22}
                height={22}
                borderRadius="6px"
                bgcolor="background.deepPink"
                color="text.white"
                flexShrink={0}
              >
                <Gift size={11} />
              </Box>
              <Typography
                fontSize={11}
                fontWeight={700}
                color="text.deepPink"
                display="inline-flex"
                alignItems="center"
                gap={0.4}
                flexShrink={0}
                whiteSpace="nowrap"
              >
                <Gem size={13} />
                {Number(active.fanbugAmount || 0).toFixed(2)} Fan bucks
              </Typography>
            </Box>
                   </Box>
        </Box>

        <IconButton
          size="small"
          onClick={goNext}
          disabled={!canNavigate}
          aria-label="Next Fanbug"
          sx={{
            color: "text.deepPink",
            flexShrink: 0,
            "&.Mui-disabled": { color: "rgba(255, 21, 114, 0.25)" },
          }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* {canNavigate && (
        <Box display="flex" justifyContent="center" gap={0.5} mt={0.75}>
          {items.map((item, dotIndex) => (
            <Box
              key={item._id}
              onClick={() => setIndex(dotIndex)}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                cursor: "pointer",
                bgcolor:
                  dotIndex === index
                    ? "background.deepPink"
                    : "rgba(255, 21, 114, 0.25)",
              }}
            />
          ))}
        </Box>
      )} */}
    </Box>
  );
};

export default FanbugCarousel;
