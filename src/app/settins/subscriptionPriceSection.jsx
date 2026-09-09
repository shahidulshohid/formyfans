import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCreatorSubscriptionPrice } from "../../api/modules/profile";
import SettingIcon from "../../assets/icon/setting.svg";
import CustomButton from "../../components/cutomButon";
import { SetCreatorSubscriptionPriceDialog } from "../../components/dialogs/SetPriceDialog";
import SettingHeader from "../../components/settingHeader";
import CreatorSubscriptionPrice from "../../screens/subscriptionPrice/SubscriptionPrice";

const SubscriptionPriceSection = () => {
  const navigate = useNavigate();
  const openPriceDialog = useRef();
  const [subscriptionPrice, setSubscriptionPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSubscriptionPrice = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCreatorSubscriptionPrice();
      if (res.data?.status === "success") {
        setSubscriptionPrice(res.data.data ?? null);
      } else {
        setSubscriptionPrice(null);
      }
    } catch (err) {
      setSubscriptionPrice(null);
      if (err?.response?.status !== 404) {
        toast.error(err?.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionPrice();
  }, [fetchSubscriptionPrice]);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <SettingHeader title="Set Subsctiption Price" icon={SettingIcon} />

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: "#FF1572" }} />
        </Box>
      ) : subscriptionPrice ? (
        <CreatorSubscriptionPrice
          plan={subscriptionPrice}
          onUpdatePrice={() =>
            openPriceDialog.current.open({
              price: subscriptionPrice?.subscriptionPrice,
            })
          }
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
            No Subscription Price Found
          </Typography>
          <Typography fontSize={14} color="text.secondary" mb={2}>
            Please set your subscription price so fans can subscribe to you and
            view your exclusive content. You can manage your plan from here.
          </Typography>
          <Stack direction="row" justifyContent="center" gap={2}>
            <CustomButton
              title="Set Price"
              width="180px"
              height="44px"
              bgcolor="#FF1572"
              color="#fff"
              radius={999}
              handleClickBtn={() => openPriceDialog.current.open()}
            />
          </Stack>
        </Box>
      )}

      <SetCreatorSubscriptionPriceDialog
        ref={openPriceDialog}
        onSuccess={fetchSubscriptionPrice}
      />
    </Box>
  );
};

export default SubscriptionPriceSection;
