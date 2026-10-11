import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Pagination,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAiGenerations } from "../../../api/aiContent/generations";
import { downloadMedia } from "../../../api/aiContent/downloadMedia";

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const StatusBadge = ({ status, progress }) => {
  const s = String(status || "").toLowerCase();

  if (s === "completed") {
    return (
      <Chip
        icon={<CheckCircleRoundedIcon sx={{ fontSize: "14px !important", color: "#16A34A !important" }} />}
        label="Completed"
        size="small"
        sx={{
          bgcolor: "#DCFCE7",
          color: "#166534",
          fontWeight: 600,
          fontSize: "11px",
          height: "24px",
          border: "1px solid #BBF7D0",
        }}
      />
    );
  }

  if (s === "processing" || s === "pending") {
    return (
      <Chip
        icon={<CircularProgress size={10} sx={{ color: "#2563EB !important" }} />}
        label={`Processing ${progress !== undefined && progress > 0 ? `${progress}%` : ""}`}
        size="small"
        sx={{
          bgcolor: "#EFF6FF",
          color: "#1E40AF",
          fontWeight: 600,
          fontSize: "11px",
          height: "24px",
          border: "1px solid #BFDBFE",
        }}
      />
    );
  }

  return (
    <Chip
      icon={<ErrorOutlineRoundedIcon sx={{ fontSize: "14px !important", color: "#DC2626 !important" }} />}
      label={status || "Failed"}
      size="small"
      sx={{
        bgcolor: "#FEF2F2",
        color: "#991B1B",
        fontWeight: 600,
        fontSize: "11px",
        height: "24px",
        border: "1px solid #FECACA",
      }}
    />
  );
};

