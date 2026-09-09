import {
  Box,
  Typography,
  Switch,
  IconButton,
  Select,
  MenuItem,
  CircularProgress,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  ORDER_STATUS_OPTIONS,
  normalizeOrderStatus,
  getOrderStatusTheme,
  formatOrderStatusLabel,
} from "../../constants/orderStatus";

const Table = ({
  headers,
  data,
  sx = {},
  onToggleStatus,
  onOrderStatusChange,
  readOnlyOrderStatus = false,
  orderStatusUpdatingId = null,
  onEdit,
  onDelete,
  onView,
  viewPath,
  deleteLoadingId = null,
  emptyMessage = "No records found",
}) => {
  const renderCell = (value, header, row) => {
    if (header.key === "orderStatus") {
      const rowId = row._id || row.id || row.orderId;

      if (readOnlyOrderStatus || !onOrderStatusChange) {
        const rawStatus =
          value ?? row.orderStatus ?? row.raw?.status ?? "pending";
        const theme = getOrderStatusTheme(rawStatus);
        const label = formatOrderStatusLabel(rawStatus);
        return (
          <Box
            component="span"
            sx={{
              display: "inline-block",
              px: 1.5,
              py: 0.5,
              borderRadius: "20px",
              fontSize: 14,
              fontWeight: 600,
              color: theme.color,
              bgcolor: theme.bg,
              textTransform: "none",
            }}
          >
            {label}
          </Box>
        );
      }

      const statusValue = normalizeOrderStatus(
        row.orderStatusValue ?? value ?? row.orderStatus,
      );
      const statusTheme = getOrderStatusTheme(statusValue);
      return (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 170 }}
        >
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={statusValue}
              onChange={(e) => onOrderStatusChange?.(row, e.target.value)}
              disabled={orderStatusUpdatingId === rowId}
              MenuProps={{ PaperProps: { sx: { zIndex: 1400 } } }}
              sx={{
                height: 40,
                fontSize: 14,
                fontWeight: 600,
                color: statusTheme.color,
                borderRadius: "20px",
                bgcolor: statusTheme.bg,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: statusTheme.color,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#FF1572",
                },
                "& .MuiSelect-icon": {
                  color: statusTheme.color,
                },
              }}
            >
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {orderStatusUpdatingId === rowId ? (
            <CircularProgress size={18} sx={{ color: "#FF1572" }} />
          ) : null}
        </Box>
      );
    }

    if (header.key === "status") {
      const isActive =
        value === true ||
        value === "active" ||
        String(value).toLowerCase() === "active";

      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Switch
            checked={isActive}
            onChange={() => onToggleStatus?.(row)}
            disabled={deleteLoadingId === row._id}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#0CA904",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#0CA904",
              },
            }}
          />
        </Box>
      );
    }

    if (header.key === "actions") {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
          <IconButton
            onClick={() => onEdit?.(row)}
            sx={{
              color: "#5E1321",
              "&:hover": { backgroundColor: "rgba(94, 19, 33, 0.1)" },
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => onDelete?.(row)}
            disabled={deleteLoadingId === row._id}
            sx={{
              color: "#FF1572",
              "&:hover": { backgroundColor: "rgba(255, 21, 114, 0.1)" },
            }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      );
    }

    if (header.key === "products") {
      const images = Array.isArray(value) ? value : value ? [value] : [];
      return (
        <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
          <Box display="flex" gap={0.75} flexWrap="wrap">
            {images.length > 0 ? (
              images.map((url, index) => (
                <Box
                  key={`${url}-${index}`}
                  component="img"
                  src={url}
                  alt={`${row.name || "product"} ${index + 1}`}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    objectFit: "cover",
                    border: "1px solid #E8E8E8",
                  }}
                />
              ))
            ) : (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: "#E8E8E8",
                }}
              />
            )}
          </Box>
          {row.name && (
            <Typography fontSize={16} fontWeight={600} color="#5E1321">
              {row.name}
            </Typography>
          )}
        </Box>
      );
    }

    if (header.key === "productDetails") {
      return (
        <Typography
          fontSize={14}
          fontWeight={500}
          color="#5E1321"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {value || "—"}
        </Typography>
      );
    }

    if (header.key === "button" && header.label === "View Details") {
      return (
        <IconButton
          onClick={() => {
            if (onView) {
              onView(row);
            }
          }}
          sx={{
            color: "#5E1321",
            "&:hover": { backgroundColor: "rgba(94, 19, 33, 0.1)" },
          }}
        >
          <VisibilityIcon />
        </IconButton>
      );
    }

    if (typeof value === "boolean") {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            py: 0.5,
            color: value ? "#5E1321" : "#0CA904",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {value ? "Active" : "Inactive"}
        </Box>
      );
    }

    if (
      typeof value === "string" &&
      (value.includes("/images/") ||
        value.includes("assets/") ||
        value.startsWith("data:") ||
        value.startsWith("http"))
    ) {
      return (
        <Box display="flex" gap={2} alignItems="center">
          <Box
            component="img"
            src={value}
            alt="product"
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              objectFit: "cover",
            }}
          />
          {row.name && (
            <Typography fontSize={16} fontWeight={600} color="#5E1321">
              {row.name}
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <Typography fontSize={16} fontWeight={600} color="#5E1321">
        {value ?? "—"}
      </Typography>
    );
  };

  return (
    <Box sx={{ width: "100%", ...sx }}>
      <Box>
        <Box
          sx={{
            display: "flex",
            bgcolor: "#5E1321",
            borderRadius: "8px 8px 0 0",
            py: 2,
            px: 3,
            alignItems: "center",
          }}
        >
          {headers.map((header, index) => (
            <Box
              key={index}
              sx={{
                flex: header.flex || 1,
                textAlign: header.align || "left",
              }}
            >
              <Typography fontSize={16} fontWeight={600} color="white">
                {header.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ bgcolor: "white", borderRadius: "0 0 8px 8px" }}>
          {data.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography fontSize={14} fontWeight={500} color="#5E1321">
                {emptyMessage}
              </Typography>
            </Box>
          ) : (
            data.map((row) => (
              <Box
                key={row._id || row.id}
                sx={{
                  display: "flex",
                  py: 2,
                  px: 3,
                  alignItems: "center",
                  borderBottom: "1px solid #E0E0E0",
                  "&:last-of-type": { borderBottom: "none" },
                  "&:hover": { bgcolor: "#FAFAFA" },
                }}
              >
                {headers.map((header, colIndex) => (
                  <Box
                    key={colIndex}
                    sx={{
                      flex: header.flex || 1,
                      textAlign: header.align || "left",
                      minWidth:
                        header.key === "orderStatus"
                          ? 180
                          : header.key === "status"
                            ? 72
                            : 0,
                      overflow:
                        header.key === "orderStatus" || header.key === "status"
                          ? "visible"
                          : "hidden",
                    }}
                  >
                    {renderCell(row[header.key], header, row)}
                  </Box>
                ))}
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Table;
