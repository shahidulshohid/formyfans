import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import BlockIcon from "@mui/icons-material/Block";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Typography, Chip, CircularProgress } from "@mui/material";
import { useState } from "react";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

/*
  STATUS -> UI MAPPING
  ---------------------------------------------------------------
  pending    -> show Decline / Accept Deal buttons (receiver only)
  accepted   -> green badge "Accepted", no buttons
  rejected   -> red badge "Declined", no buttons
  cancelled  -> grey badge "Cancelled by sender", no buttons
  paused     -> amber badge "Paused by sender", no buttons

  sharedDeal.dealId can be either:
  - a populated Deal object (has live .status, .brand, .amount, etc.) -> ALWAYS prefer this
  - a plain ObjectId string (populate not applied) -> fall back to the snapshot
    fields stored directly on sharedDeal (brand, amount, status, ...)
*/

const STATUS_CONFIG = {
  pending: null, // no badge while pending, buttons speak for themselves
  accepted: {
    label: "Accepted",
    color: "#1E8E3E",
    bg: "#E6F7EA",
    icon: CheckCircleIcon,
  },
  started: {
    label: "Work in Progress",
    color: "#1565C0",
    bg: "#E8F0FE",
    icon: PlayCircleIcon,
  },
  verifying: {
    label: "Verifying",
    color: "#1565C0",
    bg: "#E8F0FE",
    icon: FactCheckIcon,
  },
  incomplete: {
    label: "Incomplete",
    color: "#ED6C02",
    bg: "#FFF4E5",
    icon: WarningAmberIcon,
  },
  completed: {
    label: "Completed",
    color: "#2E7D32",
    bg: "#E8F5E9",
    icon: TaskAltIcon,
  },
  rejected: {
    label: "Declined",
    color: "#D93025",
    bg: "#FDECEA",
    icon: CancelIcon,
  },
  cancelled: {
    label: "Cancelled by sender",
    color: "#5F6368",
    bg: "#F1F3F4",
    icon: BlockIcon,
  },
  paused: {
    label: "Paused by sender",
    color: "#B98900",
    bg: "#FFF6DE",
    icon: PauseCircleIcon,
  },
};

const DELIVERABLE_LABEL = {
  post: ["Post", "Posts"],
  reel: ["Reel", "Reels"],
  stream: ["Stream", "Streams"],
};

const formatDeliverables = (deliverables) => {
  if (!Array.isArray(deliverables) || deliverables.length === 0) return "";
  return deliverables
    .filter((d) => d?.count > 0)
    .map((d) => {
      const [singular, plural] = DELIVERABLE_LABEL[d.type] || [
        d.type,
        `${d.type}s`,
      ];
      return `${d.count} ${d.count === 1 ? singular : plural}`;
    })
    .join(" + ");
};

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

