import { Box, Container, Grid, Typography } from "@mui/material";
import Header from "../../components/header";
import CategoryIcon from "../../assets/icon/category.svg";
import HeartIcon from "../../assets/icon/Heart-white.svg";
import FilterIcon from "../../assets/icon/filter.svg";
import CustomInput from "../../components/cutomInput";
import SearchIcon from "../../assets/icon/search-brown.svg";
import ChatIcon from "../../assets/icon/chat.svg";
import Product from "./product";

const MarketProduct = () => {
    const data = [
        {
            icon: CategoryIcon,
            iconName: "Categories",
        },
        // {
        //     icon: HeartIcon,
        //     iconName: "Liked Products",
        // },
        // {
        //     icon: FilterIcon,
        //     iconName: "Filter",
        // },
        {
            icon: FilterIcon,
            iconName:'my listing',
             path: "/product-listing"
        }
    ];

    return (
        <Box>
            <Header />
            <Container maxWidth="lg">
                <Box
                    bgcolor="background.deepPink"
                    mt={6}
                    px={3}
                    py={1.5}
                    borderRadius="40px"
                >
                    <Grid container alignItems="center">
                        {/* LEFT */}
                        <Grid item size={{ xs: 12, md: 3 }}>
                            <Typography
                                fontSize="22px"
                                fontWeight={600}
                                color="neutral.darkBrown"
                            >
                                Market Place
                            </Typography>
                        </Grid>

                        {/* CENTER */}
                        <Grid item size={{ xs: 12, md: 6 }}>
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                gap="32px"
                            >
                                {data.map((item, index) => (
                                    <Box
                                        key={index}
                                        display="flex"
                                        alignItems="center"
                                        gap="8px"
                                        onClick={() => item.path && navigate(item.path)}
                                    >
                                        <img
                                            src={item.icon}
                                            alt={item.iconName}
                                            width={18}
                                            height={18}
                                        />
                                        <Typography
                                            fontSize="14px"
                                            fontWeight={500}
                                            color="neutral.white"
                                        >
                                            {item.iconName}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>

                        {/* RIGHT */}
                        <Grid item size={{ xs: 12, md: 3 }} >
                            <CustomInput
                                placeholder="Search By Name"
                                InputStartIcon={<img src={SearchIcon} alt="search" />}
                                InputEndIcon={<img src={ChatIcon} alt="chat" width={26} />}
                                sx={{
                                    width: "100%",
                                    maxWidth: "260px",
                                    ml: "auto",
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "neutral.white",
                                        borderRadius: "20px",
                                        height: "40px",
                                        "& fieldset": {
                                            border: "none",
                                        },
                                        "&.Mui-focused fieldset": {
                                            border: "none",
                                        },
                                        "&:hover fieldset": {
                                            border: "none",
                                        },
                                    },
                                    "& .MuiInputBase-input": {
                                        fontSize: "14px",
                                        color: "text.darkBrown",
                                        padding: "8px 10px",
                                        "&::placeholder": {
                                            color: "text.darkBrown",
                                            opacity: 1,
                                        },
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* CONTENT */}
                <Box mt={4}>
                    <Product />
                </Box>
            </Container>
        </Box>
    );
};

export default MarketProduct;