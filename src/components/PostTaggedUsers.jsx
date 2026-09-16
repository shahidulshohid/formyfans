import { Avatar, Box, Popover, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDisplayName,
  getInitialName,
  getUserHandle,
  getUserProfileImage,
} from "../utils/helper";

const PostTaggedUsers = ({ taggedUsers = [] }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Flat list of user objects (taggedUsers is [{ userId, user }])
  const users = useMemo(
    () => (taggedUsers ?? []).map((t) => t?.user).filter(Boolean),
    [taggedUsers],
  );

  const displayCount = 2;
  const shown = useMemo(() => users.slice(0, displayCount), [users]);
  const extraCount = users.length - displayCount;

  if (users.length === 0) return null;

  const goToProfile = (e, u) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(null);
    if (u?.username) navigate(`/profile/${u.username}`);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 0.4,
          mt: 0.15,
        }}
      >
        <Typography
          component="span"
          variant="body2"
          sx={{ fontSize: 12, color: "text.neutralGrey" }}
        >
          with
        </Typography>
        {shown.map((u, i) => (
          <Box
            key={u._id || i}
            component="span"
            onClick={(e) => goToProfile(e, u)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.25,
              cursor: "pointer",
            }}
          >
            <Avatar
              src={getUserProfileImage(u)}
              sx={{ width: 16, height: 16, fontSize: 8 }}
            >
              {getInitialName(u)}
            </Avatar>
            <Typography
              component="span"
              variant="body2"
              sx={{
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {getDisplayName(u)}
            </Typography>
            {i < shown.length - 1 && (
              <Typography
                component="span"
                variant="body2"
                sx={{ fontSize: 12, lineHeight: 1 }}
              >
                ,
              </Typography>
            )}
          </Box>
        ))}
        {extraCount > 0 && (
          <Typography
            component="span"
            variant="body2"
            onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: "neutral.deepPink",
              cursor: "pointer",
              lineHeight: 1,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            and {extraCount} other{extraCount > 1 ? "s" : ""}
          </Typography>
        )}
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              p: 1.5,
              minWidth: 220,
              maxWidth: 320,
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            },
          },
        }}
        onMouseLeave={() => setAnchorEl(null)}
        sx={{ pointerEvents: "none" }}
      >
        <Box sx={{ pointerEvents: "auto" }}>
          {users.map((u) => (
            <Box
              key={u._id}
              onClick={(e) => goToProfile(e, u)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                py: 0.5,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover", borderRadius: 1 },
              }}
            >
              <Avatar
                src={getUserProfileImage(u)}
                sx={{ width: 32, height: 32, flexShrink: 0 }}
              >
                {getInitialName(u)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  fontSize={13}
                >
                  {getDisplayName(u)}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {getUserHandle(u)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default PostTaggedUsers;