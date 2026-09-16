import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getActivityLogs } from "../../api/modules/activityLog";
import ActivityIcon from "../../assets/icon/activity.svg";
import Table from "../../components/table";
import { formatMessageTime } from "../../utils/helper";

const TABLE_HEADERS = [
  { key: "createdAt", label: "Date & Time", flex: 1.2 },
  { key: "activity_action", label: "Activity", flex: 1 },
  { key: "activity_message", label: "Description", flex: 1 },
  // { key: "productDetails", label: "Description", flex: 1.6 },
  // { key: "ipAddress", label: "IP Address", flex: 1 },
];

const mapActivityLogToRow = (log) => ({
  _id: log._id || log.id,
  createdAt: formatMessageTime(log.createdAt),
  activity_action: log.action.replace("_", " "),
  activity_message: log.meta?.message || "—",
  raw: log,
});

const ActivityLog = () => {
  const loaderRef = useRef(null);
  const observerRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  const paginationRef = useRef({ page: 1, hasNextPage: false });

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchActivityLogs = useCallback(async (page = 1) => {
    if (isFetchingMoreRef.current) return;

    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        isFetchingMoreRef.current = true;
        setIsLoadingMore(true);
      }

      const response = await getActivityLogs({ page, limit: 10 });

      if (response?.status === 200 || response?.status === 201) {
        const payload = response?.data?.data ?? {};
        const newLogs = Array.isArray(payload?.data) ? payload.data : [];
        const pagination = payload?.pagination ?? {};

        setLogs((prev) => (page === 1 ? newLogs : [...prev, ...newLogs]));
        paginationRef.current = {
          page: pagination.page ?? page,
          hasNextPage: pagination.hasNextPage ?? false,
        };
      } else {
        toast.error(
          response?.data?.message || "Failed to fetch activity logs.",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
      isFetchingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityLogs(1);
  }, [fetchActivityLogs]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          paginationRef.current.hasNextPage &&
          !isFetchingMoreRef.current
        ) {
          fetchActivityLogs(paginationRef.current.page + 1);
        }
      },
      { threshold: 0.1, rootMargin: "120px" },
    );

    const loaderNode = loaderRef.current;
    if (loaderNode) {
      observerRef.current.observe(loaderNode);
    }

    return () => observerRef.current?.disconnect();
  }, [fetchActivityLogs, logs.length]);

  const tableData = useMemo(() => logs.map(mapActivityLogToRow), [logs]);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}
    >
      <Box
        sx={{
          bgcolor: "#FF1572",
          borderRadius: "30px",
          px: { xs: 2, md: 3 },
          display: "flex",
          alignItems: "center",
          gap: 2,
          height: { xs: 50, md: 60 },
        }}
      >
        <img
          src={ActivityIcon}
          alt="Activity"
          style={{ width: 30, height: 30 }}
        />
        <Typography
          sx={{
            color: "#fff",
            fontSize: { xs: 18, md: 24 },
            fontWeight: 600,
          }}
        >
          Activity
        </Typography>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#FF1572" }} />
          </Box>
        ) : (
          <Table
            headers={TABLE_HEADERS}
            data={tableData}
            emptyMessage="No activity logs found."
            sx={{
              width: { xs: "max-content", md: "100%" },
              minWidth: { xs: 720, md: "auto" },
            }}
          />
        )}
      </Box>

      <Box
        ref={loaderRef}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={48}
        py={1}
      >
        {isLoadingMore && (
          <CircularProgress size={24} sx={{ color: "#FF1572" }} />
        )}
      </Box>
    </Box>
  );
};

export default ActivityLog;
