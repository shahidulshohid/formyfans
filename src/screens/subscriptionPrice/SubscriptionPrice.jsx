import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const DetailRow = ({ label, children }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap={2}
    py={1}
  >
    <Typography fontSize={14} color="text.secondary">
      {label}
    </Typography>
    {children}
  </Box>
);

function CreatorSubscriptionPrice({ plan, onUpdatePrice }) {
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: "12px",
        border: "1px solid rgba(94, 19, 33, 0.15)",
        bgcolor: "#fff",
        p: { xs: 2, sm: 3 },
        color: "#5E1321",
      }}
    >
      <Typography
        fontSize={{ xs: 20, sm: 22 }}
        fontWeight={700}
        mb={2}
        color="#5E1321"
      >
        Your Subscription Plan
      </Typography>

      <Stack
        divider={<Divider sx={{ borderColor: "rgba(94, 19, 33, 0.12)" }} />}
      >
        <DetailRow label="Status">
          <Chip
            label={plan.isSubscriptionActive ? "Active" : "Inactive"}
            size="small"
            color={plan.isSubscriptionActive ? "success" : "default"}
            sx={{ textTransform: "capitalize", fontWeight: 600 }}
          />
        </DetailRow>

        <DetailRow label="Subscription Price">
          <Typography fontSize={14} fontWeight={700} color="#5E1321">
            ${Number(plan.subscriptionPrice).toFixed(2)} / month
          </Typography>
        </DetailRow>

        <DetailRow label="Created On">
          <Typography fontSize={14} fontWeight={600} color="#5E1321">
            {formatDate(plan.createdAt)}
          </Typography>
        </DetailRow>

        <DetailRow label="Last Updated">
          <Typography fontSize={14} fontWeight={600} color="#5E1321">
            {formatDate(plan.updatedAt)}
          </Typography>
        </DetailRow>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={3}>
        <Button
          variant="contained"
          onClick={onUpdatePrice}
          sx={{
            flex: 1,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "999px",
            bgcolor: "#FF1572",
            color: "#fff",
            "&:hover": { bgcolor: "#e01366" },
          }}
        >
          Change Price
        </Button>
      </Stack>
    </Box>
  );
}

export default CreatorSubscriptionPrice;
