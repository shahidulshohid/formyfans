import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import TableSkeleton from "../skeleton";

const HEADER_TEXT = "#FFFFFF";
const CELL_TEXT = "#5E1321";
const ACTIVE_GREEN = "#0CA904";
const ACTIVE_BG = "rgba(12, 169, 4, 0.12)";
const INACTIVE_TEXT = "#757575";
const INACTIVE_BG = "rgba(117, 117, 117, 0.12)";

/**
 * Lightweight paginated data table aligned with admin styling (#5E1321 header).
 * Extend via `customRenderCell` or add cases in `renderCell` as needed.
 */
export default function PaginatedTable({
  tableWidth,
  tableHeader = [],
  tableData = [],
  displayRows = [],
  isLoading = false,
  showPagination = true,
  hidepagination = false,
  serverSidePagination = false,
  totalCount = 0,
  page: externalPage,
  rowsPerPage: externalRowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  getRowId = (row) => row.id ?? row._id ?? JSON.stringify(row),
  customRenderCell,
  headerBgColor = "#5E1321",
  headerBorderRadius = "8px",
  headerFontSize,
  cellFontSize,
  skeletonRows = 5,
  fullWidth = false,
  /** When set (e.g. row `_id` during status PATCH), table body shows same skeleton as `isLoading`. */
  switchStatusLoadingId = null,
}) {
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);

  const showTableSkeleton = isLoading || switchStatusLoadingId != null;

  const page = serverSidePagination ? (externalPage ?? 0) : internalPage;
  const rowsPerPage = serverSidePagination
    ? (externalRowsPerPage ?? 10)
    : internalRowsPerPage;

  const columnKeys = useMemo(
    () => (Array.isArray(displayRows) ? displayRows : []),
    [displayRows],
  );

  const headerById = useMemo(
    () =>
      Object.fromEntries(
        (Array.isArray(tableHeader) ? tableHeader : []).map((h) => [h.id, h]),
      ),
    [tableHeader],
  );

  const getColumnSx = (columnId) => {
    const col = headerById[columnId];
    if (!fullWidth || !col?.width) return {};
    return { width: col.width };
  };

  const resolvedHeaderFontSize = headerFontSize ?? (fullWidth ? 12 : 16);
  const resolvedCellFontSize = cellFontSize ?? 16;

  const handleChangePage = (_event, newPage) => {
    if (serverSidePagination && onPageChange) {
      onPageChange(_event, newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    if (serverSidePagination && onRowsPerPageChange) {
      onRowsPerPageChange(event, value);
    } else {
      setInternalRowsPerPage(value);
      setInternalPage(0);
    }
  };

  const paginatedData =
    !showPagination || hidepagination
      ? tableData
      : serverSidePagination
        ? tableData
        : tableData?.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
          );

  const renderCell = (row, val) => {
    if (customRenderCell) {
      const custom = customRenderCell(row, val);
      if (custom != null) return custom;
    }

    switch (val) {
      case "status": {
        const raw = row.status;
        const label =
          typeof raw === "boolean"
            ? raw
              ? "Active"
              : "Inactive"
            : (raw ?? "—");
        const isActive =
          label === "Active" ||
          String(label).toLowerCase() === "active" ||
          raw === true;
        const isInactive =
          label === "Inactive" ||
          String(label).toLowerCase() === "inactive" ||
          raw === false;

        if (isActive || isInactive) {
          return (
            <TableCell key={val} align="center">
              <Chip
                label={
                  typeof raw === "boolean"
                    ? raw
                      ? "Active"
                      : "Inactive"
                    : label
                }
                size="small"
                sx={{
                  height: 28,
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: isActive ? ACTIVE_BG : INACTIVE_BG,
                  color: isActive ? ACTIVE_GREEN : INACTIVE_TEXT,
                  border: "none",
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
            </TableCell>
          );
        }

        return (
          <TableCell key={val} align="center">
            <Typography
              fontSize={resolvedCellFontSize}
              fontWeight={600}
              sx={{ color: CELL_TEXT }}
            >
              {String(label)}
            </Typography>
          </TableCell>
        );
      }
      default: {
        const cellValue = row[val];
        return (
          <TableCell
            key={val}
            align={headerById[val]?.align || "left"}
            sx={{
              overflow: "hidden",
              verticalAlign: "middle",
              ...(cellFontSize && { py: 2.5, px: 3 }),
              ...getColumnSx(val),
            }}
          >
            <Typography
              fontSize={resolvedCellFontSize}
              fontWeight={600}
              sx={{
                color: CELL_TEXT,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {cellValue ?? "—"}
            </Typography>
          </TableCell>
        );
      }
    }
  };

  const count = totalCount || tableData?.length || 0;

  return (
    <TableContainer
      sx={{
        bgcolor: "transparent",
        borderRadius: "8px",
        width: fullWidth ? "100%" : undefined,
        maxWidth: "100%",
        overflow: fullWidth ? "visible" : "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <Table
        sx={{
          width: tableWidth || "100%",
          maxWidth: "100%",
          tableLayout: "fixed",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        {fullWidth && tableHeader.some((h) => h.width) ? (
          <colgroup>
            {tableHeader.map((h, index) => (
              <col key={h.id ?? index} style={{ width: h.width }} />
            ))}
          </colgroup>
        ) : null}
        <TableHead>
          <TableRow>
            {tableHeader.map((h, index) => (
              <TableCell
                key={h.id ?? index}
                align={h.align || "left"}
                sx={{
                  backgroundColor: headerBgColor,
                  borderBottom: "none",
                  py: headerFontSize ? 2 : fullWidth ? 1.25 : 2,
                  px: fullWidth ? 1 : 3,
                  minWidth: h.minWidth || 0,
                  overflow: fullWidth ? "visible" : "hidden",
                  ...getColumnSx(h.id),
                  ...(index === 0 && {
                    borderTopLeftRadius: headerBorderRadius,
                  }),
                  ...(index === tableHeader.length - 1 && {
                    borderTopRightRadius: headerBorderRadius,
                  }),
                }}
              >
                <Typography
                  fontSize={resolvedHeaderFontSize}
                  fontWeight={600}
                  align={h.align || "left"}
                  sx={{
                    color: HEADER_TEXT,
                    ...(fullWidth
                      ? {
                          whiteSpace: "normal",
                          lineHeight: 1.25,
                          wordBreak: "break-word",
                        }
                      : {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }),
                  }}
                >
                  {h.label}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {showTableSkeleton ? (
          <TableSkeleton
            columns={Math.max(columnKeys.length, tableHeader.length, 1)}
            rows={skeletonRows}
          />
        ) : (
          <TableBody sx={{ bgcolor: "#fff" }}>
            {paginatedData?.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  sx={{
                    "&:last-of-type td": { borderBottom: "none" },
                    "&:hover": { bgcolor: "#FAFAFA" },
                  }}
                >
                  {columnKeys.map((val) => renderCell(row, val))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={Math.max(columnKeys.length, 1)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography
                    fontSize={14}
                    sx={{ color: CELL_TEXT, fontWeight: 500 }}
                  >
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>

      {showPagination && !hidepagination && (
        <Box sx={{ bgcolor: "#fff", borderTop: "1px solid #E0E0E0" }}>
          <TablePagination
            component="div"
            count={count}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              maxWidth: "100%",
              "& .MuiTablePagination-toolbar": {
                px: 2,
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "flex-end",
                overflow: "hidden",
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontSize: 14,
                },
            }}
          />
        </Box>
      )}
    </TableContainer>
  );
}
