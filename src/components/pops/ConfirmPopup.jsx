import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

/**
 * Reusable confirmation popup — marketplace UI (#5E1321 / #FF1572).
 * Import from `components/pops` anywhere you need delete/confirm flows.
 */
const ConfirmPopup = ({
    open = false,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    loading = false,
    variant = "delete",
}) => {
    const isDelete = variant === "delete";

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 12px 40px rgba(94, 19, 33, 0.18)",
                },
            }}
        >
            <DialogContent sx={{ pt: 3, pb: 1, px: 3, textAlign: "center" }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        mx: "auto",
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isDelete ? "rgba(255, 21, 114, 0.12)" : "rgba(94, 19, 33, 0.1)",
                    }}
                >
                    {isDelete ? (
                        <DeleteOutlineIcon sx={{ fontSize: 32, color: "#FF1572" }} />
                    ) : (
                        <WarningAmberRoundedIcon sx={{ fontSize: 32, color: "#5E1321" }} />
                    )}
                </Box>

                <Typography fontSize={20} fontWeight={700} color="#5E1321" mb={1}>
                    {title}
                </Typography>

                <Typography fontSize={14} fontWeight={500} color="text.secondary" lineHeight={1.6}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    pb: 3,
                    pt: 2,
                    gap: 1.5,
                    flexDirection: { xs: "column-reverse", sm: "row" },
                    justifyContent: "center",
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={loading}
                    fullWidth
                    sx={{
                        borderColor: "#5E1321",
                        color: "#5E1321",
                        borderRadius: "20px",
                        py: 1.25,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 14,
                        "&:hover": {
                            borderColor: "#5E1321",
                            bgcolor: "rgba(94, 19, 33, 0.06)",
                        },
                    }}
                >
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={loading}
                    fullWidth
                    sx={{
                        bgcolor: isDelete ? "#FF1572" : "#5E1321",
                        borderRadius: "20px",
                        py: 1.25,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 14,
                        boxShadow: "none",
                        "&:hover": {
                            bgcolor: isDelete ? "#e01265" : "#4a0f1a",
                            boxShadow: "0 4px 12px rgba(255, 21, 114, 0.25)",
                        },
                    }}
                >
                    {loading ? (
                        <CircularProgress size={22} sx={{ color: "#fff" }} />
                    ) : (
                        confirmLabel
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmPopup;