const PAYMENT_TYPE_SUFFIX = {
  monthly: "/mo",
  split: "split",
  "one-time": null, // no suffix needed, amount alone is clear
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const SharedDealPreview = ({
  sharedDeal,
  isOwn,
  onAcceptDeal,
  onRejectDeal,
}) => {
  const [actionLoading, setActionLoading] = useState(null); // "accept" | "reject" | null

  if (!sharedDeal?.dealId) return null;

  const {
    dealId,
    title,
    brand,
    amount,
    currency,
    paymentType,
    deliverables,
    deadline,
    status,
  } = sharedDeal;
  const isPopulated = typeof dealId === "object" && dealId !== null;

  // Prefer live populated deal data; fall back to the snapshot saved on the message
  const liveStatus = isPopulated ? dealId.status : status;
  const liveTitle = (isPopulated ? dealId.title : title) || brand;
  const liveAmount = isPopulated ? dealId.amount : amount;
  const liveCurrency = isPopulated ? dealId.currency : currency;
  const livePaymentType = isPopulated ? dealId.paymentType : paymentType;
  const liveDeliverables = isPopulated ? dealId.deliverables : deliverables;
  const liveDeadline = isPopulated ? dealId.deadline : deadline;
  const resolvedDealId = isPopulated ? dealId._id : dealId;

  const statusConfig = STATUS_CONFIG[liveStatus];
  const StatusIcon = statusConfig?.icon;

  const deliverablesSummary = formatDeliverables(liveDeliverables);
  const dueLabel = liveDeadline
    ? `Deliverables by ${formatDate(liveDeadline)}`
    : "";
  const subtitle = [deliverablesSummary, dueLabel].filter(Boolean).join(". ");

  // Only actionable when the LIVE status is pending (not the stale snapshot)
  const isActionable = liveStatus === "pending" && !isOwn;

  const handleAccept = async () => {
    if (actionLoading) return;
    setActionLoading("accept");
    try {
      await onAcceptDeal?.(resolvedDealId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (actionLoading) return;
    setActionLoading("reject");
    try {
      await onRejectDeal?.(resolvedDealId);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box sx={{ mb: 0.5, width: "100%", maxWidth: 320 }}>
      <Box
        sx={{
          bgcolor: "#FFF1F5",
          border: "1px solid #FFD3E2",
          borderRadius: "14px",
          overflow: "hidden",
          p: 1.5,
        }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" gap={0.6} mb={0.75}>
          <LocalOfferIcon sx={{ fontSize: 13, color: "#FF1572" }} />
          <Typography
            sx={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "#FF1572",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Collaboration offer
          </Typography>
        </Box>

        {/* Title + amount */}
        <Typography
          sx={{
            fontSize: 14.5,
            fontWeight: 700,
            color: "#3A1A22",
            lineHeight: 1.35,
          }}
        >
          {liveTitle}
          {liveAmount !== undefined && liveAmount !== null && (
            <>
              {" "}
              — <span>{formatCurrency(liveAmount, liveCurrency)}</span>
              {PAYMENT_TYPE_SUFFIX[livePaymentType] && (
                <Typography
                  component="span"
                  sx={{ fontSize: 12, fontWeight: 500, color: "#8B92A4" }}
                >
                  {" "}
                  {PAYMENT_TYPE_SUFFIX[livePaymentType]}
                </Typography>
              )}
            </>
          )}
        </Typography>

        {/* Deliverables + deadline */}
        {subtitle && (
          <Typography
            sx={{
              fontSize: 12,
              color: "#8B6A75",
              mt: 0.4,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Status badge - only for non-pending, non-actionable states */}
        {statusConfig && (
          <Chip
            size="small"
            icon={
              StatusIcon ? (
                <StatusIcon sx={{ fontSize: "14px !important" }} />
              ) : undefined
            }
            label={statusConfig.label}
            sx={{
              mt: 1,
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              color: statusConfig.color,
              bgcolor: statusConfig.bg,
              "& .MuiChip-icon": { color: statusConfig.color },
            }}
          />
        )}

        {/* Decline / Accept Deal actions - only for receiver while pending */}
        {isActionable && (
          <Box display="flex" gap={1} mt={1.25}>
            <Box
              component="button"
              onClick={handleReject}
              disabled={!!actionLoading}
              sx={{
                flex: "0 0 32%",
                border: "1px solid #F3C6D6",
                bgcolor: "#fff",
                color: "#B03A5B",
                borderRadius: "999px",
                py: 0.85,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: actionLoading ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": { bgcolor: actionLoading ? "#fff" : "#FFF6F9" },
              }}
            >
              {actionLoading === "reject" ? (
                <CircularProgress size={14} />
              ) : (
                "Reject"
              )}
            </Box>

            <Box
              component="button"
              onClick={handleAccept}
              disabled={!!actionLoading}
              sx={{
                flex: 1,
                border: "none",
                bgcolor: "#FF1572",
                color: "#fff",
                borderRadius: "999px",
                py: 0.85,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: actionLoading ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": { bgcolor: actionLoading ? "#FF1572" : "#E01166" },
              }}
            >
              {actionLoading === "accept" ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                "Accept Deal"
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
