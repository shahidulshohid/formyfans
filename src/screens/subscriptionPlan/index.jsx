import { Box, CircularProgress, Typography } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Banner1 from "../../assets/images/animation-image1.png";
import Banner2 from "../../assets/images/animation-image2.png";
import Banner3 from "../../assets/images/animation-image3.png";
import Banner4 from "../../assets/images/animation-image4.png";
import Logo from "../../assets/images/logo.png";
import { getCurrentSubscription } from "../../api/modules/subscription";
import CustomButton from "../../components/cutomButon";
import { USER_ROLES } from "../../components/productForm/constants";
import { isStripeKeyConfigured, stripePromise } from "../../config/stripe";
import { getProfileCompletion } from "../../utils/helper";
import { applyApiUserUpdate } from "../../utils/syncUser";
import useProfileIncompleteDialogStore from "../../zustand/profileIncompleteDialogStore";
import useUserStore from "../../zustand/userUserStore";
import CheckoutForm from "./CheckoutForm";
import CurrentSubscription from "./CurrentSubscription";
import PlanSelection from "./PlanSelection";

const BANNERS = [Banner1, Banner2, Banner3, Banner4];
const BANNER_INTERVAL_MS = 4500;

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { setUserData, user } = useUserStore();
  const openProfileIncompleteDialog = useProfileIncompleteDialogStore(
    (state) => state.openProfileIncompleteDialog,
  );

  const [currentBanner, setCurrentBanner] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState(null);


  const fetchCurrentSubscription = async () => {
    try {
      const res = await getCurrentSubscription();
      if (res.data.status === "success") {
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
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, BANNER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const clearFreshAccount = (apiUser) => {
    const nextUser = apiUser
      ? { ...apiUser, moveToSubscription: false }
      : user
        ? { ...user, moveToSubscription: false }
        : null;

    if (nextUser) setUserData(nextUser);
    return nextUser;
  };

  const hasActiveSub =
    subscription &&
    ["trialing", "active", "past_due"].includes(subscription.status);

  const handleCheckoutStarted = (data) => {
    if (!isStripeKeyConfigured()) {
      toast.error("Stripe is not configured");
      return;
    }
    setCheckoutData(data);
  };

  const handleSubscriptionSuccess = async (userData) => {
    setCheckoutData(null);
    fetchCurrentSubscription();

    const nextUser = userData
      ? clearFreshAccount(userData)
      : await applyApiUserUpdate(null);

    if (
      (userData || nextUser)?.role === USER_ROLES.CREATOR &&
      !getProfileCompletion(userData || nextUser).isComplete
    ) {
      openProfileIncompleteDialog();
    }
    navigate("/home");
  };

  const handleSkip = () => {
    clearFreshAccount();
    navigate("/home");
  };

  const renderContent = () => {
    if (subscriptionLoading) {
      return (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: "#FF1572" }} />
        </Box>
      );
    }

    if (checkoutData?.clientSecret) {
      return (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret: checkoutData.clientSecret }}
        >
          <CheckoutForm
            checkoutData={checkoutData}
            onSuccess={handleSubscriptionSuccess}
            onCancel={() => setCheckoutData(null)}
          />
        </Elements>
      );
    }

    if (hasActiveSub) {
      return (
        <CurrentSubscription
          subscription={subscription}
          onChange={fetchCurrentSubscription}
        />
      );
    }

    return <PlanSelection onSubscribeStarted={handleCheckoutStarted} />;
  };

  return (
    <Box
      minHeight="100vh"
      overflow="hidden"
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <Box position="fixed" zIndex={0} overflow="hidden" sx={{ inset: 0 }}>
        {BANNERS.map((banner, index) => (
          <Box
            key={banner}
            component="img"
            src={banner}
            alt=""
            position="absolute"
            width="100%"
            height="100%"
            sx={{
              inset: 0,
              objectFit: "cover",
              objectPosition: "center",
              opacity: index === currentBanner ? 1 : 0,
              transform: index === currentBanner ? "scale(1)" : "scale(1.05)",
              transition: "opacity 1.4s ease-in-out, transform 4.5s ease-out",
              willChange: "opacity, transform",
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(rgba(82, 9, 29, 0.85), rgba(82, 9, 29, 0.9))",
          }}
        />
      </Box>

      <Box position="relative" zIndex={1} width="100%" maxWidth={760}>
        <Box
          position="fixed"
          top={{ xs: 12, sm: 20 }}
          right={{ xs: 12, sm: 20 }}
          zIndex={10}
        >
          <CustomButton
            title="Skip"
            width="100px"
            height="40px"
            bgcolor="#FF1572"
            color="#fff"
            radius={5}
            handleClickBtn={handleSkip}
          />
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center">
          <Box
            component="img"
            src={Logo}
            alt="Logo"
            width={{ xs: 88, sm: 108 }}
          />

          <Typography
            color="text.white"
            fontSize={{ xs: "20px", sm: "24px" }}
            fontWeight={600}
            textAlign="center"
            mb={2}
          >
            {checkoutData
              ? "Complete Payment"
              : hasActiveSub
                ? "Your Subscription"
                : "Choose your Subscription Plan"}
          </Typography>

          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default SubscriptionPlans;
