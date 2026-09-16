import { Box, Container, Grid } from "@mui/material";
import { useLocation } from "react-router-dom";
import Header from "../../components/header";
import useUserStore from "../../zustand/userUserStore";
import AccountSection from "./accountSection";
import ActivityLog from "./activityLog";
import BecomeCreator from "./becomeCreator";
import BillingSection from "./billingSection";
import ChangePassword from "./changePassword";
import Logout from "./logout";
import PrivacySection from "./privacySection";
import SettingSection from "./settingSection";
import SubscriptionPriceSection from "./subscriptionPriceSection";

const Settings = () => {
  const location = useLocation();
  const { user } = useUserStore();

  const showBillingTab =
    user?.role === "creator" && user?.isInternalUser === false;

  const showSetSubscriptionPriceTab = user?.role === "creator";

  const showBecomeCreatorTab = user?.role === "user";

  const renderContent = () => {
    const path = location.pathname;

    if (path === "/settings/privacy") {
      return <PrivacySection />;
    }
    if (path === "/settings/activity-log") {
      return <ActivityLog />;
    }
    if (path === "/settings/account") {
      return <AccountSection />;
    }
    if (path === "/settings/password") {
      return <ChangePassword />;
    }
    if (path === "/settings/become-creator" && showBecomeCreatorTab) {
      return <BecomeCreator />;
    }
    if (path === "/settings/billing" && showBillingTab) {
      return <BillingSection />;
    }
    if (path === "/settings/set-price" && showSetSubscriptionPriceTab) {
      return <SubscriptionPriceSection />;
    }
    if (path === "/settings/logout") {
      return <Logout />;
    }
    return <AccountSection />;
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="lg">
        <Grid container spacing={2} mb={2}>
          <Grid item size={{ xs: 12, md: 4 }}>
            <Box>
              <SettingSection />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box>{renderContent()}</Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Settings;
