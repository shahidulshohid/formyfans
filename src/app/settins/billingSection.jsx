import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCurrentSubscription } from "../../api/modules/subscription";
import SettingIcon from "../../assets/icon/setting.svg";
import CustomButton from "../../components/cutomButon";
import SettingHeader from "../../components/settingHeader";
import CurrentSubscription from "../../screens/subscriptionPlan/CurrentSubscription";

const BillingSection = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCurrentSubscription();
      if (res.data?.status === "success") {
        setSubscription(res.data.subscription ?? null);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      setSubscription(null);
      if (err?.response?.status !== 404) {
        toast.error(err?.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const hasActiveSub =
    subscription &&
    ["trialing", "active", "past_due"].includes(subscription.status);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <SettingHeader title="Manage Billing" icon={SettingIcon} />

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: "#FF1572" }} />
        </Box>
      ) : hasActiveSub ? (
        <CurrentSubscription
          subscription={subscription}
          onChange={fetchSubscription}
          variant="settings"
        />
      ) : (
        <Box
          sx={{
            borderRadius: "12px",
            border: "1px solid rgba(94, 19, 33, 0.15)",
            bgcolor: "#fff",
            p: { xs: 2, sm: 3 },
            textAlign: "center",
          }}
        >
          <Typography fontWeight={600} color="#5E1321" mb={1}>
            No active subscription
          </Typography>
          <Typography fontSize={14} color="text.secondary" mb={2}>
            Subscribe to unlock creator features and manage your plan from here.
          </Typography>
          <Stack direction="row" justifyContent="center" gap={2}>
            <CustomButton
              title="View Plans"
              width="180px"
              height="44px"
              bgcolor="#FF1572"
              color="#fff"
              radius={999}
              handleClickBtn={() => navigate("/subscription-plans")}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default BillingSection;
