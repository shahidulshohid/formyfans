import { Box, Typography } from "@mui/material"
import { useState, useEffect } from "react"
import logo from "../../assets/images/logo.png"
import BackBtn from "../../assets/icon/back-btn.svg"
import logout1 from "../../assets/images/logout1.png"
import logout2 from "../../assets/images/logout2.png"
import logout3 from "../../assets/images/logout3.png"
import logout4 from "../../assets/images/logout4.png"

const Logout = () => {
    const backBtn = () => {
        window.history.back();
    };
    const images = [logout1, logout2, logout3, logout4]
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                height: "100vh",
                width: "100vw",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 9999,
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    minHeight: { xs: "50%", md: "100%" },
                }}
            >
                <Box
                    component="img"
                    src={images[currentIndex]}
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "opacity 0.5s ease-in-out",
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.3)",
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: { xs: 20, md: 40 },
                        left: { xs: 20, md: "auto" },
                        right: { xs: "auto", md: 40 },
                        zIndex: 10,
                        cursor: "pointer",
                    }}
                    onClick={backBtn}
                >
                    <img src={BackBtn} alt="Back" style={{ width: 40, height: 40 }} />
                </Box>
                <Box
                    sx={{
                        position: "absolute",
                        top: { xs: 20, md: 40 },
                        left: { xs: 70, md: 90 },
                        zIndex: 2,
                    }}
                >
                    <img
                        src={logo}
                        alt="ForMyFansOnly"
                        style={{ width: 50, height: 50, objectFit: "contain" }}
                    />
                </Box>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 2,
                    }}
                >
                    <Typography
                        sx={{
                            color: "#fff",
                            fontSize: { xs: 32, md: 48 },
                            fontWeight: 800,
                            letterSpacing: "4px",
                            textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
                        }}
                    >
                        CREATORS
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                    minHeight: { xs: "50%", md: "100%" },
                }}
            >
                <Box
                    component="img"
                    src={images[(currentIndex + 2) % images.length]}
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "opacity 0.5s ease-in-out",
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.3)",
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 2,
                    }}
                >
                    <Typography
                        sx={{
                            color: "#fff",
                            fontSize: { xs: 32, md: 48 },
                            fontWeight: 800,
                            letterSpacing: "4px",
                            textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
                        }}
                    >
                        FANS
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default Logout