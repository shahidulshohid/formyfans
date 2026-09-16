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
import { useLocation, useNavigate } from "react-router-dom";
import { useResetPassword } from "../../../hook/resetPassword";
import { toast } from "react-toastify";

const NewPassword = () => {
    const banners = [Banner1, Banner2, Banner3, Banner4]; 
    const [currentBanner, setCurrentBanner] = useState(0); 
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    const otp = location.state?.otp || "";
    const { submitResetPassword, loading } = useResetPassword();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length); 
        }, 2000); 
        return () => clearInterval(interval); 
    }, []);

    const handleSignUp = async () => {
        const nextErrors = {
            newPassword: "",
            confirmPassword: "",
        };

        if (!newPassword) {
            nextErrors.newPassword = "New password is required";
        } else if (newPassword.length < 6) {
            nextErrors.newPassword = "Password must be at least 6 characters";
        }

        if (!confirmPassword) {
            nextErrors.confirmPassword = "Confirm password is required";
        } else if (newPassword !== confirmPassword) {
            nextErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) return;

        if (!email || !otp) {
            toast.error("Session expired. Please verify OTP again.");
            navigate("/enter-email");
            return;
        }

        const response = await submitResetPassword({
            email,
            otp,
            newPassword,
        });

        if (!response) return;
        toast.success("Password changed successfully");
        navigate("/");
    };
    return (
        <Grid container minHeight="100vh">

            {/* LEFT SIDE – FORM */}
            <Grid item size={{ xs: 12, md: 6 }} >
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
                            Create New Password
                        </Typography>

                        {/* New Password */}
                        <Box mb={3}>
                            <Label title="New Password" style={{ fontWeight: 500, fontSize: "16px", color: "#3D1428" }} />
                            <CustomInput
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setErrors((prev) => ({ ...prev, newPassword: "" }));
                                }}
                                error={Boolean(errors.newPassword)}
                                helperText={errors.newPassword}
                                borderRadius={'8px'}
                                backgroundColor={'#FFFFFF'}
                                placeholder="Password"
                                type="password"
                            />
                        </Box>

                        {/* Confirm Password */}
                        <Box mb={4}>
                            <Label title="Confirm Password" style={{ fontWeight: 500, fontSize: "16px", color: "#3D1428" }} />
                            <CustomInput
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                                }}
                                error={Boolean(errors.confirmPassword)}
                                helperText={errors.confirmPassword}
                                borderRadius={'8px'}
                                backgroundColor={'#FFFFFF'}
                                type="password"
                                placeholder="Password"
                            />
                        </Box>

                        {/* Change Password Button */}
                        <Box mb={2}>
                            <CustomButton
                                title="Change Password"
                                width="100%"
                                sx={{ cursor: "pointer" }}
                                handleClickBtn={handleSignUp}
                                bgcolor={"#FF1572"}
                                color={"#fff"}
                                disabled={loading}
                            />
                        </Box>
                    </Box>

                </Box>
            </Grid>

            {/* RIGHT SIDE – IMAGE */}
            <Grid item size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
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

        </Grid >
    );
};

export default NewPassword;
