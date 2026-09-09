import { Box, Grid, Stack } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { changePassword } from "../../api/modules/profile";
import PasswordIcon from "../../assets/icon/password.svg";
import CustomButton from "../../components/cutomButon";
import { AppInput } from "../../components/input";
import SettingHeader from "../../components/settingHeader";
import { changePasswordValidation } from "../../utils/validation";

const initialChangePasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const ChangePassword = () => {
  // Store Loading State
  const [loading, setLoading] = useState({
    changePassword: false,
  });

  // Change Password Values
  const [changePasswordValues, setChangePasswordValues] = useState(
    initialChangePasswordValues,
  );
  // Store Change Password Errors
  const [changePasswordErrors, setChangePasswordErrors] = useState({});
  const handleChangePassword = async () => {
    const validate = changePasswordValidation(
      changePasswordValues,
      setChangePasswordErrors,
    );
    if (validate) return;

    try {
      const payload = {
        ...changePasswordValues,
      };
      setLoading((prev) => ({
        ...prev,
        changePassword: true,
      }));
      const response = await changePassword(payload);
      if (response?.status === 200 || response?.status === 201) {
        toast.success("Password changed successfully");
        setChangePasswordValues(initialChangePasswordValues);
        setChangePasswordErrors({});
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setLoading((prev) => ({
        ...prev,
        changePassword: false,
      }));
    }
  };

  const handleChangeChangePasswordValue = (event) => {
    const { name, value } = event.target;
    setChangePasswordValues((prev) => ({ ...prev, [name]: value }));
    setChangePasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <SettingHeader title="Change Your Password" icon={PasswordIcon} />

      {/* Password Form */}
      <Box sx={{ px: { xs: 0.5, md: 1 } }}>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12 }}>
            <AppInput
              variantStyles="darkBrown"
              inputLabel="Current Password"
              type="password"
              placeholder="Enter Your Current Password"
              fullWidth
              required
              size="small"
              name="currentPassword"
              value={changePasswordValues?.currentPassword || ""}
              onChange={handleChangeChangePasswordValue}
              error={Boolean(changePasswordErrors?.currentPassword)}
              helperText={changePasswordErrors?.currentPassword}
              withPasswordToggle={true}
            />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <AppInput
              variantStyles="darkBrown"
              inputLabel="New Password"
              type="password"
              placeholder="Enter Your New Password"
              fullWidth
              required
              size="small"
              name="newPassword"
              value={changePasswordValues?.newPassword || ""}
              onChange={handleChangeChangePasswordValue}
              error={Boolean(changePasswordErrors?.newPassword)}
              helperText={changePasswordErrors?.newPassword}
              withPasswordToggle={true}
            />
          </Grid>

          <Grid item size={{ xs: 12 }}>
            <AppInput
              variantStyles="darkBrown"
              inputLabel="Repeat New Password"
              type="password"
              placeholder="Enter Your Confirm New Password"
              fullWidth
              required
              size="small"
              name="confirmNewPassword"
              value={changePasswordValues?.confirmNewPassword || ""}
              onChange={handleChangeChangePasswordValue}
              error={Boolean(changePasswordErrors?.confirmNewPassword)}
              helperText={changePasswordErrors?.confirmNewPassword}
              withPasswordToggle={true}
            />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <CustomButton
            title="Change Password"
            handleClickBtn={handleChangePassword}
            loading={loading?.changePassword}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default ChangePassword;
