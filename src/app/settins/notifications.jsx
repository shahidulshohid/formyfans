import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Avatar,
    Box,
    Button,
    Container,
    Paper,
    Skeleton,
    Typography,
} from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications } from "../../api/modules/notification";
import Header from "../../components/header";

const Notifications = () => {
  // Use Navigation Hook
  const navigate = useNavigate();
  // State for loading
  const [isLoading, setIsLoading] = useState({
    getNotifications: true,
    loadMoreNotifications: false,
  });
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const handleBack = () => {
    navigate(-1);
  };

  const renderBackButton = () => {
    return (
      <Box
        mb={2}
        gap={1}
        display={"inline-flex"}
        alignItems={"center"}
        cursor={"pointer"}
        onClick={handleBack}
        sx={{
          cursor: "pointer",
        }}
      >
        <ArrowBackIcon sx={{ color: "#5E1321", fontSize: 20 }} />
        <Typography variant="body1" color="primary.main" fontWeight={500}>
          Back
        </Typography>
      </Box>
    );
  };

  const renderNotificationSkeleton = () => {
    return Array.from({ length: 4 }).map((_, index) => (
      <Box
        key={`notification-skeleton-${index}`}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          pb: 2,
          borderBottom: "1px solid #E0E0E0",
          "&:last-child": {
            borderBottom: "none",
            pb: 0,
          },
        }}
      >
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
            <Skeleton variant="text" width="45%" height={24} />
            <Skeleton variant="text" width={70} height={20} />
          </Box>
          <Skeleton variant="text" width="95%" height={22} />
          <Skeleton variant="text" width="70%" height={22} />
        </Box>
      </Box>
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parsedDate = moment(dateString);
    if (!parsedDate.isValid()) return "";
    return parsedDate.fromNow();
  };

  const getNotificationDisplayData = (notification) => {
    const isSystemNotification = !notification?.sender;
    const sender = notification?.sender || {};
    const fullName = [sender?.firstName, sender?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      avatar: isSystemNotification ? "" : sender?.image || "",
      title: isSystemNotification
        ? notification?.title || "System"
        : notification?.title || fullName || sender?.username || "User",
      message:
        notification?.message ||
        notification?.meta?.message ||
        "You have a new notification.",
      date: formatDate(notification?.createdAt),
      isSystemNotification,
    };
  };

  const handleGetNotifications = async ({
    page = 1,
    isLoadMore = false,
  } = {}) => {
    try {
      setIsLoading((prev) => ({
        ...prev,
        getNotifications: !isLoadMore,
        loadMoreNotifications: isLoadMore,
      }));

      const response = await getNotifications({
        page,
        limit: pagination.limit,
      });
      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        const fetchedNotifications = data?.data || [];
        const fetchedPagination = data?.pagination || {};

        setNotifications((prev) =>
          isLoadMore
            ? [...prev, ...fetchedNotifications]
            : fetchedNotifications,
        );
        setPagination((prev) => ({
          ...prev,
          ...fetchedPagination,
          page,
          limit: fetchedPagination?.limit || prev.limit,
        }));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        getNotifications: false,
        loadMoreNotifications: false,
      }));
    }
  };

  const handleLoadMoreNotifications = () => {
    if (!pagination.hasNextPage || isLoading.loadMoreNotifications) return;
    handleGetNotifications({ page: pagination.page + 1, isLoadMore: true });
  };

  useEffect(() => {
    handleGetNotifications();
  }, []);

  return (
    <Box>
      <Header />
      <Container>
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
          }}
        >
          {/* Back Button */}
          {renderBackButton()}

          {/* Title */}
          <Typography
            sx={{
              color: "#5E1321",
              fontSize: 24,
              fontWeight: 600,
              mb: 4,
            }}
          >
            Notifications
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {isLoading.getNotifications && renderNotificationSkeleton()}

            {!isLoading.getNotifications && notifications.length === 0 && (
              <Typography sx={{ color: "#717171", textAlign: "center", py: 2 }}>
                No notifications found.
              </Typography>
            )}

            {!isLoading.getNotifications &&
              notifications.map((notification) => {
              const notificationData = getNotificationDisplayData(notification);

              return (
                <Box
                  key={notification?._id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    pb: 2,
                    borderBottom: "1px solid #E0E0E0",
                    "&:last-child": {
                      borderBottom: "none",
                      pb: 0,
                    },
                  }}
                >
                  <Avatar
                    src={notificationData.avatar}
                    sx={{
                      width: 48,
                      height: 48,
                      border: "2px solid #FF1572",
                    }}
                  >
                    {notificationData.isSystemNotification ? "S" : ""}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#222222",
                          fontWeight: 600,
                          flex: 1,
                          minWidth: 0,
                          pr: 1,
                        }}
                        noWrap
                      >
                        {notificationData.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#717171",
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {notificationData.date}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: "#444444",
                        fontWeight: 400,
                        lineHeight: 1.45,
                        mt: 0.5,
                      }}
                    >
                      {notificationData.message}
                    </Typography>
                  </Box>
                </Box>
              );
            })}

            {pagination.hasNextPage && (
              <Box display="flex" justifyContent="center" pt={1}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMoreNotifications}
                  disabled={isLoading.loadMoreNotifications}
                  sx={{ textTransform: "none" }}
                >
                  {isLoading.loadMoreNotifications ? "Loading..." : "Load more"}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Notifications;
