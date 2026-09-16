import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { USER_ROLES } from "../productForm/constants";
import { getProfileCompletion } from "../../utils/helper";
import useProfileIncompleteDialogStore from "../../zustand/profileIncompleteDialogStore";
import useUserStore from "../../zustand/userUserStore";
import { DialogActionButtons } from "./DialogActions";
import { DialogBody } from "./DialogBody";
import { DialogBox } from "./DialogBox";
import { DialogHeader } from "./DialogHeader";

export const ProfileIncompleteDialog = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { open, closeProfileIncompleteDialog } =
    useProfileIncompleteDialogStore();

  const completion = getProfileCompletion(user);
  const shouldRender =
    open &&
    user?.role === USER_ROLES.CREATOR &&
    !completion.isComplete;

  const handleCompleteProfile = () => {
    closeProfileIncompleteDialog();
    navigate("/settings/account");
  };

  return (
    <DialogBox
      open={shouldRender}
      onClose={closeProfileIncompleteDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogHeader
        title="Complete Your Profile"
        secondaryHeading={`${completion.percentage}% complete`}
        onClose={closeProfileIncompleteDialog}
        icon={<AccountCircleOutlinedIcon />}
      />

      <DialogBody>
        <Box textAlign="center">
          <Typography
            fontSize={15}
            fontWeight={500}
            color="text.secondary"
            lineHeight={1.7}
          >
            Your profile is not fully complete yet. Add your remaining details
            to get a better experience on FormyFans and help other users
            discover you in the creator list.
          </Typography>

          <Box
            mt={2.5}
            p={2}
            borderRadius="12px"
            bgcolor="rgba(255, 21, 114, 0.08)"
            border="1px solid rgba(255, 21, 114, 0.2)"
          >
            <Typography fontSize={13} fontWeight={600} color="#5E1321">
              {completion.completed} of {completion.total} profile steps done
            </Typography>
            <Typography fontSize={12} color="#8B92A4" mt={0.5}>
              A complete profile helps fans find and follow you faster.
            </Typography>
          </Box>
        </Box>
      </DialogBody>

      <DialogActionButtons
        onCancel={closeProfileIncompleteDialog}
        onConfirm={handleCompleteProfile}
        cancelText="Maybe Later"
        confirmText="Complete Your Profile"
        confirmProps={{
          sx: {
            bgcolor: "#FF1572",
            color: "#fff",
            "&:hover": { bgcolor: "#E0115F" },
          },
        }}
        cancelProps={{
          sx: {
            color: "#5E1321",
            borderColor: "#5E1321",
          },
        }}
      />
    </DialogBox>
  );
};

export default ProfileIncompleteDialog;
