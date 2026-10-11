import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Pagination,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../../components/header";
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

const VideoCard = ({ item, onOpenInStudio }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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
      toast.error("Video URL is not available yet.");
      return;
    }
    setDownloading(true);
    try {
      const fileName = `ai_video_${item.generationId || Date.now()}.mp4`;
      const success = await downloadMedia(item.mediaUrl, fileName, "video/mp4");
      if (success) {
        toast.success("Video download started!");
      }
    } catch (err) {
      console.error("Error downloading video:", err);
      toast.error("Failed to download video.");
    } finally {
      setDownloading(false);
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
      {/* Video Media Area */}
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
                  Generating Video...
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
        <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}>
          <StatusBadge status={item.status} progress={item.progress} />
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

        {/* Actions Bar */}
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
          {/* Copy Prompt */}
          <Button
            size="small"
            onClick={handleCopyPrompt}
            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontFamily: "Inter, sans-serif",
              color: isCopied ? "#16A34A" : "#71717A",
              bgcolor: "#F4F4F5",
              borderRadius: "53px",
              px: 1.5,
              py: 0.5,
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": { bgcolor: "#E4E4E7", color: "#FF1572" },
            }}
          >
            {isCopied ? "Copied" : "Copy Prompt"}
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            {/* Download */}
            {isCompleted && (
              <Tooltip title={downloading ? "Downloading..." : "Download video"} arrow>
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

            {/* Open in studio player */}
            {isCompleted && (
              <Tooltip title="Open in Studio Player" arrow>
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

const AiVideoHistory = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHistory = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const response = await getAiGenerations({
        page: targetPage,
        limit: 10,
      });

      const responseBody = response?.data;
      const dataPayload = responseBody?.data;

      let items = [];
      let pag = {
        page: targetPage,
        limit: 10,
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
        limit: pag.limit || 10,
        totalCount: pag.totalCount ?? items.length,
        totalPages: pag.totalPages || Math.ceil((pag.totalCount || items.length) / (pag.limit || 10)) || 1,
      });
    } catch (error) {
      console.error("Error fetching AI video generations:", error);
      const msg = error?.response?.data?.message || error?.message || "Failed to load video history.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory]);

  const handlePageChange = (_e, value) => {
    setPage(value);
  };

  const handleOpenInStudio = (item) => {
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
  };

  const filteredGenerations = useMemo(() => {
    return generations.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const pMatch = item.prompt?.toLowerCase().includes(q);
        const idMatch = String(item.generationId || "").toLowerCase().includes(q);
        if (!pMatch && !idMatch) return false;
      }

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
  }, [generations, statusFilter, searchQuery]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA", pb: 8 }}>
      <Header />
      <Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 5 } }}>
        {/* Top Header Bar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: "18px" }} />}
            onClick={() => navigate(-1)}
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#000000",
              fontWeight: 500,
              fontSize: "14px",
              textTransform: "none",
              p: 0,
              minWidth: "auto",
              "&:hover": { bgcolor: "transparent", color: "#FF1572" },
            }}
          >
            Back
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/ai-create-video")}
            sx={{
              bgcolor: "#FF1572",
              color: "#FFFFFF",
              borderRadius: "53px",
              px: 2.5,
              py: 0.8,
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#E01062" },
            }}
          >
            Create Video
          </Button>
        </Box>

        {/* Title Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.8 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: "#FF1572",
                fontSize: { xs: "24px", sm: "30px" },
                letterSpacing: "-1px",
              }}
            >
              Generated History
            </Typography>
            {pagination.totalCount > 0 && (
              <Chip
                label={`${pagination.totalCount} Total`}
                size="small"
                sx={{
                  bgcolor: "#FF1572",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "12px",
                  height: "24px",
                }}
              />
            )}
          </Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#737373",
              fontSize: { xs: "13px", sm: "15px" },
            }}
          >
            View, replay, and download all your generated AI content in one place.
          </Typography>
        </Box>

        {/* Filters and Controls */}
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            p: 2,
            borderRadius: "16px",
            border: "1px solid #EAEAEA",
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Status Tabs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflowX: "auto" }}>
            {[
              { id: "all", label: "All Videos" },
              { id: "completed", label: "Completed" },
              { id: "processing", label: "Processing" },
              { id: "failed", label: "Failed" },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <Chip
                  key={tab.id}
                  label={tab.label}
                  clickable
                  onClick={() => setStatusFilter(tab.id)}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "12px",
                    bgcolor: isActive ? "#FF1572" : "#F4F4F5",
                    color: isActive ? "#FFFFFF" : "#52525B",
                    border: isActive ? "1px solid #FF1572" : "1px solid transparent",
                    "&:hover": { bgcolor: isActive ? "#E01062" : "#E4E4E7" },
                  }}
                />
              );
            })}
          </Box>

          {/* Search & Refresh */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="Search prompts..."
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
                  "& fieldset": { borderColor: "#E4E4E7" },
                },
              }}
              sx={{ minWidth: { xs: "100%", sm: "220px", md: "260px" } }}
            />

            <Tooltip title="Refresh" arrow>
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
          </Box>
        </Box>

        {/* Video Cards Grid */}
        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
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
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #EAEAEA",
              p: { xs: 6, sm: 8 },
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
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
              <VideoLibraryRoundedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "18px",
                color: "#18181B",
                mb: 0.8,
              }}
            >
              No Video Generations Found
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#71717A",
                maxWidth: "420px",
                mb: 3,
              }}
            >
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search query or filters to find your generated videos."
                : "You haven't generated any AI videos yet. Start creating your first video with AI!"}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/ai-create-video")}
              sx={{
                bgcolor: "#FF1572",
                color: "#FFFFFF",
                borderRadius: "53px",
                px: 3.5,
                py: 1,
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { bgcolor: "#E01062" },
              }}
            >
              Create Your First Video
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {filteredGenerations.map((item) => (
              <VideoCard
                key={item.generationId || item.s3Key || Math.random()}
                item={item}
                onOpenInStudio={handleOpenInStudio}
              />
            ))}
          </Box>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <Box
            sx={{
              mt: 5,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography sx={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#71717A" }}>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total creations)
            </Typography>

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
                  fontSize: "13px",
                  fontWeight: 600,
                },
                "& .Mui-selected": {
                  bgcolor: "#FF1572 !important",
                  color: "#FFFFFF !important",
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AiVideoHistory;
