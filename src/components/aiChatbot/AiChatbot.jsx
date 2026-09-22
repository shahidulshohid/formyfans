import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  InputBase,
  Chip,
  Grow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";
import { aiChatBoatImg } from "../../assets/aiAssets";

// Quick prompt suggestions
const QUICK_PROMPTS = [
  {
    id: "ugc_script",
    label: "🎬 UGC Video Script",
    text: "Write a 30-second viral UGC video script for a trending product with strong hooks and CTA.",
  },
  {
    id: "ai_image_prompt",
    label: "🎨 AI Image Prompt",
    text: "Generate 3 highly detailed, aesthetic AI image prompts for my creator portfolio.",
  },
  {
    id: "captions",
    label: "✍️ Viral Post Captions",
    text: "Give me 5 catchy caption ideas with high-engagement hashtags for my new post.",
  },
  {
    id: "video_edit",
    label: "✂️ Video Editing Ideas",
    text: "How can I edit my short-form video to maximize watch time and fan retention?",
  },
  {
    id: "fan_growth",
    label: "📈 Fan Growth Strategy",
    text: "What are the best strategies to convert casual viewers into paying fan subscribers?",
  },
];

// Initial welcoming messages
const INITIAL_MESSAGES = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "👋 Hey there! I'm your **AI Creative Assistant**.\n\nI can help you craft viral UGC scripts, generate AI image & video ideas, write killer captions, or optimize your content for your fans!",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    quickActions: [
      { label: "🎨 Create AI Image", path: "/ai-create-image" },
      { label: "🎬 Create AI Video", path: "/ai-create-video" },
      { label: "✂️ AI Video Edit", path: "/ai-create-video-edit" },
    ],
  },
];

// AI response generation logic
const generateAiResponse = (userQuery) => {
  const query = userQuery.toLowerCase().trim();

  // Bengali / Banglish greeting or query
  if (
    query.includes("kemon") ||
    query.includes("ki khobor") ||
    query.includes("bhalo") ||
    query.includes("tumi ke") ||
    query.includes("help") ||
    query.includes("sahajjo") ||
    query.includes("ki korte paro")
  ) {
    return {
      text: `আমি আপনার **AI কনটেন্ট অ্যাসিস্ট্যান্ট**! 🤖✨\n\nআমি আপনাকে যেভাবে সাহায্য করতে পারি:\n- 🎬 **UGC ভিডিও স্ক্রিপ্ট** লেখা\n- 🎨 **AI ইমেজ ও ভিডিও প্রম্পট** তৈরি করা\n- ✍️ আকর্ষনীয় **ক্যাপশন ও হ্যাশট্যাগ** জেনারেট করা\n- 📈 **ফ্যান গ্রোথ ও সাবস্ক্রিপশন** বাড়ানোর কৌশল\n\nআপনি কী ধরনের কনটেন্ট নিয়ে কাজ করতে চান বলুন?`,
      tools: [
        { label: "🎨 AI Image তৈরি করুন", path: "/ai-create-image" },
        { label: "🎬 AI Video তৈরি করুন", path: "/ai-create-video" },
      ],
    };
  }

  // Script generation
  if (
    query.includes("script") ||
    query.includes("ugc") ||
    query.includes("video script") ||
    query.includes("storyboard")
  ) {
    return {
      text: `🎬 **Viral 30-Second UGC Video Script**\n\n` +
        `**🎯 Hook (0-3s):**\n"Stop scrolling if you've been struggling to get real engagement on your content!" *(Visual: Dynamic close-up with energetic gesture)*\n\n` +
        `**⚡ Problem (3-10s):**\n"Creating high quality content daily is exhausting, and generic posts just don't convert fans anymore."\n\n` +
        `**💡 Solution (10-22s):**\n"That's why AI-powered content creation is a game changer. You can generate studio-quality images, cinematic videos, and automated edits in minutes!"\n\n` +
        `**🚀 Call To Action (22-30s):**\n"Try it right now on your creator dashboard and watch your fan community grow. Tap below to start creating!"`,
      tools: [
        { label: "🎬 Open AI Video Creator", path: "/ai-create-video" },
        { label: "✂️ Open AI Video Editor", path: "/ai-create-video-edit" },
      ],
    };
  }

  // AI Image prompts
  if (
    query.includes("image") ||
    query.includes("photo") ||
    query.includes("pic") ||
    query.includes("prompt") ||
    query.includes("chobi")
  ) {
    return {
      text: `🎨 **3 Aesthetic AI Image Prompts for High Engagement:**\n\n` +
        `**1. Cinematic Studio Portrait:**\n\`Hyper-realistic studio portrait, glamorous soft neon pink rim lighting, 8k resolution, photorealistic depth of field, 85mm lens, vogue magazine style --ar 16:9 --v 6.0\`\n\n` +
        `**2. Cyberpunk Creator Vibe:**\n\`Futuristic creator workspace with holographic screens, ambient magenta and violet lighting, ultra-detailed, cinematic octane render --ar 9:16\`\n\n` +
        `**3. Lifestyle Aesthetic:**\n\`Golden hour aesthetic lifestyle photo, warm soft sunlight, natural candid expression, cinematic film grain, minimalist modern interior\``,
      tools: [
        { label: "🎨 Generate This in AI Image", path: "/ai-create-image" },
      ],
    };
  }

  // Video editing
  if (
    query.includes("edit") ||
    query.includes("cut") ||
    query.includes("transition") ||
    query.includes("sound")
  ) {
    return {
      text: `✂️ **Pro Short-Form Video Editing Formula:**\n\n` +
        `1. **First 2 Seconds:** Add a visual pattern interrupt (fast zoom-in or motion graphic text overlay).\n` +
        `2. **Pacing:** Cut every 2.5 - 3 seconds to keep retention high.\n` +
        `3. **Sound Design:** Add subtle whoosh sounds on transitions and keep upbeat background music at -18dB.\n` +
        `4. **Captions:** Use bold, colorful dynamic animated subtitles with highlight colors (#FF1572).\n` +
        `5. **End Loop:** Connect the last sentence seamlessly back to the first sentence for infinite watch loops!`,
      tools: [
        { label: "✂️ Launch AI Video Editor", path: "/ai-create-video-edit" },
      ],
    };
  }

  // Captions & Hashtags
  if (
    query.includes("caption") ||
    query.includes("hashtag") ||
    query.includes("title") ||
    query.includes("bio")
  ) {
    return {
      text: `✍️ **5 High-Engagement Caption Options:**\n\n` +
        `**Option 1 (Curiosity Hook):**\n"Nobody talks about this secret to doubling fan engagement... 🤫 Watch till the end! Link in bio for exclusive content ✨"\n\n` +
        `**Option 2 (Relatable / Casual):**\n"Creating behind-the-scenes magic just for you guys today 💕 Which outfit was your favorite: 1 or 2? Drop a comment below 👇"\n\n` +
        `**Option 3 (Exclusive Teaser):**\n"Unfiltered & raw. Premium subscribers already got the full video 💎 Don't miss out on what's next!"\n\n` +
        `🔥 **Trending Hashtags:**\n#ForMyFans #ContentCreator #ViralUGC #CreatorEconomy #AIPowered #TrendingNow`,
    };
  }

  // Fan Growth & Monetization
  if (
    query.includes("growth") ||
    query.includes("fan") ||
    query.includes("subscriber") ||
    query.includes("monetiz") ||
    query.includes("money") ||
    query.includes("earn")
  ) {
    return {
      text: `📈 **Top 4 Strategies to Maximize Creator Revenue & Fans:**\n\n` +
        `1. **Exclusive Content Teasers:** Post teaser clips on your public feed, and gate the full VIP version for subscribers.\n` +
        `2. **Direct Chat Engagement:** Send personalized welcome audio or quick notes to new VIP subscribers to build loyalty.\n` +
        `3. **Consistent Posting Schedule:** Leverage our AI Video & Image tools to maintain 1-2 high-quality posts daily without burnout.\n` +
        `4. **Custom Fan Requests:** Offer customized video shoutouts or merchandise in your marketplace for high-ticket earnings!`,
    };
  }

  // General helpful response
  return {
    text: `✨ I understand! To give you the best assistance, here are a few things I can do for you right away:\n\n` +
      `• **Write a tailored script** for your next video\n` +
      `• **Generate optimized prompts** for AI Image & Video creation\n` +
      `• **Suggest catchy captions** and trending hashtags\n` +
      `• **Provide creator strategies** to grow your fans & earnings\n\n` +
      `What specific idea would you like to explore?`,
    tools: [
      { label: "🎨 Create AI Image", path: "/ai-create-image" },
      { label: "🎬 Create AI Video", path: "/ai-create-video" },
      { label: "✂️ AI Video Edit", path: "/ai-create-video-edit" },
    ],
  };
};

