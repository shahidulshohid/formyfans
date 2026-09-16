import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import CustomInput from "../cutomInput";
import SearchIcon from "../../assets/icon/search-brown.svg";
import ChatIcon from "../../assets/icon/chat.svg";
import { getMarketplaceNavItems } from "../../constants/marketplaceNav";

const MarketplaceNavBar = ({ activePath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getMarketplaceNavItems();
  const currentPath = activePath ?? location.pathname;

  return (
    <Box
      bgcolor="background.deepPink"
      mt={{ xs: 2, md: 6 }}
      px={{ xs: 2, md: 3 }}
      py={1.5}
      mb={4}
      borderRadius="40px"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 2, md: 2 },
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Typography
          fontSize={{ xs: "18px", md: "22px" }}
          fontWeight={600}
          color="neutral.darkBrown"
          onClick={() => navigate("/market-place")}
          sx={{
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          Market Place
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: "12px", md: "20px", lg: "28px" },
            flex: 1,
            minWidth: 0,
            flexWrap: "nowrap",
            overflowX: { xs: "auto", md: "visible" },
            py: { xs: 0.5, md: 0 },
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {navItems.map((item) => {
            const isActive = item.path && currentPath === item.path;
            return (
              <Box
                key={item.iconName}
                display="flex"
                alignItems="center"
                gap="6px"
                onClick={() => item.path && navigate(item.path)}
                sx={{
                  cursor: item.path ? "pointer" : "default",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  "&:hover": item.path ? { opacity: 0.85 } : {},
                }}
              >
                <Box
                  component="img"
                  src={item.icon}
                  alt=""
                  sx={{ width: 18, height: 18, flexShrink: 0 }}
                />
                <Typography
                  fontSize={{ xs: "11px", sm: "12px", md: "13px" }}
                  fontWeight={isActive ? 700 : 500}
                  color={isActive ? "neutral.darkBrown" : "neutral.white"}
                  sx={{
                    textDecoration: isActive ? "underline" : "none",
                    lineHeight: 1.2,
                  }}
                >
                  {item.iconName}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ flexShrink: 0, width: { xs: "100%", md: 260 } }}>
          <CustomInput
            placeholder="Search By Name"
            InputStartIcon={<img src={SearchIcon} alt="search" />}
            InputEndIcon={<img src={ChatIcon} alt="chat" width={26} />}
            sx={{
              width: "100%",
              ml: { xs: 0, md: "auto" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "neutral.white",
                borderRadius: "20px",
                height: "40px",
                "& fieldset": { border: "none" },
              },
              "& .MuiInputBase-input": {
                fontSize: "14px",
                color: "text.darkBrown",
                padding: "8px 10px",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MarketplaceNavBar;
