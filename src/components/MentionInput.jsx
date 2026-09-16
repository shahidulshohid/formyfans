import { Avatar, Box, CircularProgress, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchTaggableUsers } from "../api/modules/post";
import { useDebounce } from "../hooks";
import {
  getDisplayName,
  getInitialName,
  getUserHandle,
  getUserProfileImage,
} from "../utils/helper";

const detectMention = (text, cursorPos) => {
  const beforeCursor = text.slice(0, cursorPos);
  const atIndex = beforeCursor.lastIndexOf("@");
  if (atIndex === -1) return null;
  // @ must be at start or preceded by whitespace
  if (atIndex > 0 && !/\s/.test(beforeCursor[atIndex - 1])) return null;
  const query = beforeCursor.slice(atIndex + 1);
  // No spaces allowed in mention query
  if (/\s/.test(query)) return null;
  return { query, startIndex: atIndex };
};

const MentionInput = ({
  value,
  onChange,
  mentions = [],
  onMentionsChange,
  placeholder = "Write a comment...",
  onKeyDown,
  onSubmit,
  disabled = false,
  multiline = false,
  maxRows,
  fullWidth = true,
  size = "small",
  sx,
  ...rest
}) => {
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionUsers, setMentionUsers] = useState([]);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(mentionQuery, 300);

  // Fetch users when query changes
  useEffect(() => {
    if (debouncedQuery === null || debouncedQuery === undefined) return;
    let cancelled = false;

    const fetchUsers = async () => {
      setMentionLoading(true);
      try {
        const res = await searchTaggableUsers({
          search: debouncedQuery,
          page: 1,
          limit: 8,
        });
        if (!cancelled && (res?.status === 200 || res?.status === 201)) {
          setMentionUsers(res?.data?.data ?? []);
        }
      } catch {
        if (!cancelled) setMentionUsers([]);
      } finally {
        if (!cancelled) setMentionLoading(false);
      }
    };

    fetchUsers();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      onChange(e);

      const cursorPos = e.target.selectionStart;
      const mention = detectMention(newValue, cursorPos);
      if (mention) {
        setMentionQuery(mention.query);
        setShowDropdown(true);
        setActiveIndex(-1);
      } else {
        setMentionQuery(null);
        setShowDropdown(false);
      }
    },
    [onChange],
  );

  const insertMention = useCallback(
    (user) => {
      const el = inputRef.current;
      const cursorPos = el?.selectionStart ?? value?.length ?? 0;
      const mention = detectMention(value || "", cursorPos);
      if (!mention) return;

      const username = user.username;
      const before = (value || "").slice(0, mention.startIndex);
      const after = (value || "").slice(cursorPos);
      const newText = `${before}@${username} ${after}`;

      // Update text via synthetic event
      onChange({ target: { value: newText } });

      // Track mention ID
      if (onMentionsChange && user._id && !mentions.includes(user._id)) {
        onMentionsChange([...mentions, user._id]);
      }

      // Close dropdown
      setMentionQuery(null);
      setShowDropdown(false);
      setMentionUsers([]);

      // Restore cursor position after mention
      setTimeout(() => {
        if (el) {
          const pos = mention.startIndex + username.length + 2;
          el.focus();
          el.setSelectionRange(pos, pos);
        }
      }, 0);
    },
    [value, onChange, mentions, onMentionsChange],
  );

  const handleKeyDown = useCallback(
    (e) => {
      // Dropdown navigation
      if (showDropdown && mentionUsers.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < mentionUsers.length - 1 ? prev + 1 : 0,
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : mentionUsers.length - 1,
          );
          return;
        }
        if (e.key === "Enter" && activeIndex >= 0) {
          e.preventDefault();
          insertMention(mentionUsers[activeIndex]);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowDropdown(false);
          setMentionQuery(null);
          return;
        }
      }

      // Space while mention active → close dropdown
      if (e.key === " " && mentionQuery !== null) {
        setShowDropdown(false);
        setMentionQuery(null);
      }

      onKeyDown?.(e);
    },
    [showDropdown, mentionUsers, activeIndex, insertMention, mentionQuery, onKeyDown],
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!showDropdown) {
      setMentionUsers([]);
      setActiveIndex(-1);
    }
  }, [showDropdown]);

  const renderDropdown = useMemo(() => {
    if (!showDropdown) return null;
    return (
      <Box
        ref={dropdownRef}
        sx={{
          position: "absolute",
          bottom: "100%",
          left: 0,
          right: 0,
          mb: 0.5,
          bgcolor: "colors.white",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          maxHeight: 240,
          overflowY: "auto",
          zIndex: 1300,
          border: "1px solid",
          borderColor: "neutral.ligthColor",
        }}
      >
        {mentionLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={20} sx={{ color: "#FF1572" }} />
          </Box>
        ) : mentionUsers.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2, fontSize: 13 }}
          >
            No users found
          </Typography>
        ) : (
          mentionUsers.map((user, idx) => (
            <Box
              key={user._id}
              onClick={() => insertMention(user)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.5,
                py: 0.75,
                cursor: "pointer",
                bgcolor:
                  idx === activeIndex
                    ? "rgba(255, 21, 114, 0.08)"
                    : "transparent",
                "&:hover": {
                  bgcolor: "rgba(255, 21, 114, 0.1)",
                },
              }}
            >
              <Avatar
                src={getUserProfileImage(user)}
                sx={{ width: 32, height: 32, flexShrink: 0 }}
              >
                {getInitialName(user)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  fontSize={13}
                >
                  {getDisplayName(user)}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {getUserHandle(user)}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>
    );
  }, [showDropdown, mentionLoading, mentionUsers, activeIndex, insertMention]);

  return (
    <Box sx={{ position: "relative", width: fullWidth ? "100%" : undefined }}>
      {renderDropdown}
      <TextField
        inputRef={inputRef}
        fullWidth={fullWidth}
        multiline={multiline}
        maxRows={maxRows}
        size={size}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        sx={sx}
        {...rest}
      />
    </Box>
  );
};

export default MentionInput;

/**
 * Renders comment content with @username mentions highlighted in deepPink bold.
 * Matches @word at word boundaries (start or after whitespace).
 */
const mentionRegex = /(@\w[\w.]*)/g;

export const MentionText = ({ content, sx }) => {
  if (!content) return null;

  const parts = content.split(mentionRegex);

  return (
    <Typography
      variant="body2"
      fontSize={13}
      sx={{ wordBreak: "break-word", ...sx }}
    >
      {parts.map((part, i) => {
        if (part.match(mentionRegex)) {
          return (
            <Box
              key={i}
              component="span"
              sx={{
                color: "#FF1572",
                fontWeight: 600,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {part}
            </Box>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </Typography>
  );
};
