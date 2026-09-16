import { Box, Grid, Typography } from "@mui/material";
import Banner1 from "../../../assets/images/animation-image1.png";
import Banner2 from "../../../assets/images/animation-image2.png";
import Banner3 from "../../../assets/images/animation-image3.png";
import Banner4 from "../../../assets/images/animation-image4.png";
import BackgroundBanner from "../../../assets/images/backgroundBanner.png";
import Logo from "../../../assets/images/logo.png";
import Label from "../../../components/label";
import CustomInput from "../../../components/cutomInput";
import CustomButton from "../../../components/cutomButon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForgotEmail } from "../../../hook/forgotEmail";
import { toast } from "react-toastify";

const ForgotEmail = () => {
  const banners = [Banner1, Banner2, Banner3, Banner4];
  const [currentBanner, setCurrentBanner] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const { submitForgotEmail, loading } = useForgotEmail();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Enter a valid email address");
      return;
    }

    const response = await submitForgotEmail({
      email: trimmedEmail,
    });

    if (!response) return;
    toast.success("OTP sent to your email.");
    navigate("/forgot-password", {
      state: { email: trimmedEmail },
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
              Enter Email
            </Typography>

            {/* Email */}
            <Box mb={3}>
              <Label
                title="Email"
                style={{ fontWeight: 500, fontSize: "16px", color: "#3D1428" }}
              />
              <CustomInput
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                error={Boolean(emailError)}
                helperText={emailError}
                borderRadius={"8px"}
                backgroundColor={"#FFFFFF"}
                placeholder="Email"
                type="email"
              />
            </Box>

            <Box mb={2}>
              <CustomButton
                title="Continue"
                width="100%"
                sx={{ cursor: "pointer" }}
                handleClickBtn={handleForgotPassword}
                bgcolor={"#FF1572"}
                color={"#fff"}
                loading={loading}
                disabled={loading}
              />
            </Box>
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

export default ForgotEmail;
