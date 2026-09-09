import { Box, Checkbox, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GoogleIcon from "../../../assets/icon/goole-icon.svg";
import Logo from "../../../assets/images/logo.png";
import { AuthContainer } from "../../../components/container";
import CustomButton from "../../../components/cutomButon";
import CustomInput from "../../../components/cutomInput";
import Label from "../../../components/label";
import { USER_ROLES } from "../../../components/productForm/constants";
import { useLogin } from "../../../hook/login";
import { getProfileCompletion } from "../../../utils/helper";
import { loginValidation } from "../../../utils/validation";
import useProfileIncompleteDialogStore from "../../../zustand/profileIncompleteDialogStore";
import useUserStore from "../../../zustand/userUserStore";
// import { AppInput } from "../../../components/input/AppInput";

const initialFormValues = {
  email: "",
  password: "",
};

const LoginForm = () => {
  // Navigation Hook
  const navigate = useNavigate();
  // Store Errors
  const [errors, setErrors] = useState({});
  // Store Form Values
  const [formValues, setFormValues] = useState(initialFormValues);
  // Login Hook
  const { loginUser, loading } = useLogin();
  // User Store
  const { setAuthData } = useUserStore();
  // Profile Incomplete Dialog
  const openProfileIncompleteDialog = useProfileIncompleteDialogStore(
    (state) => state.openProfileIncompleteDialog,
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSignIn = async () => {
    const validationResult = loginValidation(formValues, setErrors);
    if (!validationResult) return;

    const payload = {
      email: formValues.email.trim(),
      password: formValues.password,
    };

    const response = await loginUser(payload);
    if (!response) return;

    // const user = response.user;
    const user = response.user;
    const token = response.token;
    if (!user || !token) return toast.error("Invalid user or token");

    setAuthData({ user, token });

    if (
      user?.role === USER_ROLES.CREATOR &&
      !getProfileCompletion(user).isComplete
    ) {
      openProfileIncompleteDialog();
    }

    toast.success("Login successful.");
    // navigate("/home");
  };

  return (
    <AuthContainer>
      <Box textAlign="center" mb={2}>
        <img src={Logo} width={120} alt="Logo" />
      </Box>

      <Typography
        textAlign="center"
        fontSize="28px"
        fontWeight={600}
        color="primary.main"
        mb={2}
      >
        WELCOME BACK
      </Typography>

      <Box mb={2}>
        <Label
          title="Email"
          style={{ color: "#3D1428", fontWeight: 400, fontSize: "16px" }}
        />
        <CustomInput
          name="email"
          value={formValues.email}
          onChange={handleInputChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
          borderRadius="3px"
          backgroundColor="#5E1321"
          color="#fff"
          placeholder="Enter email"
        />
        {/* <AppInput
          fullWidth
          size="small"
          variantStyles="darkBrown"
          inputLabel="Email"
          type="email"
          placeholder="Enter email"
          name="email"
          value={formValues.email}
          onChange={handleInputChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
        /> */}
      </Box>

      <Box>
        <Label
          title="Password"
          style={{ color: "#5E1321", fontWeight: 400, fontSize: "16px" }}
        />
        <CustomInput
          name="password"
          value={formValues.password}
          onChange={handleInputChange}
          error={Boolean(errors.password)}
          helperText={errors.password}
          borderRadius="3px"
          backgroundColor="#5E1321"
          color="#fff"
          type="password"
          placeholder="Enter password"
        />
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <Checkbox
            size="small"
            sx={{
              color: "#5E1321",
              "&.Mui-checked": {
                color: "#5E1321",
              },
            }}
          />
          <Typography fontSize="14px" color="#5E1321">
            Remember me
          </Typography>
        </Box>
        <Typography
          fontSize="14px"
          color="#5E1321"
          sx={{
            cursor: "pointer",
            fontWeight: 400,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
          onClick={() => navigate("/enter-email")}
        >
          Forgot Password
        </Typography>
      </Box>

      <Box mb={2} mt={4}>
        <CustomButton
          title="Sign In"
          width="100%"
          bgcolor="#FF1572"
          color="#fff"
          sx={{ cursor: "pointer" }}
          handleClickBtn={handleSignIn}
          loading={loading}
          disabled={loading}
        />
      </Box>

      <Box mb={2}>
        <CustomButton
          title="Create new account"
          width="100%"
          bgcolor="#5E1321"
          color="#fff"
          sx={{ cursor: "pointer" }}
          handleClickBtn={() => navigate("/create-account")}
        />
      </Box>

      <Box>
        <CustomButton
          title="Sign In with Google"
          icon={<img src={GoogleIcon} style={{ marginRight: "8px" }} alt="" />}
          width="100%"
          bgcolor="#FFFFFF"
          color="#FF1572"
          sx={{
            cursor: "pointer",
            border: "1px solid #E5E7EB",
            fontWeight: 700,
            fontSize: "16px",
          }}
        />
      </Box>
    </AuthContainer>
  );
};

export default LoginForm;
