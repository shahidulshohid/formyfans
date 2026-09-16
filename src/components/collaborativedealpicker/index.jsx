import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { Box, Typography } from "@mui/material";

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
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/**
 * Replaces the old "Select a deal to attach" text + separate chip with a
 * single always-clickable row. Works whether or not a deal is currently
 * selected, so the picker can always be reopened - no need to toggle the
 * radio buttons back and forth.
 *
 * Usage:
 *   <CollaborativeDealPicker deal={selectedDeal} onOpenPicker={() => setDealPickerOpen(true)} />
 */
export const CollaborativeDealPicker = ({ deal, onOpenPicker }) => {
  if (!deal) {
    return (
      <Box
        onClick={onOpenPicker}
        sx={{
          mt: 1,
          border: "1.5px dashed #F3C6D6",
          borderRadius: "12px",
          px: 1.5,
          py: 1.1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          transition: "background-color 120ms ease",
          "&:hover": { bgcolor: "#FFF6F9" },
        }}
      >
        <HandshakeOutlinedIcon sx={{ fontSize: 18, color: "#FF1572" }} />
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#B03A5B", flex: 1 }}>
          Choose a deal to attach
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 18, color: "#D6A5B5" }} />
      </Box>
    );
  }

  return (
    <Box
      onClick={onOpenPicker}
      sx={{
        mt: 1,
        border: "1px solid #FFD3E2",
        bgcolor: "#FFF1F5",
        borderRadius: "12px",
        px: 1.5,
        py: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        transition: "background-color 120ms ease",
        "&:hover": { bgcolor: "#FFE9F0" },
      }}
    >
      <CheckCircleIcon sx={{ fontSize: 18, color: "#FF1572", flexShrink: 0 }} />

      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#3A1A22" }} noWrap>
          {deal.title}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.75} mt={0.15}>
          <Typography sx={{ fontSize: 11.5, color: "#8B6A75" }} noWrap>
            {deal.brand} · {formatCurrency(deal.amount, deal.currency)}
          </Typography>
          {deal.deadline && (
            <Box display="flex" alignItems="center" gap={0.25}>
              <EventOutlinedIcon sx={{ fontSize: 12, color: "#8B92A4" }} />
              <Typography sx={{ fontSize: 11.5, color: "#8B92A4" }}>{formatDeadline(deal.deadline)}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#FF1572", flexShrink: 0 }}>Change</Typography>
    </Box>
  );
};