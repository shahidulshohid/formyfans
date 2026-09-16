import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/EventOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InboxIcon from "@mui/icons-material/InboxOutlined";
import { getReceivedStartedDeals } from "../../api/modules/deal";
import { toast } from "react-toastify";

const formatCurrency = (amount, currency) => {
  if (amount === undefined || amount === null) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "$"} ${amount}`;
  }
};

const formatDeadline = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const daysLeft = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  const dateLabel = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  if (daysLeft < 0) return `${dateLabel} · overdue`;
  if (daysLeft === 0) return `${dateLabel} · due today`;
  if (daysLeft <= 3) return `${dateLabel} · ${daysLeft}d left`;
  return dateLabel;
};

const getSenderName = (sender) =>
  [sender?.firstName, sender?.lastName].filter(Boolean).join(" ") ||
  sender?.username ||
  "Unknown";

export const DealPickerDialog = ({
  open,
  contentType = "post",
  onClose,
  onSelect,
}) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    const fetchDeals = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getReceivedStartedDeals(contentType);
        if (res.data.status === "success") {
          setDeals(res.data?.data ?? []);
        } else {
          toast.error(res.data?.message || "Couldn't load your active deals");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || "Couldn't load your active deals",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [open, contentType]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: "18px", overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#3A1A22" }}>
            Attach a deal
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "#8B92A4", mt: 0.25 }}>
            Pick which brand deal this {contentType} fulfills
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#8B92A4" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 1.5, pb: 2, pt: 0.5 }}>
        {loading && (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress size={28} sx={{ color: "#FF1572" }} />
          </Box>
        )}

        {!loading && error && (
          <Box textAlign="center" py={5} px={2}>
            <Typography
              sx={{ fontSize: 13, color: "#D93025", fontWeight: 600 }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && deals.length === 0 && (
          <Box textAlign="center" py={5} px={2}>
            <InboxIcon sx={{ fontSize: 36, color: "#E8B7C6", mb: 1 }} />
            <Typography
              sx={{ fontSize: 13.5, fontWeight: 600, color: "#3A1A22" }}
            >
              No active deals need a {contentType} right now
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#8B92A4", mt: 0.5 }}>
              Deals show up here once they're started and still have{" "}
              {contentType}s left to deliver.
            </Typography>
          </Box>
        )}

        {!loading &&
          !error &&
          deals.map((deal) => {
            const deliverable = deal.matchingDeliverables?.find(
              (d) => d.type === contentType,
            );
            const isCompleted = deliverable?.isCompleted;
            const count = deliverable?.count ?? 0;
            const completed = deliverable?.completed ?? 0;
            const progressPct =
              count > 0 ? Math.min(100, (completed / count) * 100) : 0;

            return (
              <Box
                key={deal._id}
                onClick={() => {
                  if (isCompleted) {
                    toast.error(
                      `This ${contentType} deliverable has already been completed for this deal. Please select another deal.`,
                    );
                  } else {
                    onSelect?.(deal);
                  }
                }}
                sx={{
                  border: "1px solid #FFD3E2",
                  borderRadius: "14px",
                  p: 1.5,
                  mb: 1,
                  cursor: "pointer",
                  transition: "background-color 120ms ease",
                  "&:hover": { bgcolor: "#FFF6F9" },
                  "&:last-of-type": { mb: 0 },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    src={deal.sender?.image}
                    sx={{ width: 30, height: 30, fontSize: 12 }}
                  >
                    {getSenderName(deal.sender)?.[0]}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography
                      sx={{ fontSize: 13.5, fontWeight: 700, color: "#3A1A22" }}
                      noWrap
                    >
                      {deal.title}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 11.5, color: "#8B92A4" }}
                      noWrap
                    >
                      {getSenderName(deal.sender)} · {deal.brand}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#FF1572",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatCurrency(deal.amount, deal.currency)}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <EventIcon sx={{ fontSize: 13, color: "#8B92A4" }} />
                  <Typography sx={{ fontSize: 11.5, color: "#8B92A4" }}>
                    {formatDeadline(deal.deadline)}
                  </Typography>
                </Box>

                <Box mt={1}>
                  <Box display="flex" justifyContent="space-between" mb={0.4}>
                    <Typography
                      sx={{ fontSize: 11, color: "#8B6A75", fontWeight: 600 }}
                    >
                      {completed}/{count} {contentType}s delivered
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPct}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: "#FFE3ED",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#FF1572",
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              </Box>
            );
          })}
      </DialogContent>
    </Dialog>
  );
};

DealPickerDialog.displayName = "DealPickerDialog";
