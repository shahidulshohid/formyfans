import EmailIcon from "@mui/icons-material/Email";
import { Box, FormHelperText, Typography } from "@mui/material";
import { useState } from "react";
import OtpInput from "react-otp-input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "../../../assets/images/logo.png";
import { AuthContainer } from "../../../components/container";
import CustomButton from "../../../components/cutomButon";
import { useCreateAccount } from "../../../hook/signUp";
import useSignupData from "../../../zustand/useSignupData";
import useUserStore from "../../../zustand/userUserStore";

const VerificationCode = () => {
  // Store OTP
  const [otp, setOtp] = useState("");
  // Store OTP Error
  const [otpError, setOtpError] = useState("");
  // Navigation Hook
  const navigate = useNavigate();
  // Create Account Hook
  const { createAcount, loading } = useCreateAccount();
  // Store Signup Data
  const { signupData, clearSignupData } = useSignupData();
  // Store Auth Data
  const { setAuthData } = useUserStore();

  if (!signupData) {
    toast.error("Signup data not found. Please create your account again.");
    navigate("/create-account");
    return;
  }

  const handleOtpChange = (value) => {
    const cleanedValue = value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);

    setOtp(cleanedValue);
    setOtpError("");
  };

  const handleVerifyOtpAndCreateAccount = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter valid OTP");
      return;
    }

    const payload = {
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      email: signupData.email,
      username: signupData.username,
      role: signupData.role,
      password: signupData.password,
      image: signupData.image,
      otp: otp,
      role: "user",
    };

    const response = await createAcount(payload);
    if (!response) return;
    toast.success(response.message);

    const user = { ...response.user, moveToSubscription: true };
    const token = response.token;
    if (!user || !token) return toast.error("Invalid user or token");

    setAuthData({ user, token });
    clearSignupData();

    // navigate("/subscription-plans");
  };
  return (
    <AuthContainer>
      {/* Logo */}
      <Box textAlign="center">
        <img src={Logo} width={120} />
      </Box>

      {/* Title */}
      <Typography
        textAlign="center"
        fontSize="28px"
        fontWeight={600}
        color="#3D1428"
        mb={2}
      >
        Verification Code
      </Typography>

      {/* Envelope Icon */}
      <Box textAlign="center" mb={3}>
        <EmailIcon
          sx={{
            fontSize: 60,
            color: "#FF1572",
          }}
        />
      </Box>

      {/* OTP Input Fields */}
      <Box display="flex" justifyContent="center" mb={otpError ? 0.5 : 3}>
        <OtpInput
          value={otp}
          onChange={handleOtpChange}
          numInputs={6}
          shouldAutoFocus
          inputType="text"
          containerStyle={{
            justifyContent: "center",
            gap: "12px",
          }}
          renderInput={(props) => (
            <input
              {...props}
              aria-invalid={Boolean(otpError)}
              style={{
                width: "61px",
                height: "80px",
                backgroundColor: "#FF1572",
                borderRadius: "20px",
                border: otpError
                  ? "2px solid #d32f2f"
                  : "2px solid transparent",
                textAlign: "center",
                fontSize: "24px",
                fontWeight: 600,
                color: "#fff",
                fontFamily: "Montserrat",
                outline: "none",
              }}
            />
          )}
        />
      </Box>
      {otpError && (
        <FormHelperText
          error
          sx={{ textAlign: "center", display: "block", mb: 2 }}
        >
          {otpError}
        </FormHelperText>
      )}

      {/* Email Verification Message */}
      <Typography
        textAlign="center"
        fontSize="14px"
        color="#B5BAC1"
        mb={2}
        sx={{ lineHeight: 1.6 }}
      >
        We have sent the code verification to your email
        <Box component="div" sx={{ color: "#00000040", fontWeight: 600 }}>
          {signupData.email || "-"}
        </Box>
      </Typography>

      {/* Continue Button */}
      <Box mb={3}>
        <CustomButton
          title="Continue"
          width={442}
          bgcolor={"#FF1572"}
          color={"#fff"}
          height={42}
          sx={{ cursor: "pointer" }}
          handleClickBtn={handleVerifyOtpAndCreateAccount}
          loading={loading}
          disabled={loading}
        />
      </Box>
      {/* Resend Code Link */}
      {/* <Typography
        textAlign="center"
        fontSize="14px"
        sx={{
          color: "#FF1572",
          cursor: "pointer",
          fontWeight: 400,
          "&:hover": {
            textDecoration: "underline",
          },
        }}
      >
        Resend Code
      </Typography> */}
    </AuthContainer>
  );
};

export default VerificationCode;