export const AiChatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const responseData = generateAiResponse(text);
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: responseData.text,
        tools: responseData.tools || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);

      if (!isOpen) {
        setHasUnread(true);
      }
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
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
          title={isOpen ? "Close AI Assistant" : "Chat with AI Assistant"}
          placement="left"
          arrow
        >
          <Box
            onClick={handleToggle}
            role="button"
            tabIndex={0}
            aria-label="AI Chatbot"
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
              alt="AI Chatbot"
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
                  alt="AI Bot"
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
                    AI Creator Assistant
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
              <Tooltip title="Clear Chat" arrow>
                <IconButton
                  size="small"
                  onClick={handleClearChat}
                  sx={{
                    color: "rgba(255, 255, 255, 0.85)",
                    "&:hover": {
                      color: "#ffffff",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                    },
                  }}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
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
                          alt="Bot"
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
                    alt="Bot"
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

          {/* Quick Suggestion Chips Carousel */}
          <Box
            sx={{
              px: 1.5,
              py: 1,
              bgcolor: "#ffffff",
              borderTop: "1px solid rgba(0, 0, 0, 0.05)",
              display: "flex",
              gap: 0.8,
              overflowX: "auto",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <Chip
                key={prompt.id}
                label={prompt.label}
                clickable
                size="small"
                onClick={() => handleSendMessage(prompt.text)}
                disabled={isTyping}
                sx={{
                  bgcolor: "#FAF0F4",
                  color: "#333333",
                  fontSize: "11.5px",
                  fontWeight: 500,
                  border: "1px solid rgba(255, 21, 114, 0.15)",
                  fontFamily: "Inter, sans-serif",
                  "&:hover": {
                    bgcolor: "#FF1572",
                    color: "#ffffff",
                    borderColor: "#FF1572",
                  },
                  transition: "all 0.2s ease",
                }}
              />
            ))}
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
                placeholder="Ask AI anything (scripts, prompts, ideas)..."
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