const MediaCard = ({ item, onSelectPrompt, onOpenInStudio, onCloseModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isImage =
    item.type?.toUpperCase() === "IMAGE" ||
    /\.(jpe?g|png|webp|gif|svg)$/i.test(item.mediaUrl || "");

  const handleCopyPrompt = (e) => {
    e.stopPropagation();
    if (item.prompt) {
      navigator.clipboard.writeText(item.prompt);
      setIsCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!item.mediaUrl) {
      toast.error("Media URL is not available yet.");
      return;
    }
    setDownloading(true);
    try {
      const fileName = isImage
        ? `ai_image_${item.generationId || Date.now()}.png`
        : `ai_video_${item.generationId || Date.now()}.mp4`;
      const mimeType = isImage ? "image/png" : "video/mp4";
      const success = await downloadMedia(item.mediaUrl, fileName, mimeType);
      if (success) {
        toast.success(`${isImage ? "Image" : "Video"} download started!`);
      }
    } catch (err) {
      console.error("Error downloading media:", err);
      toast.error("Failed to download media.");
    } finally {
      setDownloading(false);
    }
  };

  const handleUseScript = (e) => {
    e.stopPropagation();
    if (item.prompt && onSelectPrompt) {
      onSelectPrompt(item.prompt);
      toast.success("Loaded prompt into script editor!");
      if (onCloseModal) onCloseModal();
    }
  };

  const isCompleted = item.status?.toLowerCase() === "completed" && Boolean(item.mediaUrl);

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #EAEAEA",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s ease",
        "&:hover": {
          borderColor: "#FF8AB5",
          boxShadow: "0 8px 24px rgba(255, 21, 114, 0.08)",
          transform: "translateY(-3px)",
        },
      }}
    >
      {/* Media Preview Area */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%", // 16:9 Aspect Ratio
          bgcolor: "#0F172A",
          overflow: "hidden",
        }}
      >
        {isCompleted ? (
          isImage ? (
            <Box
              component="img"
              src={item.mediaUrl}
              alt={item.prompt || "AI generated image"}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                bgcolor: "#000",
                cursor: "pointer",
              }}
              onClick={() => window.open(item.mediaUrl, "_blank")}
            />
          ) : (
            <Box
              component="video"
              src={item.mediaUrl}
              controls
              preload="metadata"
              playsInline
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                bgcolor: "#000",
              }}
            />
          )
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
              p: 2,
              textAlign: "center",
            }}
          >
            {item.status?.toLowerCase() === "processing" ? (
              <>
                <CircularProgress size={32} sx={{ color: "#FF1572", mb: 1.5 }} />
                <Typography sx={{ fontSize: "13px", color: "#F8FAFC", fontWeight: 500 }}>
                  Generating {isImage ? "Image" : "Video"}...
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "#94A3B8", mt: 0.5 }}>
                  Progress: {item.progress || 0}%
                </Typography>
              </>
            ) : (
              <>
                <ErrorOutlineRoundedIcon sx={{ fontSize: 32, color: "#EF4444", mb: 1 }} />
                <Typography sx={{ fontSize: "13px", color: "#F8FAFC", fontWeight: 500 }}>
                  Generation {item.status || "Failed"}
                </Typography>
                {item.error && (
                  <Typography sx={{ fontSize: "11px", color: "#F87171", mt: 0.5 }}>
                    {item.error}
                  </Typography>
                )}
              </>
            )}
          </Box>
        )}

        {/* Status Badge in overlay top-left */}
        <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 2, display: "flex", gap: 0.8 }}>
          <StatusBadge status={item.status} progress={item.progress} />
          <Chip
            label={isImage ? "IMAGE" : "VIDEO"}
            size="small"
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(4px)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "10px",
              height: "24px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          />
        </Box>

        {/* Credits Badge in overlay top-right */}
        {item.creditsDeducted !== null && item.creditsDeducted !== undefined && (
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
            <Chip
              icon={<MonetizationOnRoundedIcon sx={{ fontSize: "13px !important", color: "#F59E0B !important" }} />}
              label={`${item.creditsDeducted} Credits`}
              size="small"
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(4px)",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 600,
                height: "24px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            />
          </Box>
        )}
      </Box>

      {/* Card Content Area */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {/* Date / Metadata Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: "#71717A" }}>
            <CalendarTodayRoundedIcon sx={{ fontSize: 13 }} />
            <Typography sx={{ fontSize: "11px", fontWeight: 500 }}>
              {formatDateTime(item.createdAt)}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: "10px",
              fontFamily: "monospace",
              color: "#A1A1AA",
              bgcolor: "#F4F4F5",
              px: 0.8,
              py: 0.2,
              borderRadius: "4px",
            }}
          >
            ID: {String(item.generationId || "").slice(-6)}
          </Typography>
        </Box>

        {/* Prompt Text */}
        <Box sx={{ mb: 1.5, flexGrow: 1 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              lineHeight: "19px",
              color: "#27272A",
              display: "-webkit-box",
              WebkitLineClamp: isExpanded ? "unset" : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            {item.prompt || "No prompt recorded"}
          </Typography>

          {item.prompt && item.prompt.length > 120 && (
            <Button
              onClick={() => setIsExpanded((prev) => !prev)}
              sx={{
                p: 0,
                minWidth: "auto",
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "#FF1572",
                textTransform: "none",
                mt: 0.4,
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
              }}
            >
              {isExpanded ? "Show less" : "Read more"}
            </Button>
          )}
        </Box>

        {/* Bottom Actions Bar */}
        <Box
          sx={{
            pt: 1.5,
            borderTop: "1px solid #F4F4F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          {/* Use Prompt Button */}
          {onSelectPrompt && item.prompt ? (
            <Button
              size="small"
              onClick={handleUseScript}
              startIcon={<EditNoteRoundedIcon sx={{ fontSize: "16px !important" }} />}
              sx={{
                fontFamily: "Inter, sans-serif",
                bgcolor: "#FFF0F6",
                color: "#FF1572",
                borderRadius: "53px",
                px: 1.5,
                py: 0.6,
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "none",
                border: "1px solid #FFE0ED",
                "&:hover": {
                  bgcolor: "#FF1572",
                  color: "#FFFFFF",
                  borderColor: "#FF1572",
                },
                transition: "all 0.2s ease",
              }}
            >
              Use Script
            </Button>
          ) : (
            <Box />
          )}

          {/* Action Icon Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* Copy Prompt */}
            <Tooltip title={isCopied ? "Copied!" : "Copy prompt"} arrow>
              <IconButton
                size="small"
                onClick={handleCopyPrompt}
                sx={{
                  color: isCopied ? "#16A34A" : "#71717A",
                  bgcolor: "#F4F4F5",
                  "&:hover": { bgcolor: "#E4E4E7", color: "#FF1572" },
                }}
              >
                <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>

            {/* Download */}
            {isCompleted && (
              <Tooltip title={downloading ? "Downloading..." : `Download ${isImage ? "image" : "video"}`} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleDownload}
                    disabled={downloading}
                    sx={{
                      color: "#71717A",
                      bgcolor: "#F4F4F5",
                      "&:hover": { bgcolor: "#E4E4E7", color: "#FF1572" },
                    }}
                  >
                    {downloading ? (
                      <CircularProgress size={15} sx={{ color: "#FF1572" }} />
                    ) : (
                      <DownloadRoundedIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Open in studio player / viewer */}
            {isCompleted && (
              <Tooltip title={`Open in ${isImage ? "Image" : "Video"} Studio`} arrow>
                <IconButton
                  size="small"
                  onClick={() => onOpenInStudio(item)}
                  sx={{
                    color: "#FFFFFF",
                    bgcolor: "#FF1572",
                    "&:hover": { bgcolor: "#E01062" },
                  }}
                >
                  <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AiVideoHistoryModal = ({
  open,
  onClose,
  onSelectPrompt,
  title = "Generated History",
  defaultType = "ALL", // "ALL" | "IMAGE" | "VIDEO"
}) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalCount: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState(defaultType || "ALL");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync default type when opened
  useEffect(() => {
    if (open && defaultType) {
      setTypeFilter(defaultType);
    }
  }, [open, defaultType]);

  const fetchHistory = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const response = await getAiGenerations({
        page: targetPage,
        limit: 9,
      });

      const responseBody = response?.data;
      const dataPayload = responseBody?.data;

      let items = [];
      let pag = {
        page: targetPage,
        limit: 9,
        totalCount: 0,
        totalPages: 1,
      };

      if (dataPayload?.data && Array.isArray(dataPayload.data)) {
        items = dataPayload.data;
        if (dataPayload.pagination) pag = dataPayload.pagination;
      } else if (Array.isArray(dataPayload)) {
        items = dataPayload;
        if (responseBody?.pagination) pag = responseBody.pagination;
      } else if (Array.isArray(responseBody)) {
        items = responseBody;
      }

      setGenerations(items);
      setPagination({
        page: pag.page || targetPage,
        limit: pag.limit || 9,
        totalCount: pag.totalCount ?? items.length,
        totalPages: pag.totalPages || Math.ceil((pag.totalCount || items.length) / (pag.limit || 9)) || 1,
      });
    } catch (error) {
      console.error("Error fetching AI generations:", error);
      const msg = error?.response?.data?.message || error?.message || "Failed to load history.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchHistory(page);
    }
  }, [open, page, fetchHistory]);

  const handlePageChange = (_e, value) => {
    setPage(value);
  };

  const handleOpenInStudio = (item) => {
    onClose();
    const isImage =
      item.type?.toUpperCase() === "IMAGE" ||
      /\.(jpe?g|png|webp|gif|svg)$/i.test(item.mediaUrl || "");

    if (isImage) {
      navigate("/ai-image-ready", {
        state: {
          generationId: item.generationId,
          mediaUrl: item.mediaUrl,
          imageUrl: item.mediaUrl,
          prompt: item.prompt,
          script: item.prompt,
          status: item.status || "completed",
          progress: item.progress || 100,
          creditsDeducted: item.creditsDeducted,
          createdAt: item.createdAt,
          type: "IMAGE",
        },
      });
    } else {
      navigate("/ai-video-ready", {
        state: {
          generationId: item.generationId,
          mediaUrl: item.mediaUrl,
          videoUrl: item.mediaUrl,
          prompt: item.prompt,
          script: item.prompt,
          status: item.status || "completed",
          progress: item.progress || 100,
          creditsDeducted: item.creditsDeducted,
          createdAt: item.createdAt,
          type: item.type || "VIDEO",
        },
      });
    }
  };

  // Filter items by type, status & search
  const filteredGenerations = useMemo(() => {
    return generations.filter((item) => {
      // Must match search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const pMatch = item.prompt?.toLowerCase().includes(q);
        const idMatch = String(item.generationId || "").toLowerCase().includes(q);
        if (!pMatch && !idMatch) return false;
      }

      // Filter by type (All, Image, Video)
      const isImg =
        item.type?.toUpperCase() === "IMAGE" ||
        /\.(jpe?g|png|webp|gif|svg)$/i.test(item.mediaUrl || "");
      if (typeFilter === "IMAGE" && !isImg) return false;
      if (typeFilter === "VIDEO" && isImg) return false;

      // Filter by status tab
      if (statusFilter === "completed") {
        return item.status?.toLowerCase() === "completed";
      }
      if (statusFilter === "processing") {
        return item.status?.toLowerCase() === "processing" || item.status?.toLowerCase() === "pending";
      }
      if (statusFilter === "failed") {
        return item.status?.toLowerCase() === "failed" || item.status?.toLowerCase() === "error";
      }

      return true;
    });
  }, [generations, typeFilter, statusFilter, searchQuery]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: "16px", sm: "24px" },
          bgcolor: "#FAF9FB",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #F0EDF2",
          p: { xs: 2, sm: 2.5, md: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 38, sm: 44 },
              height: { xs: 38, sm: 44 },
              borderRadius: "12px",
              bgcolor: "#FFF0F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FF1572",
            }}
          >
            {typeFilter === "IMAGE" ? (
              <PhotoLibraryRoundedIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />
            ) : typeFilter === "VIDEO" ? (
              <VideoLibraryRoundedIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />
            ) : (
              <AutoAwesomeRoundedIcon sx={{ fontSize: { xs: 22, sm: 26 } }} />
            )}
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "17px", sm: "20px" },
                  color: "#18181B",
                  letterSpacing: "-0.5px",
                }}
              >
                {title || "Generated History"}
              </Typography>
              {pagination.totalCount > 0 && (
                <Chip
                  label={`${pagination.totalCount} Total`}
                  size="small"
                  sx={{
                    bgcolor: "#FF1572",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "11px",
                    height: "22px",
                  }}
                />
              )}
            </Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                color: "#71717A",
                fontSize: { xs: "11px", sm: "13px" },
                mt: 0.2,
              }}
            >
              Browse, inspect, and reuse your AI generated content
            </Typography>
          </Box>
        </Box>

        {/* Right Header Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Refresh history" arrow>
            <span>
              <IconButton
                onClick={() => fetchHistory(page)}
                disabled={loading}
                sx={{
                  color: "#71717A",
                  bgcolor: "#F4F4F5",
                  "&:hover": { bgcolor: "#E4E4E7", color: "#FF1572" },
                }}
              >
                <RefreshRoundedIcon
                  sx={{
                    fontSize: 20,
                    animation: loading ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#71717A",
              bgcolor: "#F4F4F5",
              "&:hover": { bgcolor: "#FFE0ED", color: "#FF1572" },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Filter & Search Bar */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          px: { xs: 2, sm: 3 },
          py: 1.8,
          borderBottom: "1px solid #F0EDF2",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        {/* Type & Status Filters */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {/* Type Selector */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mr: { xs: 0, sm: 1 } }}>
            {[
              { id: "ALL", label: "All Creations" },
              { id: "IMAGE", label: "Images" },
              { id: "VIDEO", label: "Videos" },
            ].map((tab) => {
              const isActive = typeFilter === tab.id;
              return (
                <Chip
                  key={tab.id}
                  label={tab.label}
                  clickable
                  onClick={() => setTypeFilter(tab.id)}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "12px",
                    bgcolor: isActive ? "#FF1572" : "#F4F4F5",
                    color: isActive ? "#FFFFFF" : "#52525B",
                    border: isActive ? "1px solid #FF1572" : "1px solid transparent",
                    "&:hover": { bgcolor: isActive ? "#E01062" : "#E4E4E7" },
                    transition: "all 0.2s ease",
                  }}
                />
              );
            })}
          </Box>

          <Box sx={{ height: "20px", width: "1px", bgcolor: "#E4E4E7", display: { xs: "none", sm: "block" } }} />

          {/* Status Filter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            {[
              { id: "all", label: "All Status" },
              { id: "completed", label: "Completed" },
              { id: "processing", label: "Processing" },
              { id: "failed", label: "Failed" },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <Chip
                  key={tab.id}
                  label={tab.label}
                  size="small"
                  clickable
                  onClick={() => setStatusFilter(tab.id)}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "11px",
                    bgcolor: isActive ? "#18181B" : "#FAFAFA",
                    color: isActive ? "#FFFFFF" : "#71717A",
                    border: isActive ? "1px solid #18181B" : "1px solid #E4E4E7",
                    "&:hover": { bgcolor: isActive ? "#27272A" : "#F4F4F5" },
                    transition: "all 0.2s ease",
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Search Field */}
        <TextField
          size="small"
          placeholder="Search by prompt..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: "#A1A1AA" }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "53px",
              bgcolor: "#FAF9FB",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
              "& fieldset": { borderColor: "#E4E4E7" },
              "&:hover fieldset": { borderColor: "#FF8AB5" },
              "&.Mui-focused fieldset": { borderColor: "#FF1572" },
            },
          }}
          sx={{ minWidth: { xs: "100%", md: "260px" } }}
        />
      </Box>

      {/* Main Content Area */}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        {loading ? (
          /* Loading Skeletons */
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <Box
                key={sk}
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #EAEAEA",
                  overflow: "hidden",
                }}
              >
                <Skeleton variant="rectangular" width="100%" height={180} />
                <Box sx={{ p: 2 }}>
                  <Skeleton width="40%" height={16} sx={{ mb: 1 }} />
                  <Skeleton width="100%" height={14} />
                  <Skeleton width="85%" height={14} sx={{ mb: 2 }} />
                  <Skeleton width="50%" height={32} sx={{ borderRadius: "53px" }} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : filteredGenerations.length === 0 ? (
          /* Empty State */
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: { xs: 6, sm: 8 },
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "#FFF0F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FF1572",
                mb: 2,
              }}
            >
              {typeFilter === "IMAGE" ? (
                <PhotoLibraryRoundedIcon sx={{ fontSize: 36 }} />
              ) : (
                <VideoLibraryRoundedIcon sx={{ fontSize: 36 }} />
              )}
            </Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "17px",
                color: "#18181B",
                mb: 0.6,
              }}
            >
              {searchQuery || statusFilter !== "all" || typeFilter !== "ALL"
                ? "No matching creations found"
                : "No generations recorded yet"}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "#71717A",
                maxWidth: "380px",
                mb: 3,
              }}
            >
              {searchQuery || statusFilter !== "all" || typeFilter !== "ALL"
                ? "Try adjusting your filters or search query to find creations."
                : "Generated creations will appear here."}
            </Typography>
            {(searchQuery || statusFilter !== "all" || typeFilter !== "ALL") && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("ALL");
                }}
                sx={{
                  fontFamily: "Inter, sans-serif",
                  color: "#FF1572",
                  borderColor: "#FF1572",
                  borderRadius: "53px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  px: 3,
                  "&:hover": { bgcolor: "#FFF0F6", borderColor: "#FF1572" },
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          /* Media Cards Grid */
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {filteredGenerations.map((item) => (
              <MediaCard
                key={item.generationId || item.s3Key || Math.random()}
                item={item}
                onSelectPrompt={onSelectPrompt}
                onOpenInStudio={handleOpenInStudio}
                onCloseModal={onClose}
              />
            ))}
          </Box>
        )}
      </DialogContent>

      {/* Pagination Footer */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          p: { xs: 2, sm: 2.5 },
          borderTop: "1px solid #F0EDF2",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#71717A" }}>
          Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total creations)
        </Typography>

        {pagination.totalPages > 1 && (
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
              },
              "& .Mui-selected": {
                bgcolor: "#FF1572 !important",
                color: "#FFFFFF !important",
              },
            }}
          />
        )}
      </Box>
    </Dialog>
  );
};

export default AiVideoHistoryModal;
