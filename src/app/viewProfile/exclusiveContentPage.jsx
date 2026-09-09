import { useEffect, useState } from "react";
import { getFanSubscribeOrNot } from "../../api/modules/profile";
import { useNavigate, useParams } from "react-router-dom";
import useUserStore from "../../zustand/userUserStore";
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ExclusiveContent from "./exclusiveContent";
import CreatorSubscribeButton from "../../screens/subscriptionPrice/CreatorSubscribeButton";
import CancelAndResumeSubscription from "../../screens/subscriptionPrice/CancelAndResumeSubscription";
import { BecomeCreatorCard } from "../../components/cards";
import { USER_ROLES } from "../../components/productForm/constants";

const ExlusiveContentPage = () => {
  const navigate = useNavigate();
  const { tab, username } = useParams();
  const { user } = useUserStore();
  const [fanSubscription, setFanSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isUserOwnExclusiveContentPage = username === user?.username;

  // Is Allowed to post as a creator
  const isAllowedToPost =
    isUserOwnExclusiveContentPage && user.role === USER_ROLES.USER;

  const handleGetFanSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await getFanSubscribeOrNot(username);
      if (response.data.status === "success") {
        setFanSubscription(response.data.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserOwnExclusiveContentPage) {
      handleGetFanSubscription();
    }
  }, [isUserOwnExclusiveContentPage]);

  if (isAllowedToPost) {
    return <BecomeCreatorCard />;
  }

  if (isUserOwnExclusiveContentPage) {
    return (
      <Box mb={3}>
        <ExclusiveContent />
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (fanSubscription?.isSubscribed === false) {
    return (
      <Box mb={3}>
        <Stack alignItems="center" justifyContent="center" py={4}>
          <CreatorSubscribeButton
            creatorUsername={username}
            creatorData={fanSubscription}
            onSuccess={handleGetFanSubscription}
          />
        </Stack>
      </Box>
    );
  }

  if (fanSubscription?.isSubscribed === true) {
    return (
      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <ExclusiveContent customSize={{ xs: 12, md: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CancelAndResumeSubscription
              onSuccess={handleGetFanSubscription}
              creatorData={fanSubscription}
              creatorUsername={username}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return null;
};

export default ExlusiveContentPage;
