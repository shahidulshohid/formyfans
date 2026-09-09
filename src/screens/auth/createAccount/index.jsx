import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  checkUsernameAvailability,
  suggestUsername,
} from "../../../api/modules/signUp";
import Logo from "../../../assets/images/logo.png";
import { AuthContainer } from "../../../components/container";
import CustomButton from "../../../components/cutomButon";
import CustomInput from "../../../components/cutomInput";
import Label from "../../../components/label";
import ProfileImageUpload from "../../../components/profileImageUpload";
import { USERNAME_REGEX } from "../../../constants/regex";
import { useSendOtp } from "../../../hook/sendOtp";
import { createAccountValidation } from "../../../utils/validation";
import useSignupData from "../../../zustand/useSignupData";

const USERNAME_CHECK_DELAY = 500;
const USERNAME_SUGGEST_DELAY = 600;

const initialFormValues = {
  image: null,
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
};

const CreateAccount = () => {
  // Navigation Hook
  const navigate = useNavigate();
  // Store Form Values
  const [formValues, setFormValues] = useState(initialFormValues);
  // Store Errors
  const [errors, setErrors] = useState({});
  // Store Image Uploading
  const [isImageUploading, setIsImageUploading] = useState(false);
  // Store Username Status
  const [usernameStatus, setUsernameStatus] = useState("idle");
  // Store Username Manually Edited
  const isUsernameManuallyEdited = useRef(false);
  // Send OTP Hook
  const { requestOtp, loading: otpLoading } = useSendOtp();
  // Store Signup Data
  const { signupData, setSignupData } = useSignupData();
  // Check Username
  const isCheckingUsername = usernameStatus === "checking";
  // Store Username Ready
  const isUsernameReady = usernameStatus === "available";

  // Suggest Username
  useEffect(() => {
    const firstName = formValues.firstName.trim();
    const lastName = formValues.lastName.trim();

    if (!firstName || !lastName || isUsernameManuallyEdited.current) {
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await suggestUsername({ firstName, lastName });
        if (cancelled) return;

        if (response?.status === 200 || response?.status === 201) {
          const suggestedUsername = response?.data?.username;
          if (suggestedUsername) {
            setFormValues((prev) => ({
              ...prev,
              username: suggestedUsername,
            }));
          }
        }
      } catch {
        // ignore suggestion errors
      }
    }, USERNAME_SUGGEST_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [formValues.firstName, formValues.lastName]);

  // Check Username
  useEffect(() => {
    const username = formValues.username.trim().toLowerCase();

    if (!username) {
      setUsernameStatus("idle");
      return undefined;
    }

    if (username.length < 3) {
      setUsernameStatus("invalid");
      setErrors((prev) => ({
        ...prev,
        username: "Username must be at least 3 characters",
      }));
      return undefined;
    }

    if (!USERNAME_REGEX.test(username)) {
      setUsernameStatus("invalid");
      setErrors((prev) => ({
        ...prev,
        username:
          "Username can only use letters, numbers, periods and underscores",
      }));
      return undefined;
    }

    let cancelled = false;
    setUsernameStatus("checking");
    setErrors((prev) => ({ ...prev, username: "" }));

    const timer = setTimeout(async () => {
      try {
        const response = await checkUsernameAvailability({ username });
        if (cancelled) return;

        const isAvailable =
          response?.data?.isAvailable === true ||
          (response?.status === 200 && response?.data?.status === "success");

        if (isAvailable) {
          setUsernameStatus("available");
          setErrors((prev) => ({ ...prev, username: "" }));
          return;
        }

        setUsernameStatus("taken");
        setErrors((prev) => ({
          ...prev,
          username: response?.data?.message || "Username is already taken",
        }));
      } catch {
        if (!cancelled) {
          setUsernameStatus("idle");
          setErrors((prev) => ({
            ...prev,
            username: "Unable to check username. Please try again.",
          }));
        }
      }
    }, USERNAME_CHECK_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [formValues.username]);

  // Handle Input Change Event
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle Username Change Event
  const handleUsernameChange = (event) => {
    const sanitizedValue = event.target.value
      .toLowerCase()
      .replace(/[^a-z0-9._]/g, "");
    isUsernameManuallyEdited.current = true;
    setFormValues((prev) => ({ ...prev, username: sanitizedValue }));
    setErrors((prev) => ({ ...prev, username: "" }));
  };

  // Handle Profile Image Change Event
  const handleProfileImageChange = (imageUrl) => {
    setFormValues((prev) => ({ ...prev, image: imageUrl }));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  // Handle Create Account Event
  const createAccount = async () => {
    const validationResult = createAccountValidation(
      formValues,
      { isUsernameReady, usernameStatus },
      setErrors,
    );
    if (!validationResult) return;

    const otpResponse = await requestOtp({ email: formValues.email });
    if (!otpResponse) return;

    toast.success(otpResponse.message);
    setSignupData({
      ...formValues,
    });
    navigate("/verification-code", { state: formValues });
  };

  const usernameEndIcon = isCheckingUsername ? (
    <CircularProgress size={18} sx={{ color: "#FF1572" }} />
  ) : isUsernameReady ? (
    <CheckCircleOutlineIcon sx={{ color: "#2e7d32", fontSize: 20 }} />
  ) : null;

  useEffect(() => {
    if (signupData) {
      setFormValues(signupData);
    }
  }, [signupData]);

  return (
    <AuthContainer>
      <Box textAlign="center">
        <img src={Logo} width={120} alt="Logo" />
      </Box>

      <Typography
        textAlign="center"
        fontSize="28px"
        fontWeight={600}
        color="primary.main"
        mb={2}
      >
        WELCOME
      </Typography>

      <ProfileImageUpload
        value={formValues.image}
        onChange={handleProfileImageChange}
        onUploadingChange={setIsImageUploading}
        error={errors.image}
      />

      <Grid container spacing={2} mb={2}>
        <Grid item size={{ xs: 12, sm: 6 }}>
          <Label
            title="First name"
            style={{ fontWeight: 400, fontSize: "16px" }}
          />
          <CustomInput
            name="firstName"
            value={formValues.firstName}
            onChange={handleInputChange}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
            backgroundColor="#FFFFFF"
            borderRadius="8px"
            placeholder="First name"
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6 }}>
          <Label
            title="Last name"
            style={{ fontWeight: 400, fontSize: "16px" }}
          />
          <CustomInput
            name="lastName"
            value={formValues.lastName}
            onChange={handleInputChange}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
            backgroundColor="#FFFFFF"
            borderRadius="8px"
            placeholder="Last name"
          />
        </Grid>
      </Grid>

      <Box mb={2}>
        <Label title="Email" style={{ fontWeight: 400, fontSize: "16px" }} />
        <CustomInput
          name="email"
          value={formValues.email}
          onChange={handleInputChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
          backgroundColor="#FFFFFF"
          borderRadius="8px"
          placeholder="Email"
        />
      </Box>

      <Box mb={2}>
        <Label title="Username" style={{ fontWeight: 400, fontSize: "16px" }} />
        <CustomInput
          name="username"
          value={formValues.username}
          onChange={handleUsernameChange}
          error={Boolean(errors.username)}
          helperText={errors.username}
          InputEndIcon={usernameEndIcon}
          backgroundColor="#FFFFFF"
          borderRadius="8px"
          placeholder="Username"
          autoComplete="username"
        />
        {isUsernameReady && !errors.username && (
          <Typography fontSize={12} color="#2e7d32" mt={0.5}>
            Username is available
          </Typography>
        )}
      </Box>

      <Box mb={3}>
        <Label
          title="Password"
          style={{
            color: "text.darkBrown",
            fontWeight: 400,
            fontSize: "16px",
          }}
        />
        <CustomInput
          name="password"
          value={formValues.password}
          onChange={handleInputChange}
          error={Boolean(errors.password)}
          helperText={errors.password}
          backgroundColor="#FFFFFF"
          borderRadius="8px"
          type="password"
          placeholder="Password"
        />
      </Box>

      <Typography
        sx={{
          textAlign: "center",
          fontSize: "14px",
          color: "#8B92A4",
          mb: 3,
          lineHeight: 1.6,
        }}
      >
        By signing up to the Design studio of Eureka platform you understand and
        agree with our{" "}
        <Typography
          component="span"
          fontSize="14px"
          color="#FF1572"
          textDecoration="underline"
          sx={{ cursor: "pointer", fontWeight: 500 }}
        >
          Terms of Service and Privacy Policy
        </Typography>
      </Typography>

      <Box mb={2}>
        <CustomButton
          title="Create account"
          width="100%"
          bgcolor="#FF1572"
          color="#fff"
          sx={{ cursor: "pointer" }}
          handleClickBtn={createAccount}
          loading={otpLoading || isImageUploading || isCheckingUsername}
          disabled={otpLoading}
        />
      </Box>

      <Typography
        sx={{
          textAlign: "center",
          fontSize: "14px",
          color: "#8B92A4",
        }}
      >
        Already Haven An Account?{" "}
        <Typography
          component="span"
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            textDecoration: "underline",
            color: "#FF1572",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          Login Now
        </Typography>
      </Typography>
    </AuthContainer>
  );
};

export default CreateAccount;
