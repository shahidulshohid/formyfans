import { Box, Grid, Typography } from "@mui/material";
import Banner1 from "../../../assets/images/animation-image1.png";
import Banner2 from "../../../assets/images/animation-image2.png";
import Banner3 from "../../../assets/images/animation-image3.png";
import Banner4 from "../../../assets/images/animation-image4.png";
import BackgroundBanner from "../../../assets/images/backgroundBanner.png";
import Logo from "../../../assets/images/logo.png";
import CustomButton from "../../../components/cutomButon";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OtpInput from "react-otp-input";

const ForgotPassword = () => {
  const banners = [Banner1, Banner2, Banner3, Banner4];
  const [currentBanner, setCurrentBanner] = useState(0);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value) => {
    const cleanedValue = value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);
    setOtp(cleanedValue);
  };

  const AddEmail = async () => {
    const otpValue = otp;
    if (otpValue.length !== 6) {
      toast.error("Please enter valid OTP");
      return;
    }

    if (!email) {
      toast.error("Email not found. Please enter email again.");
      navigate("/enter-email");
      return;
    }

    navigate("/new-password", {
      state: { email, otp: otpValue },
    });
  };
  return (
    <Grid container minHeight="100vh">
      {/* LEFT SIDE – FORM */}
      <Grid item size={{ xs: 12, md: 6 }}>
        <Box
          sx={{
            backgroundImage: `url(${BackgroundBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box width="100%" maxWidth="420px" px={3}>
            {/* Logo */}
            <Box textAlign="center" mb={3}>
              <img src={Logo} width={120} />
            </Box>

            {/* Title */}
            <Typography
              textAlign="center"
              fontSize="28px"
              fontWeight={600}
              color="#3D1428"
              mb={4}
            >
              Forgot Password ?
            </Typography>

            {/* OTP Input Fields */}
            <Box display="flex" justifyContent="center" mb={3}>
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
                    style={{
                      width: "61px",
                      height: "80px",
                      backgroundColor: "#FF1572",
                      borderRadius: "20px",
                      border: "2px solid transparent",
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

            {/* Email Verification Message */}
            <Typography
              textAlign="center"
              fontSize="13px"
              color="#B5BAC1"
              mb={4}
              sx={{ lineHeight: 1.6 }}
            >
              We have sent the code verification to your email
              <Box
                component="div"
                sx={{ color: "#00000040", fontWeight: 600, mt: 0.5 }}
              >
                {email || "-"}
              </Box>
            </Typography>

            {/* Continue Button */}
            <Box mb={3}>
              <Box mb={3}>
                <CustomButton
                  title="Continue"
                  width="100%"
                  bgcolor={"#FF1572"}
                  color={"#fff"}
                  height={42}
                  sx={{ cursor: "pointer" }}
                  handleClickBtn={AddEmail}
                />
              </Box>
            </Box>

            {/* Resend Code Link */}
            <Typography
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
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* RIGHT SIDE – IMAGE */}
      <Grid
        item
        size={{ xs: 12, md: 6 }}
        sx={{ display: { xs: "none", md: "block" } }}
      >
        <Box
          sx={{
            backgroundImage: `url(${banners[currentBanner]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
            transition: "opacity 1s ease-in-out",
          }}
        />
      </Grid>
    </Grid>
  );
};

export default ForgotPassword;
