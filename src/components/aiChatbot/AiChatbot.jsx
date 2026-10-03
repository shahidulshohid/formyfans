import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  InputBase,
  Chip,
  Grow,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";
import { aiChatBoatImg } from "../../assets/aiAssets";
import useUserStore from "../../zustand/userUserStore";
import { getAiChatHistory, sendAiChatMessage } from "../../api/aiContent/aiChatbot";

// Initial welcoming message fallback
const INITIAL_MESSAGES = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "👋 Hey there! I'm **RENE**, your AI assistant for ForMyFansOnly (FMFO).\n\nI can help you craft viral UGC scripts, generate AI image & video ideas, write killer captions, or optimize your content for your fans! How can I assist you today?",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    quickActions: [
      { label: "🎨 Create AI Image", path: "/ai-create-image" },
      { label: "🎬 Create AI Video", path: "/ai-create-video" },
      { label: "✂️ AI Video Edit", path: "/ai-create-video-edit" },
    ],
  },
];

// Format ISO date string to user-friendly local time
const formatMessageTime = (isoString) => {
  if (!isoString) {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
};

export const AiChatbot = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const activeUserId = user?._id || user?.id || "6aa27ecc8c2bfc8162153f03";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat history from backend API
  const fetchChatHistory = useCallback(
    async (showLoading = true) => {
      if (!activeUserId) return;
      if (showLoading) setIsLoadingHistory(true);

      try {
        const data = await getAiChatHistory(activeUserId);

        if (data && Array.isArray(data.messages) && data.messages.length > 0) {
          const formattedMessages = data.messages.map((item, index) => ({
            id: `msg-${index}-${item.created_at || Date.now()}`,
            sender: item.role === "assistant" || item.role === "bot" ? "bot" : "user",
            text: item.message,
            timestamp: formatMessageTime(item.created_at),
          }));
          setMessages(formattedMessages);
        } else {
          // If no previous history, show welcome message
          setMessages(INITIAL_MESSAGES);
        }
        setHistoryLoaded(true);
      } catch (err) {
        console.warn("Failed to load chat history, using fallback:", err);
        if (messages.length === 0) {
          setMessages(INITIAL_MESSAGES);
        }
      } finally {
        if (showLoading) setIsLoadingHistory(false);
      }
    },
    [activeUserId, messages.length]
  );

  // Fetch history when user opens the chatbot for the first time
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      fetchChatHistory(true);
    }
  }, [isOpen, historyLoaded, fetchChatHistory]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, messages, isTyping]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // Send message handler connecting directly to API
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call real backend API
      const response = await sendAiChatMessage(activeUserId, text);

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text:
          response?.AI_response ||
          response?.message ||
          "I'm here to help! What else would you like assistance with?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error("Failed to get AI response from backend API:", err);

      const errorMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text:
          "⚠️ Sorry, I encountered a temporary connection issue. Please try sending your message again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleToolClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Image source with fallback to public path
  const botIconSrc = aiChatBoatImg || "/aiPowerContent/aiChatBoatImg.png";

  return (
    <>
      {/* 1. Floating AI Chatbot Button (Matches User Screenshot) */}
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 24, sm: 32, md: 36 },
          right: { xs: 20, sm: 30, md: 36 },
          zIndex: 1400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Tooltip
          title={isOpen ? "Close RENE" : "Chat with RENE"}
          placement="left"
          arrow
        >
          <Box
            onClick={handleToggle}
            role="button"
            tabIndex={0}
            aria-label="RENE AI Chatbot"
            sx={{
              width: { xs: 50, sm: 56 },
              height: { xs: 50, sm: 56 },
              borderRadius: "50%",
              bgcolor: "#FF1572",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {/* Robot Image Icon from public/aiPowerContent/aiChatBoatImg.png */}
            <Box
              component="img"
              src={botIconSrc}
              alt="RENE"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/aiPowerContent/aiChatBoatImg.png";
              }}
              sx={{
                width: { xs: 26, sm: 30 },
                height: { xs: 26, sm: 30 },
                objectFit: "contain",
                filter: "brightness(0) invert(1)", // Ensure crisp pure white
                transition: "transform 0.3s ease",
                transform: isOpen ? "rotate(90deg) scale(0.9)" : "none",
              }}
            />

            {/* Notification Badge if unread */}
            {hasUnread && !isOpen && (
              <Box
                sx={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 14,
                  height: 14,
                  bgcolor: "#00E676",
                  borderRadius: "50%",
                  border: "2px solid #ffffff",
                  boxShadow: "0 0 8px #00E676",
                }}
              />
            )}
          </Box>
        </Tooltip>
      </Box>

      {/* 2. AI Chatbot Floating Window / Drawer */}
      <Grow in={isOpen} style={{ transformOrigin: "bottom right" }} timeout={300}>
        <Paper
          elevation={12}
          sx={{
            position: "fixed",
            bottom: { xs: 88, sm: 104 },
            right: { xs: 16, sm: 30, md: 36 },
            width: { xs: "calc(100vw - 32px)", sm: "400px", md: "420px" },
            maxWidth: "420px",
            height: { xs: "580px", sm: "620px" },
            maxHeight: "calc(100vh - 130px)",
            borderRadius: "24px",
            bgcolor: "#ffffff",
            display: isOpen ? "flex" : "none",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1400,
            border: "1px solid rgba(255, 21, 114, 0.15)",
            boxShadow:
              "0 20px 50px -10px rgba(0, 0, 0, 0.2), 0 10px 25px -5px rgba(255, 21, 114, 0.15)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              background: "linear-gradient(135deg, #FF1572 0%, #D80050 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 4px 14px rgba(216, 0, 80, 0.25)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Bot Avatar */}
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  border: "1.5px solid rgba(255, 255, 255, 0.4)",
                }}
              >
                <Box
                  component="img"
                  src={botIconSrc}
                  alt="RENE"
                  sx={{
                    width: 22,
                    height: 22,
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    bgcolor: "#00E676",
                    borderRadius: "50%",
                    border: "2px solid #FF1572",
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "15px",
                      lineHeight: 1.2,
                      letterSpacing: "-0.2px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    RENE
                  </Typography>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "#FFE082" }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "11px",
                    opacity: 0.9,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#00E676",
                    }}
                  />
                  Always active • Powered by AI
                </Typography>
              </Box>
            </Box>

            {/* Header Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title="Refresh History" arrow>
                <IconButton
                  size="small"
                  onClick={() => fetchChatHistory(true)}
                  disabled={isLoadingHistory}
                  sx={{
                    color: "rgba(255, 255, 255, 0.85)",
                    "&:hover": {
                      color: "#ffffff",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(255, 255, 255, 0.4)",
                    },
                  }}
                >
                  <RefreshRoundedIcon
                    sx={{
                      fontSize: 20,
                      animation: isLoadingHistory ? "spin 1s linear infinite" : "none",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>

              <Tooltip title="Close" arrow>
                <IconButton
                  size="small"
                  onClick={() => setIsOpen(false)}
                  sx={{
                    color: "rgba(255, 255, 255, 0.85)",
                    "&:hover": {
                      color: "#ffffff",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Chat Messages Body */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: "#FAF9FB",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              "&::-webkit-scrollbar": {
                width: "5px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0, 0, 0, 0.15)",
                borderRadius: "10px",
              },
            }}
          >
            {/* Loading History Indicator */}
            {isLoadingHistory && messages.length === 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 6,
                  gap: 1.5,
                  color: "#FF1572",
                }}
              >
                <CircularProgress size={28} thickness={4} sx={{ color: "#FF1572" }} />
                <Typography
                  sx={{
                    fontSize: "12.5px",
                    color: "#8E8E93",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Loading conversations...
                </Typography>
              </Box>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      maxWidth: "90%",
                    }}
                  >
                    {!isUser && (
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "#FF1572",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          mt: 0.3,
                          boxShadow: "0 2px 6px rgba(255, 21, 114, 0.3)",
                        }}
                      >
                        <Box
                          component="img"
                          src={botIconSrc}
                          alt="RENE"
                          sx={{
                            width: 16,
                            height: 16,
                            objectFit: "contain",
                            filter: "brightness(0) invert(1)",
                          }}
                        />
                      </Box>
                    )}

                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: isUser
                          ? "20px 20px 4px 20px"
                          : "20px 20px 20px 4px",
                        bgcolor: isUser ? "#FF1572" : "#ffffff",
                        color: isUser ? "#ffffff" : "#1A1A1A",
                        boxShadow: isUser
                          ? "0 4px 14px rgba(255, 21, 114, 0.25)"
                          : "0 2px 10px rgba(0, 0, 0, 0.05)",
                        border: isUser ? "none" : "1px solid rgba(0, 0, 0, 0.06)",
                        fontSize: "13.5px",
                        lineHeight: 1.5,
                        fontFamily: "Inter, sans-serif",
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}

                      {/* Tool / Navigation Shortcuts inside Bot Message */}
                      {(msg.tools || msg.quickActions) && (
                        <Box
                          sx={{
                            mt: 1.5,
                            pt: 1.2,
                            borderTop: isUser
                              ? "1px solid rgba(255, 255, 255, 0.2)"
                              : "1px solid rgba(0, 0, 0, 0.08)",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.8,
                          }}
                        >
                          {(msg.tools || msg.quickActions).map((action, idx) => (
                            <Chip
                              key={idx}
                              label={action.label}
                              clickable
                              size="small"
                              onClick={() => handleToolClick(action.path)}
                              deleteIcon={
                                <ArrowForwardRoundedIcon
                                  sx={{ fontSize: "14px !important", color: "#FF1572" }}
                                />
                              }
                              onDelete={() => handleToolClick(action.path)}
                              sx={{
                                bgcolor: "#FFF0F6",
                                color: "#FF1572",
                                fontWeight: 600,
                                fontSize: "12px",
                                border: "1px solid rgba(255, 21, 114, 0.25)",
                                "&:hover": {
                                  bgcolor: "#FF1572",
                                  color: "#ffffff",
                                  "& .MuiChip-deleteIcon": {
                                    color: "#ffffff",
                                  },
                                },
                                transition: "all 0.2s ease",
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Timestamp & Copy Action */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      px: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "10.5px",
                        color: "#8E8E93",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {msg.timestamp}
                    </Typography>

                    {!isUser && (
                      <Tooltip
                        title={copiedId === msg.id ? "Copied!" : "Copy message"}
                        arrow
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          sx={{
                            p: 0.3,
                            color: copiedId === msg.id ? "#00E676" : "#8E8E93",
                            "&:hover": { color: "#FF1572" },
                          }}
                        >
                          {copiedId === msg.id ? (
                            <CheckRoundedIcon sx={{ fontSize: 13 }} />
                          ) : (
                            <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              );
            })}

            {/* AI Typing Animation */}
            {isTyping && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: "#FF1572",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(255, 21, 114, 0.3)",
                  }}
                >
                  <Box
                    component="img"
                    src={botIconSrc}
                    alt="RENE"
                    sx={{
                      width: 16,
                      height: 16,
                      objectFit: "contain",
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    px: 2,
                    borderRadius: "20px 20px 20px 4px",
                    bgcolor: "#ffffff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: "#FF1572",
                      borderRadius: "50%",
                      animation: "typingBounce 1.2s infinite ease-in-out",
                      animationDelay: "0ms",
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: "#FF1572",
                      borderRadius: "50%",
                      animation: "typingBounce 1.2s infinite ease-in-out",
                      animationDelay: "200ms",
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: "#FF1572",
                      borderRadius: "50%",
                      animation: "typingBounce 1.2s infinite ease-in-out",
                      animationDelay: "400ms",
                    }}
                  />
                </Box>
                <style>
                  {`
                    @keyframes typingBounce {
                      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                      30% { transform: translateY(-5px); opacity: 1; }
                    }
                  `}
                </style>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Box */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: "#ffffff",
              borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                bgcolor: "#F4F5F7",
                borderRadius: "24px",
                px: 2,
                py: 0.6,
                border: "1.5px solid transparent",
                transition: "all 0.2s ease",
                "&:focus-within": {
                  borderColor: "#FF1572",
                  bgcolor: "#ffffff",
                  boxShadow: "0 0 0 3px rgba(255, 21, 114, 0.1)",
                },
              }}
            >
              <InputBase
                inputRef={inputRef}
                placeholder="Ask RENE anything (scripts, prompts, ideas)..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                multiline
                maxRows={3}
                sx={{
                  flex: 1,
                  fontSize: "13.5px",
                  fontFamily: "Inter, sans-serif",
                  color: "#1A1A1A",
                  "& input::placeholder": {
                    color: "#8E8E93",
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <IconButton
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              sx={{
                width: 42,
                height: 42,
                bgcolor: inputValue.trim() && !isTyping ? "#FF1572" : "#F0F0F0",
                color: inputValue.trim() && !isTyping ? "#ffffff" : "#A0A0A0",
                borderRadius: "50%",
                boxShadow:
                  inputValue.trim() && !isTyping
                    ? "0 4px 12px rgba(255, 21, 114, 0.35)"
                    : "none",
                "&:hover": {
                  bgcolor: "#E6005C",
                  color: "#ffffff",
                },
                "&.Mui-disabled": {
                  bgcolor: "#F0F0F0",
                  color: "#C0C0C0",
                },
                transition: "all 0.2s ease",
              }}
            >
              <SendRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Paper>
      </Grow>
    </>
  );
};

export default AiChatbot;
