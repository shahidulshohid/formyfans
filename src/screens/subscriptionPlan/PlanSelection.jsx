import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  createSubscription,
  initiateSubscriptionSetup,
} from "../../api/modules/subscription";
import CustomButton from "../../components/cutomButon";
import { useSubscriptionPlans } from "../../hook/subscription";

const formatPlanPrice = (plan) => {
  const price =
    typeof plan.price === "number"
      ? `$${plan.price}`
      : plan.price
        ? `$${plan.price}`
        : null;

  if (!price) return "-";

  return plan.durationDays
    ? `${price} / ${plan.durationDays} days`
    : `${price} / month`;
};

const normalizePlans = (response) => {
  const apiPlans = response?.plans;

  if (!Array.isArray(apiPlans)) return [];

  return apiPlans
    .filter((plan) => plan.isActive !== false)
    .map((plan) => ({
      _id: plan._id,
      name: plan.name,
      priceLabel: formatPlanPrice(plan),
      features: Array.isArray(plan.features) ? plan.features : [],
      durationDays: plan.durationDays,
    }));
};

function PlanSelection({ onSubscribeStarted }) {
  const { getSubscriptionPlans } = useSubscriptionPlans();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await getSubscriptionPlans();

        if (!response) {
          setPlansError("Could not load subscription plans.");
          return;
        }

        const normalizedPlans = normalizePlans(response);

        if (normalizedPlans.length === 0) {
          setPlansError("No subscription plans are available right now.");
          return;
        }

        setPlans(normalizedPlans);
      } catch {
        setPlansError("Could not load subscription plans.");
      } finally {
        setPlansLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleSubscribe = async (plan) => {
    setLoading(true);
    setError("");
    setSelectedPlanId(plan._id);

    try {
      const response = await initiateSubscriptionSetup({
        planId: plan._id,
      });
      const data = response?.data;

      if (
        response?.status >= 200 &&
        response?.status < 300 &&
        data?.clientSecret
      ) {
        onSubscribeStarted({
          planId: plan._id,
          planName: data.planName,
          clientSecret: data.clientSecret,
          setupIntentId: data.setupIntentId,
          isTrial: data.isTrial ?? false,
          mode: "setup",
        });
      } else {
        setError(data?.message || "Could not start subscription");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setSelectedPlanId(null);
    }
  };

  if (plansLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress sx={{ color: "#FF1572" }} />
      </Box>
    );
  }

  if (plansError) {
    return (
      <Box width="100%" maxWidth={480}>
        <Alert severity="error">{plansError}</Alert>
      </Box>
    );
  }

  return (
    <Box width="100%" maxWidth={720}>
      <Typography
        color="#fff"
        fontSize={{ xs: 18, sm: 20 }}
        fontWeight={600}
        textAlign="center"
        mb={0.5}
      >
        Choose your plan
      </Typography>
      <Typography fontSize={13} color="#E6D3DB" textAlign="center" mb={2}>
        Start with a free trial. Cancel anytime.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} justifyContent="center">
        {plans.map((plan) => (
          <Grid
            key={plan._id}
            size={{ xs: 12, sm: plans.length === 1 ? 8 : 6 }}
          >
            <Box
              sx={{
                height: "100%",
                border: "1px solid #FF1572",
                borderRadius: "12px",
                background:
                  "linear-gradient(180deg, rgba(77, 10, 31, 0.68) 0%, rgba(42, 8, 27, 0.86) 100%)",
                p: { xs: 2, sm: 2.5 },
                color: "#fff",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                fontSize={22}
                fontWeight={700}
                textTransform="capitalize"
              >
                {plan.name}
              </Typography>
              <Typography fontSize={15} color="#E6D3DB" mb={2}>
                {plan.priceLabel}
              </Typography>

              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                flex={1}
                mb={2}
              >
                {plan.features.length > 0 ? (
                  plan.features.map((feature) => (
                    <Box
                      key={feature}
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <CheckCircleOutlineIcon
                        sx={{ fontSize: 18, color: "#FF1572" }}
                      />
                      <Typography fontSize={14} color="#FFFFFFE5">
                        {feature}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography fontSize={14} color="#FFFFFFB3">
                    No features listed for this plan.
                  </Typography>
                )}
              </Box>

              <CustomButton
                title={
                  loading && selectedPlanId === plan._id
                    ? "Starting..."
                    : "Start Free Trial"
                }
                width="100%"
                height="44px"
                bgcolor="#FF1572"
                color="#fff"
                radius={999}
                handleClickBtn={() => handleSubscribe(plan)}
                loading={loading && selectedPlanId === plan._id}
                disabled={loading}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default PlanSelection;
