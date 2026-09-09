import { Box, Typography, Button } from "@mui/material";

const PageHeader = ({
  title,
  onCancel,
  onPublish,
  publishLoading = false,
  publishDisabled = false,
  publishLabel = "Publish",
  publishLoadingLabel = "Publishing...",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Typography fontSize={{ xs: 18, md: 20 }} fontWeight={600} color="#333">
        {title}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            borderColor: "#5E1321",
            color: "#5E1321",
            borderRadius: "20px",
            px: { xs: 4, md: 6 },
            py: { xs: 1, md: 2 },
            height: { xs: 32, md: 24 },
            minWidth: { xs: 80, md: 49 },
            textTransform: "none",
            fontSize: 14,
            fontWeight: 600,
            transition: "all 0.3s ease",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onPublish}
          disabled={publishLoading || publishDisabled}
          sx={{
            bgcolor: "#5E1321",
            color: "white",
            borderRadius: "20px",
            px: { xs: 4, md: 6 },
            py: { xs: 1, md: 2 },
            minWidth: { xs: 80, md: 54 },
            height: { xs: 32, md: 24 },
            textTransform: "none",
            fontSize: 14,
            fontWeight: 600,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "#4a0f1a",
              boxShadow: "0 4px 12px rgba(94, 19, 33, 0.3)",
            },
          }}
        >
          {publishLoading ? publishLoadingLabel : publishLabel}
        </Button>
      </Box>
    </Box>
  );
};

export default PageHeader;
