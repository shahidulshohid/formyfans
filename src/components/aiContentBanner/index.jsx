import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddToPhotosOutlinedIcon from "@mui/icons-material/AddToPhotosOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Box, Button, Typography, CircularProgress, Tooltip } from "@mui/material";
import { toast } from "react-toastify";
import AiSubscriptionModal from "./AiSubscriptionModal";
import SelectAiContentTypeModal from "./SelectAiContentTypeModal";
import { getCreditBalance, getCreditPricing } from "../../api/aiContent";
import useUserStore from "../../zustand/userUserStore";

const AiContentBanner = () => {
  const navigate = useNavigate();
  const { user, setUserData } = useUserStore();
  const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
  const [openContentTypeModal, setOpenContentTypeModal] = useState(false);
  const [subscriptionsTrue, setSubscriptionsTrue] = useState(false);

  const [balanceData, setBalanceData] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch current credit balance
  const fetchBalance = useCallback(async () => {
    try {
      setLoadingBalance(true);
      const res = await getCreditBalance();
      if (res?.data?.data) {
        const data = res.data.data;
        setBalanceData(data);
        if (setUserData) {
          setUserData((prev) => ({
            ...prev,
            credits: data.availableBalance ?? data.balance ?? prev?.credits,
            aiCredits: data.availableBalance ?? data.balance ?? prev?.aiCredits,
          }));
        }
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch credit balance:", err);
    } finally {
      setLoadingBalance(false);
    }
    return null;
  }, [setUserData]);

  // Fetch pricing data (for reservation credit limits)
  const fetchPricing = useCallback(async () => {
    try {
      const res = await getCreditPricing();
      if (res?.data?.data) {
        setPricingData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch credit pricing:", err);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchPricing();
  }, [fetchBalance, fetchPricing]);

  // Get current available balance with fallbacks
  const getAvailableCredits = () => {
    if (balanceData?.availableBalance !== undefined && balanceData?.availableBalance !== null) {
      return Number(balanceData.availableBalance);
    }
    if (balanceData?.balance !== undefined && balanceData?.balance !== null) {
      return Number(balanceData.balance);
    }
    if (user?.credits !== undefined && user?.credits !== null) {
      return Number(user.credits);
    }
    if (user?.aiCredits !== undefined && user?.aiCredits !== null) {
      return Number(user.aiCredits);
    }
    return 0;
  };

  const handleCreateClick = async () => {
    let currentBalance = getAvailableCredits();

    // If balance not loaded yet, fetch it immediately
    if (balanceData === null) {
      const freshData = await fetchBalance();
      if (freshData) {
        currentBalance = Number(freshData.availableBalance ?? freshData.balance ?? 0);
      }
    }

    // Logic 1: If user has no available credit balance (<= 0), show Subscription/Purchase Modal
    if (currentBalance <= 0 && !subscriptionsTrue) {
      setOpenSubscriptionModal(true);
    } else {
      // Logic 2: If user has credits, open Content Type selection modal
      setOpenContentTypeModal(true);
    }
  };

  const handleContentTypeSelect = (item) => {
    const available = getAvailableCredits();

    const imageCost = pricingData?.imageReservationCredits ?? 1;
    const videoCost = pricingData?.videoReservationCredits ?? 5;
    const videoEditCost = pricingData?.videoEditReservationCredits ?? 6;

    if (item.id === "image") {
      if (available < imageCost && !subscriptionsTrue) {
        toast.error(`You need at least ${imageCost} credit to generate AI images. Please buy credits.`);
        setOpenContentTypeModal(false);
        setOpenSubscriptionModal(true);
        return;
      }
      setOpenContentTypeModal(false);
      navigate("/ai-create-image");
    } else if (item.id === "video") {
      if (available < videoCost && !subscriptionsTrue) {
        toast.error(`You need at least ${videoCost} credits to generate AI videos. Please buy credits.`);
        setOpenContentTypeModal(false);
        setOpenSubscriptionModal(true);
        return;
      }
      setOpenContentTypeModal(false);
      navigate("/ai-create-video");
    } else if (item.id === "video_edit") {
      if (available < videoEditCost && !subscriptionsTrue) {
        toast.error(`You need at least ${videoEditCost} credits to edit AI videos. Please buy credits.`);
        setOpenContentTypeModal(false);
        setOpenSubscriptionModal(true);
        return;
      }
      setOpenContentTypeModal(false);
      navigate("/ai-create-video-edit");
    }
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          boxSizing: "border-box",
          bgcolor: "#FF15721A",
          border: "1.5px solid #FF15721A",
          borderRadius: "16px",
          px: { xs: 1.75, sm: 2.5, md: 3 },
          py: { xs: 1.25, sm: 1.5, md: 1.75 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 1.2, sm: 1.8, md: 2 },
          boxShadow: "0 2px 10px rgba(255, 20, 117, 0.06)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 14px rgba(255, 20, 117, 0.12)",
            borderColor: "#F7A8CE",
          },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              color: "#FF1572",
              fontWeight: 700,
              fontSize: { xs: "13px", sm: "15px", md: "16px" },
              lineHeight: 1.25,
              letterSpacing: "-0.2px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            AI–Powered Content
          </Typography>
          <Typography
            sx={{
              color: "#484848",
              fontWeight: 500,
              fontSize: { xs: "11px", sm: "12px", md: "13px" },
              lineHeight: 1.35,
              mt: { xs: 0.2, sm: 0.4 },
              fontFamily: "Inter, sans-serif",
            }}
          >
            Turn your product idea into a ready-to-use UGC video.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.2, md: 1.5 }, flexShrink: 0 }}>
          {/* User-friendly Available Balance Pill */}
          <Tooltip title="Your Available AI Credits (Click to buy more)" arrow placement="top">
            <Box
              onClick={() => setOpenSubscriptionModal(true)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: { xs: 0.6, sm: 0.8 },
                bgcolor: "#FFFFFF",
                border: "1.5px solid #FF157233",
                borderRadius: "53px",
                px: { xs: 1.2, sm: 1.6, md: 2 },
                py: { xs: 0.5, sm: 0.7 },
                height: { xs: "34px", sm: "38px", md: "40px" },
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(255, 20, 117, 0.08)",
                transition: "all 0.2s ease-in-out",
                userSelect: "none",
                "&:hover": {
                  borderColor: "#FF1572",
                  bgcolor: "#FFF0F5",
                  transform: "translateY(-1px)",
                  boxShadow: "0 3px 8px rgba(255, 20, 117, 0.18)",
                },
              }}
            >
              <AutoAwesomeIcon
                sx={{
                  color: "#FF1572",
                  fontSize: { xs: "14px", sm: "16px", md: "18px" },
                }}
              />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "11px", sm: "12.5px", md: "13px" },
                  fontWeight: 600,
                  color: "#333333",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.4,
                  whiteSpace: "nowrap",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: "#FF1572",
                    fontWeight: 700,
                    fontSize: { xs: "12px", sm: "13px", md: "14px" },
                  }}
                >
                  {loadingBalance && balanceData === null
                    ? "..."
                    : getAvailableCredits().toLocaleString()}
                </Box>
                <Box
                  component="span"
                  sx={{
                    color: "#666666",
                    fontWeight: 500,
                    fontSize: { xs: "10.5px", sm: "12px" },
                    display: { xs: "none", sm: "inline" },
                  }}
                >
                  Credits
                </Box>
              </Typography>
            </Box>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={
              <AddToPhotosOutlinedIcon
                sx={{
                  fontSize: { xs: "16px !important", sm: "18px !important" },
                }}
              />
            }
            onClick={handleCreateClick}
            sx={{
              bgcolor: "#FF1572",
              color: "#ffffff",
              borderRadius: "53px",
              px: { xs: 1.5, sm: 2.2, md: 2.8 },
              py: { xs: 0.6, sm: 0.8, md: 1 },
              height: { xs: "34px", sm: "38px", md: "40px" },
              fontSize: { xs: "12px", sm: "13.5px", md: "14px" },
              fontWeight: 600,
              textTransform: "none",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              "&:hover": {
                bgcolor: "#FF1572",
                boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Create
          </Button>
        </Box>
      </Box>

      {/* AI Subscription Modal (when subscriptions is false) */}
      <AiSubscriptionModal
        open={openSubscriptionModal}
        onClose={() => setOpenSubscriptionModal(false)}
        setSubscriptionsTrue={setSubscriptionsTrue}
        onSubscribe={() => {
          setSubscriptionsTrue(true);
          fetchBalance();
          setOpenSubscriptionModal(false);
          setOpenContentTypeModal(true);
        }}
      />

      {/* Select AI Content Type Modal (when subscriptions is true) */}
      <SelectAiContentTypeModal
        open={openContentTypeModal}
        onClose={() => setOpenContentTypeModal(false)}
        onSelect={handleContentTypeSelect}
      />
    </>
  );
};

export default AiContentBanner;



